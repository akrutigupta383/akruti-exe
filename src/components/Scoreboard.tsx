import { useEffect, useState } from 'react';
import { STORAGE_KEYS, readStorage, writeStorage } from '../utils/storage';
import type { ConfirmRequest } from './ConfirmDialog';
import { Icon } from './Icon';

const TEAM_COUNT = 6;
const emptyScores = () => Array.from({ length: TEAM_COUNT }, () => 0);

function loadScores(): number[] {
  const stored = readStorage<unknown>(STORAGE_KEYS.scores, null);
  return Array.isArray(stored) &&
    stored.length === TEAM_COUNT &&
    stored.every((v) => typeof v === 'number' && Number.isFinite(v))
    ? (stored as number[])
    : emptyScores();
}

interface ScoreboardProps {
  requestConfirm: (request: ConfirmRequest) => void;
  onClose: () => void;
}

export function Scoreboard({ requestConfirm, onClose }: ScoreboardProps) {
  const [scores, setScores] = useState<number[]>(loadScores);
  useEffect(() => writeStorage(STORAGE_KEYS.scores, scores), [scores]);

  const best = Math.max(...scores);
  const change = (team: number, delta: number) =>
    setScores((s) => s.map((v, i) => (i === team ? Math.max(0, v + delta) : v)));

  return (
    <section className="panel" aria-labelledby="scores-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="scores-title" className="panel-title">
          Team Scores
        </h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Hide team scores">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {scores.map((score, i) => {
          const leading = best > 0 && score === best;
          return (
            <li key={i} className={`score-row ${leading ? 'is-leading' : ''}`}>
              <span className="font-display font-semibold">Team {i + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => change(i, -1)}
                  disabled={score === 0}
                  aria-label={`Subtract a point from Team ${i + 1}`}
                >
                  <Icon name="minus" className="h-4 w-4" />
                </button>
                <span className="score-value" aria-live="polite" aria-label={`Team ${i + 1} score ${score}`}>
                  {score}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => change(i, 1)}
                  aria-label={`Add a point to Team ${i + 1}`}
                >
                  <Icon name="plus" className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="btn btn-ghost btn-sm mt-4 w-full"
        onClick={() =>
          requestConfirm({
            title: 'Reset team scores?',
            message: 'All six teams will go back to 0 points.',
            confirmLabel: 'Reset scores',
            onConfirm: () => setScores(emptyScores()),
          })
        }
      >
        Reset scores
      </button>
    </section>
  );
}
