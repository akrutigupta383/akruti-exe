import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game } from '../data/games';
import { STORAGE_KEYS, readStorage, writeStorage } from '../utils/storage';

export interface HistoryEntry {
  id: string;
  number: number;
  name: string;
  at: number;
}

interface SessionState {
  history: HistoryEntry[]; // most recent first
  spinCount: number;
  previousNumber: number | null;
}

const EMPTY_SESSION: SessionState = { history: [], spinCount: 0, previousNumber: null };

function loadSession(): SessionState {
  const stored = readStorage<Partial<SessionState> | null>(STORAGE_KEYS.session, null);
  if (!stored || !Array.isArray(stored.history)) return EMPTY_SESSION;
  const history = stored.history.filter(
    (e): e is HistoryEntry =>
      !!e && typeof e.number === 'number' && typeof e.name === 'string' && typeof e.id === 'string',
  );
  return {
    history,
    spinCount: typeof stored.spinCount === 'number' ? stored.spinCount : history.length,
    previousNumber: typeof stored.previousNumber === 'number' ? stored.previousNumber : null,
  };
}

/** Spin history, the games-selected counter and repeat-prevention state. */
export function useSession() {
  const [session, setSession] = useState<SessionState>(loadSession);
  const previousRef = useRef(session.previousNumber);
  previousRef.current = session.previousNumber;

  useEffect(() => writeStorage(STORAGE_KEYS.session, session), [session]);

  const recordSpin = useCallback((game: Game) => {
    previousRef.current = game.number;
    setSession((s) => ({
      history: [
        { id: `${Date.now()}-${s.spinCount + 1}`, number: game.number, name: game.name, at: Date.now() },
        ...s.history,
      ],
      spinCount: s.spinCount + 1,
      previousNumber: game.number,
    }));
  }, []);

  const resetSession = useCallback(() => {
    previousRef.current = null;
    setSession(EMPTY_SESSION);
  }, []);

  /** Always-current previous number, safe to read inside async spin handlers. */
  const getPreviousNumber = useCallback(() => previousRef.current, []);

  return { ...session, recordSpin, resetSession, getPreviousNumber };
}
