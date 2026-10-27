import { useCallback, useEffect, useRef, useState } from 'react';
import { type EditableGameField, type Game, cloneDefaultGames, mergeStoredGames } from '../data/games';
import { STORAGE_KEYS, readStorage, writeStorage } from '../utils/storage';

/** Game data with host edits (instructions, duration, materials) persisted locally. */
export function useGames() {
  const [games, setGames] = useState<Game[]>(() =>
    mergeStoredGames(readStorage<unknown>(STORAGE_KEYS.games, null)),
  );
  const gamesRef = useRef(games);
  gamesRef.current = games;

  useEffect(() => writeStorage(STORAGE_KEYS.games, games), [games]);

  const updateGame = useCallback((number: number, field: EditableGameField, value: string) => {
    setGames((list) => list.map((g) => (g.number === number ? { ...g, [field]: value } : g)));
  }, []);

  const restoreDefaults = useCallback(() => setGames(cloneDefaultGames()), []);

  const getGame = useCallback(
    (number: number) => gamesRef.current.find((g) => g.number === number) ?? null,
    [],
  );

  return { games, updateGame, restoreDefaults, getGame };
}
