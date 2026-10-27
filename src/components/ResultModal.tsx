import { useId, useRef } from 'react';
import type { Game } from '../data/games';
import { Confetti } from './Confetti';
import { Dialog } from './Dialog';
import { sectionColor } from './Wheel';

interface ResultModalProps {
  game: Game;
  onPlay: () => void;
  onSpinAgain: () => void;
  onClose: () => void;
}

export function ResultModal({ game, onPlay, onSpinAgain, onClose }: ResultModalProps) {
  const titleId = useId();
  const playRef = useRef<HTMLButtonElement>(null);
  const color = sectionColor(game.number);

  return (
    <Dialog
      labelledBy={titleId}
      onClose={onClose}
      initialFocusRef={playRef}
      className="result-panel relative w-full max-w-2xl overflow-hidden"
    >
      <Confetti />
      <div className="relative max-h-[calc(100svh-2rem)] overflow-y-auto px-5 pt-6 pb-5 text-center sm:px-10 sm:pt-10 sm:pb-8">
        <p className="font-display text-sm font-bold tracking-[0.3em] text-sun sm:text-base">
          THE WHEEL HAS SPOKEN!
        </p>

        <div className="mt-3 flex items-center justify-center gap-4 sm:mt-5">
          <span className="font-display text-sm font-semibold tracking-[0.2em] text-white/70 sm:text-base">
            NUMBER SELECTED:
          </span>
          <span
            className="result-number"
            style={{ background: color.fill, color: color.text }}
            aria-label={`Number ${game.number}`}
          >
            {game.number}
          </span>
        </div>

        <h2
          id={titleId}
          className="mt-4 font-display text-3xl leading-[1.05] font-bold tracking-tight text-white uppercase sm:mt-5 sm:text-6xl"
        >
          {game.name}
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/85 sm:mt-5 sm:text-xl">
          {game.instructions}
        </p>

        <dl className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-3 text-left sm:mt-6">
          <div className="result-fact">
            <dt>Duration</dt>
            <dd>{game.duration}</dd>
          </div>
          <div className="result-fact">
            <dt>Materials</dt>
            <dd>{game.materials}</dd>
          </div>
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:justify-center">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            CLOSE
          </button>
          <button type="button" className="btn btn-secondary" onClick={onSpinAgain}>
            SPIN AGAIN
          </button>
          <button
            ref={playRef}
            type="button"
            className="btn btn-primary btn-lg order-first col-span-2 sm:order-none"
            onClick={onPlay}
          >
            LET'S PLAY!
          </button>
        </div>
      </div>
    </Dialog>
  );
}
