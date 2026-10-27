import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog, type ConfirmRequest } from './components/ConfirmDialog';
import { ResultModal } from './components/ResultModal';
import { Scoreboard } from './components/Scoreboard';
import { SessionControls } from './components/SessionControls';
import { SettingsPanel } from './components/SettingsPanel';
import { SpinHistory } from './components/SpinHistory';
import { Wheel } from './components/Wheel';
import type { Game } from './data/games';
import { useFullscreen } from './hooks/useFullscreen';
import { useGames } from './hooks/useGames';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSession } from './hooks/useSession';
import { useSound } from './hooks/useSound';
import { useWheel } from './hooks/useWheel';
import { pickRandomNumber } from './utils/wheelMath';

/** Pause between the wheel stopping and the result appearing. */
const REVEAL_DELAY_MS = 450;

export default function App() {
  const reducedMotion = useReducedMotion();
  const [soundOn, setSoundOn] = useState(false);
  const sound = useSound(soundOn);
  const wheel = useWheel({ reducedMotion, onTick: sound.playTick });
  const session = useSession();
  const { games, updateGame, restoreDefaults, getGame } = useGames();
  const fullscreen = useFullscreen();

  const [result, setResult] = useState<Game | null>(null);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [scoresOpen, setScoresOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const revealTimer = useRef<number | null>(null);
  /** Bumped on reset so a spin that is mid-flight can't write into a fresh session. */
  const sessionEpoch = useRef(0);

  const clearRevealTimer = () => {
    if (revealTimer.current !== null) {
      window.clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }
  };
  useEffect(() => clearRevealTimer, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const spin = useCallback(async () => {
    if (wheel.isBusy() || revealTimer.current !== null) return;
    setResult(null);
    sound.playClick();

    const epoch = sessionEpoch.current;
    const target = pickRandomNumber(session.getPreviousNumber());
    const landed = await wheel.spinTo(target);
    if (landed === null || epoch !== sessionEpoch.current) return;

    const game = getGame(landed);
    if (!game) return;
    session.recordSpin(game);
    sound.playWin();
    revealTimer.current = window.setTimeout(() => {
      revealTimer.current = null;
      setResult(game);
    }, REVEAL_DELAY_MS);
  }, [wheel, sound, session, getGame]);

  const closeResult = useCallback(() => {
    sound.playClick();
    setResult(null);
  }, [sound]);

  const spinAgain = useCallback(() => {
    setResult(null);
    void spin();
  }, [spin]);

  const resetSession = useCallback(() => {
    sessionEpoch.current += 1;
    clearRevealTimer();
    session.resetSession();
    wheel.clearLanded();
    setResult(null);
    setToast('Session reset. Ready for a fresh start!');
  }, [session, wheel]);

  const askResetSession = () =>
    setConfirm({
      title: 'Reset this session?',
      message:
        'This clears the spin history, sets GAMES SELECTED back to 0 and forgets the previous number. Game settings and team scores are kept.',
      confirmLabel: 'Reset session',
      onConfirm: resetSession,
    });

  const askRestoreDefaults = () =>
    setConfirm({
      title: 'Restore original games?',
      message: 'All edited instructions, durations and materials will return to the original text.',
      confirmLabel: 'Restore originals',
      onConfirm: () => {
        restoreDefaults();
        setToast('Original game details restored.');
      },
    });

  const toggleSound = () => {
    setSoundOn((on) => !on);
    setToast(soundOn ? 'Sound off' : 'Sound on');
  };

  const toggleFullscreen = async () => {
    sound.playClick();
    if (!fullscreen.isSupported) {
      setToast('Fullscreen is not supported in this browser. Try pressing F11.');
      return;
    }
    const ok = await fullscreen.toggle();
    if (!ok) setToast('The browser blocked fullscreen. Try pressing F11.');
  };

  return (
    <div className="app">
      <header className="app-header">
        <p className="brand">
          <span className="brand-dot" aria-hidden="true" />
          ILLUMINATIX
        </p>
        <h1 className="event-title">THE ICEBREAKER</h1>
        <p className="tagline">
          <span className="text-purple">Spin.</span> <span className="text-pink">Play.</span>{' '}
          <span className="text-cyan">Connect.</span>
        </p>
      </header>

      <main className="stage">
        <aside className="side side-left" aria-label="Team scores">
          {scoresOpen && (
            <Scoreboard requestConfirm={setConfirm} onClose={() => setScoresOpen(false)} />
          )}
        </aside>

        <div className="wheel-area">
          <Wheel
            wheelRef={wheel.wheelRef}
            isSpinning={wheel.isSpinning}
            highlightNumber={wheel.landedNumber}
            onSpin={() => void spin()}
            spinDisabled={wheel.isSpinning}
          />
        </div>

        <aside className="side side-right" aria-label="Spin history">
          {historyOpen && <SpinHistory history={session.history} spinCount={session.spinCount} />}
        </aside>
      </main>

      <SessionControls
        isSpinning={wheel.isSpinning}
        spinCount={session.spinCount}
        soundOn={soundOn}
        isFullscreen={fullscreen.isFullscreen}
        fullscreenSupported={fullscreen.isSupported}
        historyOpen={historyOpen}
        scoresOpen={scoresOpen}
        onSpin={() => void spin()}
        onToggleSound={toggleSound}
        onToggleFullscreen={() => void toggleFullscreen()}
        onToggleHistory={() => setHistoryOpen((o) => !o)}
        onToggleScores={() => setScoresOpen((o) => !o)}
        onReset={askResetSession}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {result && (
        <ResultModal
          key={`${result.number}-${session.spinCount}`}
          game={result}
          onPlay={closeResult}
          onSpinAgain={spinAgain}
          onClose={closeResult}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          games={games}
          onUpdateGame={updateGame}
          onRestoreDefaults={askRestoreDefaults}
          onResetSession={askResetSession}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {confirm && <ConfirmDialog request={confirm} onDismiss={() => setConfirm(null)} />}

      <div className="toast-region" aria-live="polite" role="status">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
