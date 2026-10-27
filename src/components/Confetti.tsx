import { type CSSProperties, useMemo } from 'react';

const COLORS = ['#8B5CF6', '#F472B6', '#22D3EE', '#FDE047', '#FFFFFF'];

/** A light, CSS-only confetti burst. Hidden entirely under reduced motion. */
export function Confetti({ count = 44 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          background: COLORS[i % COLORS.length],
          width: `${6 + Math.random() * 6}px`,
          height: `${10 + Math.random() * 8}px`,
          animationDelay: `${Math.random() * 0.35}s`,
          animationDuration: `${1.8 + Math.random() * 1.2}s`,
          '--drift': `${(Math.random() * 2 - 1) * 90}px`,
          '--spin': `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540)}deg`,
        } as CSSProperties,
      })),
    [count],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span key={p.id} className="confetti-piece" style={p.style} />
      ))}
    </div>
  );
}
