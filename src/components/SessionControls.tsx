import { Icon } from './Icon';

interface SessionControlsProps {
  isSpinning: boolean;
  spinCount: number;
  soundOn: boolean;
  isFullscreen: boolean;
  fullscreenSupported: boolean;
  historyOpen: boolean;
  scoresOpen: boolean;
  onSpin: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onToggleHistory: () => void;
  onToggleScores: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
}

export function SessionControls(props: SessionControlsProps) {
  const {
    isSpinning,
    spinCount,
    soundOn,
    isFullscreen,
    fullscreenSupported,
    historyOpen,
    scoresOpen,
  } = props;

  return (
    <nav className="control-bar" aria-label="Session controls">
      <button
        type="button"
        className="btn btn-primary control-spin"
        onClick={props.onSpin}
        disabled={isSpinning}
      >
        {isSpinning ? 'SPINNING…' : 'SPIN'}
      </button>

      <div className="counter" role="status" aria-live="polite">
        <span className="counter-label">GAMES SELECTED:</span>
        <span className="counter-value">{spinCount}</span>
      </div>

      <div className="control-group">
        <button
          type="button"
          className={`ctrl-btn ${soundOn ? 'is-active' : ''}`}
          onClick={props.onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on'}
          title={soundOn ? 'Sound on' : 'Sound off'}
        >
          <Icon name={soundOn ? 'sound-on' : 'sound-off'} />
          <span className="ctrl-text">Sound</span>
        </button>

        <button
          type="button"
          className={`ctrl-btn ${isFullscreen ? 'is-active' : ''}`}
          onClick={props.onToggleFullscreen}
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={fullscreenSupported ? (isFullscreen ? 'Exit fullscreen' : 'Fullscreen') : 'Fullscreen not supported'}
        >
          <Icon name={isFullscreen ? 'shrink' : 'expand'} />
          <span className="ctrl-text">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>

        <button
          type="button"
          className={`ctrl-btn ${historyOpen ? 'is-active' : ''}`}
          onClick={props.onToggleHistory}
          aria-pressed={historyOpen}
          aria-label={historyOpen ? 'Hide spin history' : 'Show spin history'}
          title="Spin history"
        >
          <Icon name="history" />
          <span className="ctrl-text">History</span>
        </button>

        <button
          type="button"
          className={`ctrl-btn ${scoresOpen ? 'is-active' : ''}`}
          onClick={props.onToggleScores}
          aria-pressed={scoresOpen}
          aria-label={scoresOpen ? 'Hide team scores' : 'Show team scores'}
          title="Team scores"
        >
          <Icon name="scores" />
          <span className="ctrl-text">Scores</span>
        </button>

        <button
          type="button"
          className="ctrl-btn"
          onClick={props.onReset}
          disabled={isSpinning}
          aria-label="Reset session"
          title="Reset session"
        >
          <Icon name="reset" />
          <span className="ctrl-text">Reset</span>
        </button>

        <button
          type="button"
          className="ctrl-btn"
          onClick={props.onOpenSettings}
          disabled={isSpinning}
          aria-label="Open host settings"
          title="Host settings"
        >
          <Icon name="settings" />
          <span className="ctrl-text">Settings</span>
        </button>
      </div>
    </nav>
  );
}
