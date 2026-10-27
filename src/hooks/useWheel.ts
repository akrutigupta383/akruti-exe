import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_SAFE_JITTER,
  SECTION_ANGLE,
  calculateFinalRotation,
  easeOutQuart,
  getNumberAtPointer,
  randomInt,
} from '../utils/wheelMath';

interface UseWheelOptions {
  reducedMotion: boolean;
  /** Called every time a divider passes the pointer. */
  onTick?: () => void;
}

/**
 * Owns the wheel's rotation and spin animation. The rotation is written straight
 * to a CSS custom property each frame (no React re-render per frame), and the
 * spin resolves with the number that is physically under the pointer.
 */
export function useWheel({ reducedMotion, onTick }: UseWheelOptions) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  // Start at rest with section 1 centred under the pointer rather than on a divider.
  const rotationRef = useRef(calculateFinalRotation(0, 1, { fullRotations: 0 }));
  const spinningRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const [isSpinning, setIsSpinning] = useState(false);
  const [landedNumber, setLandedNumber] = useState<number | null>(null);

  const applyRotation = useCallback((deg: number) => {
    rotationRef.current = deg;
    wheelRef.current?.style.setProperty('--wheel-rotation', `${deg}deg`);
  }, []);

  // Keep the DOM in sync if the wheel element remounts.
  useEffect(() => applyRotation(rotationRef.current), [applyRotation]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  /** Spins to `target`. Resolves with the landed number, or null if already spinning. */
  const spinTo = useCallback(
    (target: number): Promise<number | null> => {
      if (spinningRef.current) return Promise.resolve(null);
      spinningRef.current = true;
      setIsSpinning(true);
      setLandedNumber(null);

      const start = rotationRef.current;
      const fullRotations = reducedMotion ? 1 : randomInt(5, 8);
      const duration = reducedMotion ? 1200 : randomInt(4600, 5600);
      const jitter = (Math.random() * 2 - 1) * (MAX_SAFE_JITTER - 1);
      const end = calculateFinalRotation(start, target, { fullRotations, jitter });

      return new Promise((resolve) => {
        let lastDivider = Math.floor(start / SECTION_ANGLE);
        const t0 = performance.now();

        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / duration);
          const deg = t >= 1 ? end : start + (end - start) * easeOutQuart(t);
          applyRotation(deg);

          const divider = Math.floor(deg / SECTION_ANGLE);
          if (divider !== lastDivider) {
            lastDivider = divider;
            onTickRef.current?.();
          }

          if (t < 1) {
            frameRef.current = requestAnimationFrame(step);
            return;
          }
          frameRef.current = null;
          spinningRef.current = false;
          // Verify the result with the same angle logic used to aim the spin.
          const landed = getNumberAtPointer(end);
          if (landed !== target) {
            console.error(`Wheel landed on ${landed} but was aimed at ${target}`);
          }
          setIsSpinning(false);
          setLandedNumber(landed);
          resolve(landed);
        };

        frameRef.current = requestAnimationFrame(step);
      });
    },
    [applyRotation, reducedMotion],
  );

  const isBusy = useCallback(() => spinningRef.current, []);
  const clearLanded = useCallback(() => setLandedNumber(null), []);

  return { wheelRef, isSpinning, landedNumber, spinTo, isBusy, clearLanded };
}
