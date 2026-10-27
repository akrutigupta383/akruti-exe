import { describe, expect, it } from 'vitest';
import { DEFAULT_GAMES, mergeStoredGames } from '../data/games';
import {
  MAX_SAFE_JITTER,
  SECTION_ANGLE,
  SECTION_COUNT,
  WHEEL_NUMBERS,
  calculateFinalRotation,
  getNumberAtPointer,
  normalizeAngle,
  offsetFromSectionCenter,
  pickRandomNumber,
  sectionCenterAngle,
} from './wheelMath';

/** Deterministic PRNG so failures are reproducible. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('wheel geometry', () => {
  it('has 20 equal 18° sections numbered 1–20 clockwise', () => {
    expect(SECTION_COUNT).toBe(20);
    expect(SECTION_ANGLE).toBe(18);
    expect(WHEEL_NUMBERS).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    WHEEL_NUMBERS.forEach((n) => expect(sectionCenterAngle(n)).toBe((n - 1) * 18 + 9));
  });

  it('reads the number under the pointer at rest', () => {
    // Unrotated: the pointer at 0° sits on the divider between 20 and 1, i.e. the start of 1.
    expect(getNumberAtPointer(0)).toBe(1);
    // Rotating clockwise by a few degrees brings section 20 under the pointer.
    expect(getNumberAtPointer(5)).toBe(20);
    expect(getNumberAtPointer(-5)).toBe(1);
    expect(getNumberAtPointer(-20)).toBe(2);
    expect(getNumberAtPointer(360 * 12 - 20)).toBe(2);
  });

  it('normalises any angle into [0, 360)', () => {
    expect(normalizeAngle(720)).toBe(0);
    expect(normalizeAngle(-90)).toBe(270);
    expect(normalizeAngle(1234.5)).toBeCloseTo(154.5);
  });
});

describe('calculateFinalRotation', () => {
  it('lands every number dead centre under the pointer from many starting rotations', () => {
    const starts = [0, 9, 17.999, 18, 179, 359.9, 360, 725.25, 5000.1, -42, 123456.789];
    for (const start of starts) {
      for (const n of WHEEL_NUMBERS) {
        for (let turns = 5; turns <= 8; turns++) {
          const final = calculateFinalRotation(start, n, { fullRotations: turns });
          expect(getNumberAtPointer(final)).toBe(n);
          expect(Math.abs(offsetFromSectionCenter(final, n))).toBeLessThan(1e-6);
          const travelled = final - start;
          expect(travelled).toBeGreaterThanOrEqual(turns * 360);
          expect(travelled).toBeLessThan((turns + 1) * 360);
        }
      }
    }
  });

  it('stays inside the section (never on a divider) with jitter', () => {
    const random = mulberry32(2024);
    let current = 0;
    for (let i = 0; i < 5000; i++) {
      const n = 1 + Math.floor(random() * 20);
      const jitter = (random() * 2 - 1) * 50; // deliberately oversized; must be clamped
      const final = calculateFinalRotation(current, n, { fullRotations: 5 + (i % 4), jitter });
      expect(getNumberAtPointer(final)).toBe(n);
      expect(Math.abs(offsetFromSectionCenter(final, n))).toBeLessThanOrEqual(MAX_SAFE_JITTER + 1e-9);
      expect(final).toBeGreaterThan(current);
      current = final; // rotation keeps accumulating well beyond 360°
    }
    expect(current).toBeGreaterThan(360 * 5000 * 5);
  });

  it('rejects numbers outside 1–20', () => {
    expect(() => calculateFinalRotation(0, 0, { fullRotations: 5 })).toThrow(RangeError);
    expect(() => calculateFinalRotation(0, 21, { fullRotations: 5 })).toThrow(RangeError);
    expect(() => calculateFinalRotation(0, 2.5, { fullRotations: 5 })).toThrow(RangeError);
  });
});

describe('pickRandomNumber', () => {
  it('allows all 20 numbers on the first spin', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 20; i++) seen.add(pickRandomNumber(null, () => i / 20));
    expect([...seen].sort((a, b) => a - b)).toEqual([...WHEEL_NUMBERS]);
  });

  it('never repeats the previous number and can still reach the other 19', () => {
    const random = mulberry32(7);
    let previous: number | null = null;
    for (let i = 0; i < 10000; i++) {
      const next = pickRandomNumber(previous, random);
      expect(next).not.toBe(previous);
      expect(next).toBeGreaterThanOrEqual(1);
      expect(next).toBeLessThanOrEqual(20);
      previous = next;
    }
    for (const prev of WHEEL_NUMBERS) {
      const reachable = new Set<number>();
      for (let i = 0; i < 19; i++) reachable.add(pickRandomNumber(prev, () => i / 19));
      expect(reachable.size).toBe(19);
      expect(reachable.has(prev)).toBe(false);
    }
    // Edge case: random() returning 1 must not overflow the eligible list.
    expect(pickRandomNumber(20, () => 1)).toBe(19);
  });
});

describe('game mapping', () => {
  const expected = [
    'Laugh Like a Villain', 'Invisible Phone Call', 'Reverse Talking', 'News Reporter',
    'Dramatic Proposal', 'Evil Laugh Challenge', 'Freeze Like a Statue', 'Angry Baby', 'Dub It!',
    'NPC Challenge', 'Freeze Dance', 'Two Truths and a Lie', 'Guess the Person', 'Accent Challenge',
    'Finish the Sentence', 'Balloon Keep-Up', 'Random Talent Show', 'Category Countdown',
    'The Random Pair Challenge', 'Meme Caption Contest',
  ];

  it('matches the fixed number-to-game mapping', () => {
    expect(DEFAULT_GAMES).toHaveLength(20);
    DEFAULT_GAMES.forEach((game, i) => {
      expect(game.number).toBe(i + 1);
      expect(game.name).toBe(expected[i]);
      expect(game.instructions.length).toBeGreaterThan(0);
      expect(game.duration.length).toBeGreaterThan(0);
      expect(game.materials.length).toBeGreaterThan(0);
    });
    expect(new Set(DEFAULT_GAMES.map((g) => g.id)).size).toBe(20);
  });

  it('keeps numbers and names fixed when merging stored edits', () => {
    const merged = mergeStoredGames([
      { number: 7, name: 'Hacked', instructions: 'New rules', duration: '1 minute', materials: 'Chalk' },
      { number: 99, instructions: 'ignored' },
      'garbage',
    ]);
    const seven = merged.find((g) => g.number === 7)!;
    expect(seven.name).toBe('Freeze Like a Statue');
    expect(seven.instructions).toBe('New rules');
    expect(seven.duration).toBe('1 minute');
    expect(seven.materials).toBe('Chalk');
    expect(merged.map((g) => g.name)).toEqual(expected);
    expect(mergeStoredGames(null).map((g) => g.instructions)).toEqual(
      DEFAULT_GAMES.map((g) => g.instructions),
    );
  });
});
