/** localStorage helpers that never throw (private mode, blocked storage, quota). */

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state simply won't survive a reload */
  }
}

export const STORAGE_KEYS = {
  // v2: new game list — edits and history keyed by number must not carry over from v1.
  games: 'illuminatix.games.v2',
  session: 'illuminatix.session.v2',
  scores: 'illuminatix.scores.v1',
} as const;
