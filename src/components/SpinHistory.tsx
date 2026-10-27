import type { HistoryEntry } from '../hooks/useSession';
import { sectionColor } from './Wheel';

interface SpinHistoryProps {
  history: HistoryEntry[];
  spinCount: number;
}

export function SpinHistory({ history, spinCount }: SpinHistoryProps) {
  return (
    <section className="panel" aria-labelledby="history-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="history-title" className="panel-title">
          Spin History
        </h2>
        <span className="text-sm font-semibold text-white/60">{spinCount} total</span>
      </div>

      {history.length === 0 ? (
        <p className="mt-4 text-base text-white/60">No spins yet. Hit SPIN to start the fun.</p>
      ) : (
        <ol className="history-list mt-3" aria-label="Most recent first">
          {history.map((entry, i) => {
            const color = sectionColor(entry.number);
            return (
              <li key={entry.id} className={`history-item ${i === 0 ? 'is-latest' : ''}`}>
                <span
                  className="history-num"
                  style={{ background: color.fill, color: color.text }}
                  aria-hidden="true"
                >
                  #{entry.number}
                </span>
                <span className="truncate">
                  <span className="sr-only">#{entry.number} — </span>
                  {entry.name}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
