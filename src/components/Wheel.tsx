import { type RefObject, memo } from 'react';
import {
  SECTION_ANGLE,
  WHEEL_NUMBERS,
  polarToCartesian,
  sectionCenterAngle,
  sectionStartAngle,
  wedgePath,
} from '../utils/wheelMath';

/** Alternating brand colours; 20 sections ÷ 4 colours keeps the pattern seamless. */
export const SECTION_COLORS = [
  { fill: '#8B5CF6', text: '#FFFFFF' },
  { fill: '#F472B6', text: '#0B1020' },
  { fill: '#22D3EE', text: '#0B1020' },
  { fill: '#FDE047', text: '#0B1020' },
] as const;

export function sectionColor(n: number) {
  return SECTION_COLORS[(n - 1) % SECTION_COLORS.length];
}

// SVG geometry (viewBox is 640×640 with the wheel centred at 320,320).
const C = 320;
const R_RIM = 304; // outer ring
const R_FACE = 282; // coloured sections
const R_HUB = 70;
const R_LABEL = 208;
const R_BULBS = 293;
const BULB_COUNT = 40;

interface WheelProps {
  wheelRef: RefObject<HTMLDivElement>;
  isSpinning: boolean;
  highlightNumber: number | null;
  onSpin: () => void;
  spinDisabled: boolean;
}

const WheelFace = memo(function WheelFace({ highlightNumber }: { highlightNumber: number | null }) {
  return (
    <g className="wheel-rotor">
      {WHEEL_NUMBERS.map((n) => {
        const start = sectionStartAngle(n);
        const { fill, text } = sectionColor(n);
        const label = polarToCartesian(C, C, R_LABEL, sectionCenterAngle(n));
        const state =
          highlightNumber === null ? '' : highlightNumber === n ? 'is-winner' : 'is-dimmed';
        return (
          <g key={n} className={`wheel-section ${state}`} data-number={n}>
            <path d={wedgePath(C, C, R_HUB - 4, R_FACE, start, start + SECTION_ANGLE)} fill={fill} />
            <text
              x={label.x}
              y={label.y}
              className="wheel-label"
              fill={text}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {n}
            </text>
          </g>
        );
      })}

      {/* Section separators */}
      {WHEEL_NUMBERS.map((n) => {
        const a = sectionStartAngle(n);
        const p1 = polarToCartesian(C, C, R_HUB, a);
        const p2 = polarToCartesian(C, C, R_FACE, a);
        return (
          <line
            key={`sep-${n}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#0B1020"
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
});

const Rim = memo(function Rim() {
  return (
    <g>
      <circle cx={C} cy={C} r={R_RIM} fill="#151B32" stroke="#FFFFFF" strokeOpacity={0.14} strokeWidth={2} />
      <circle cx={C} cy={C} r={R_FACE + 2} fill="#0B1020" />
      {Array.from({ length: BULB_COUNT }, (_, i) => {
        const p = polarToCartesian(C, C, R_BULBS, (360 / BULB_COUNT) * i);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            className={`wheel-bulb ${i % 2 ? 'wheel-bulb-b' : 'wheel-bulb-a'}`}
            fill={i % 2 ? '#22D3EE' : '#F472B6'}
          />
        );
      })}
    </g>
  );
});

export function Wheel({ wheelRef, isSpinning, highlightNumber, onSpin, spinDisabled }: WheelProps) {
  return (
    <div ref={wheelRef} className={`wheel ${isSpinning ? 'is-spinning' : ''}`}>
      <svg
        viewBox="0 0 640 640"
        className="wheel-svg"
        role="img"
        aria-label="Prize wheel with 20 numbered sections, 1 to 20"
      >
        <defs>
          <filter id="pointer-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.55" />
          </filter>
        </defs>

        <Rim />
        <WheelFace highlightNumber={highlightNumber} />

        {/* Hub (static) */}
        <circle cx={C} cy={C} r={R_HUB} fill="#0B1020" stroke="#FFFFFF" strokeWidth={4} />

        {/* Fixed pointer at 12 o'clock — outside the rotating group */}
        <g filter="url(#pointer-shadow)" className="wheel-pointer">
          <path
            d="M 320 74 L 301 33 A 21 21 0 1 1 339 33 Z"
            fill="#FDE047"
            stroke="#0B1020"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <circle cx={320} cy={24} r={6} fill="#0B1020" />
        </g>
      </svg>

      <button
        type="button"
        className="spin-hub"
        onClick={onSpin}
        disabled={spinDisabled}
        aria-label={isSpinning ? 'Wheel is spinning' : 'Spin the wheel'}
      >
        <span>{isSpinning ? '···' : 'SPIN'}</span>
      </button>

      <p className="sr-only" aria-live="polite">
        {isSpinning ? 'Spinning…' : highlightNumber ? `The wheel stopped on number ${highlightNumber}.` : ''}
      </p>
    </div>
  );
}
