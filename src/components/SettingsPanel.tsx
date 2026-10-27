import { useId } from 'react';
import type { EditableGameField, Game } from '../data/games';
import { Dialog } from './Dialog';
import { Icon } from './Icon';
import { sectionColor } from './Wheel';

interface SettingsPanelProps {
  games: Game[];
  onUpdateGame: (number: number, field: EditableGameField, value: string) => void;
  onRestoreDefaults: () => void;
  onResetSession: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  games,
  onUpdateGame,
  onRestoreDefaults,
  onResetSession,
  onClose,
}: SettingsPanelProps) {
  const titleId = useId();

  return (
    <Dialog labelledBy={titleId} onClose={onClose} variant="sheet" className="flex flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <h2 id={titleId} className="font-display text-2xl font-bold text-white">
            Host Settings
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Edits save automatically. Numbers and game names stay locked to the wheel.
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
          <Icon name="close" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
        {games.map((game) => {
          const color = sectionColor(game.number);
          const base = `game-${game.number}`;
          return (
            <fieldset key={game.id} className="settings-card">
              <legend className="flex items-center gap-3">
                <span className="history-num" style={{ background: color.fill, color: color.text }}>
                  #{game.number}
                </span>
                <span className="font-display text-lg font-semibold text-white">{game.name}</span>
              </legend>

              <label htmlFor={`${base}-instructions`} className="field-label">
                Instructions
              </label>
              <textarea
                id={`${base}-instructions`}
                className="field"
                rows={3}
                value={game.instructions}
                onChange={(e) => onUpdateGame(game.number, 'instructions', e.target.value)}
              />

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${base}-duration`} className="field-label">
                    Duration
                  </label>
                  <input
                    id={`${base}-duration`}
                    className="field"
                    value={game.duration}
                    onChange={(e) => onUpdateGame(game.number, 'duration', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`${base}-materials`} className="field-label">
                    Materials
                  </label>
                  <input
                    id={`${base}-materials`}
                    className="field"
                    value={game.materials}
                    onChange={(e) => onUpdateGame(game.number, 'materials', e.target.value)}
                  />
                </div>
              </div>
            </fieldset>
          );
        })}
      </div>

      <footer className="flex flex-wrap gap-3 border-t border-white/10 px-5 py-4 sm:px-6">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRestoreDefaults}>
          Restore original games
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onResetSession}>
          Reset session
        </button>
        <button type="button" className="btn btn-primary btn-sm ml-auto" onClick={onClose}>
          Done
        </button>
      </footer>
    </Dialog>
  );
}
