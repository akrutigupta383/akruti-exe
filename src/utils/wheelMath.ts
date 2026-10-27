/*
 * Wheel geometry
 * ---------------
 * Angles are measured in degrees, clockwise, with 0° at 12 o'clock (the top).
 * In the wheel's own (unrotated) frame, section `n` (1-based) spans
 * [(n-1)·18°, n·18°), so the numbers run clockwise 1 → 20 starting at the top.
 *
 * The wheel is rotated clockwise by `rotation` degrees. A point at local angle
 * `a` therefore appears on screen at `a + rotation`. The pointer is fixed at
 * POINTER_ANGLE on screen, so the local angle sitting under the pointer is
 * `POINTER_ANGLE - rotation` (normalised to [0, 360)).
 */

export const SECTION_COUNT = 20;
export const SECTION_ANGLE = 360 / SECTION_COUNT; // 18°
export const POINTER_ANGLE = 0; // pointer sits at the top of the wheel

/** Largest jitter that still keeps the pointer well clear of the dividers. */
export const MAX_SAFE_JITTER = SECTION_ANGLE / 2 - 3; // ±6°

export const WHEEL_NUMBERS: readonly number[] = Array.from(
  { length: SECTION_COUNT },
  (_, i) => i + 1,
);

export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function assertWheelNumber(n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > SECTION_COUNT) {
    throw new RangeError(`Wheel number must be an integer between 1 and ${SECTION_COUNT}, got ${n}`);
  }
}

/** Local start angle of a section (where its leading divider sits). */
export function sectionStartAngle(n: number): number {
  assertWheelNumber(n);
  return (n - 1) * SECTION_ANGLE;
}

/** Local centre angle of a section. */
export function sectionCenterAngle(n: number): number {
  return sectionStartAngle(n) + SECTION_ANGLE / 2;
}

/** The local wheel angle currently beneath the pointer. */
export function localAngleAtPointer(rotation: number, pointerAngle = POINTER_ANGLE): number {
  return normalizeAngle(pointerAngle - rotation);
}

/** Which number is physically under the pointer for a given wheel rotation. */
export function getNumberAtPointer(rotation: number, pointerAngle = POINTER_ANGLE): number {
  const index = Math.floor(localAngleAtPointer(rotation, pointerAngle) / SECTION_ANGLE);
  return (index % SECTION_COUNT) + 1;
}

/**
 * Signed distance (degrees) between the pointer and the centre of section `n`,
 * in the range (-180, 180]. 0 means the pointer is dead centre.
 */
export function offsetFromSectionCenter(
  rotation: number,
  n: number,
  pointerAngle = POINTER_ANGLE,
): number {
  const diff = normalizeAngle(localAngleAtPointer(rotation, pointerAngle) - sectionCenterAngle(n));
  return diff > 180 ? diff - 360 : diff;
}

export interface FinalRotationOptions {
  /** Extra complete clockwise turns before landing. */
  fullRotations: number;
  /** Offset (degrees) from the section centre; clamped to ±MAX_SAFE_JITTER. */
  jitter?: number;
  pointerAngle?: number;
}

/**
 * Computes the absolute rotation (degrees, always ≥ currentRotation) that makes
 * the wheel spin clockwise and stop with `targetNumber` beneath the pointer.
 * Works for any currentRotation, including values far above 360°.
 */
export function calculateFinalRotation(
  currentRotation: number,
  targetNumber: number,
  { fullRotations, jitter = 0, pointerAngle = POINTER_ANGLE }: FinalRotationOptions,
): number {
  assertWheelNumber(targetNumber);
  if (!Number.isFinite(currentRotation)) throw new RangeError('currentRotation must be finite');
  const turns = Math.max(0, Math.floor(fullRotations));
  const safeJitter = Math.max(-MAX_SAFE_JITTER, Math.min(MAX_SAFE_JITTER, jitter));

  // We need: localAngleAtPointer(final) === centre + jitter
  //   ⇔ pointer - final ≡ centre + jitter (mod 360)
  //   ⇔ final ≡ pointer - centre - jitter (mod 360)
  const desired = normalizeAngle(pointerAngle - sectionCenterAngle(targetNumber) - safeJitter);
  const forward = normalizeAngle(desired - normalizeAngle(currentRotation));
  return currentRotation + forward + turns * 360;
}

/**
 * Picks a random number from 1–20, excluding only the previous result so the
 * same number never comes up twice in a row. All numbers stay on the wheel.
 */
export function pickRandomNumber(
  previous: number | null,
  random: () => number = Math.random,
): number {
  const eligible = WHEEL_NUMBERS.filter((n) => n !== previous);
  const index = Math.min(eligible.length - 1, Math.floor(random() * eligible.length));
  return eligible[index];
}

export function randomInt(min: number, max: number, random: () => number = Math.random): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/** Smooth, natural deceleration. */
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/** Polar → cartesian with 0° at the top and angles increasing clockwise. */
export function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.sin(rad), y: cy - radius * Math.cos(rad) };
}

/** SVG path for an annular wedge between two clockwise angles. */
export function wedgePath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const o1 = polarToCartesian(cx, cy, outerRadius, startAngle);
  const o2 = polarToCartesian(cx, cy, outerRadius, endAngle);
  const i2 = polarToCartesian(cx, cy, innerRadius, endAngle);
  const i1 = polarToCartesian(cx, cy, innerRadius, startAngle);
  const f = (v: number) => v.toFixed(3);
  return [
    `M ${f(o1.x)} ${f(o1.y)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${f(o2.x)} ${f(o2.y)}`,
    `L ${f(i2.x)} ${f(i2.y)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${f(i1.x)} ${f(i1.y)}`,
    'Z',
  ].join(' ');
}
