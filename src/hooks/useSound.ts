import { useCallback, useEffect, useRef } from 'react';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Tiny Web Audio synth for UI sounds. Nothing is created or played until the
 * host turns sound on, and every sound is a short, self-terminating blip.
 */
export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const lastTickRef = useRef(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const getContext = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return null;
      try {
        ctxRef.current = new Ctor();
      } catch {
        return null;
      }
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume().catch(() => {});
    return ctxRef.current;
  }, []);

  // Create/resume the context when sound is switched on (this runs right after
  // the toggle click, which browsers accept as the unlocking gesture).
  useEffect(() => {
    if (enabled) getContext();
    else if (ctxRef.current?.state === 'running') void ctxRef.current.suspend().catch(() => {});
  }, [enabled, getContext]);

  useEffect(
    () => () => {
      void ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    [],
  );

  const blip = useCallback(
    (freq: number, duration: number, type: OscillatorType, volume: number, delay = 0) => {
      if (!enabledRef.current) return;
      const ctx = getContext();
      if (!ctx) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    },
    [getContext],
  );

  const playTick = useCallback(() => {
    const now = performance.now();
    if (now - lastTickRef.current < 35) return; // cap the rate while the wheel is fast
    lastTickRef.current = now;
    blip(1900, 0.035, 'triangle', 0.07);
  }, [blip]);

  const playWin = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      blip(freq, i === 3 ? 0.45 : 0.16, 'triangle', 0.14, i * 0.09),
    );
  }, [blip]);

  const playClick = useCallback(() => blip(640, 0.05, 'sine', 0.06), [blip]);

  return { playTick, playWin, playClick };
}
