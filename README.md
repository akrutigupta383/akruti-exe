# Illuminatix Spin the Wheel — The Icebreaker

**Spin. Play. Connect.** A projector-friendly game wheel for the Illuminatix ice-breaking session.

**Live site:** https://akrutigupta383.github.io/akruti-exe/

To update the live site, run `npm run build:pages` and push the contents of `dist/` (plus an empty `.nojekyll` file) to the `gh-pages` branch.

## Run it

Double-click `start-wheel.cmd`, or from this folder:

```bash
npm run dev
```

Then open http://akruti.localhost (Chrome/Edge; http://localhost also works).

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm test` | Wheel-math and game-mapping tests (all 20 numbers) |
| `npm run typecheck` | TypeScript checks |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |

Node.js is installed portably at `%LOCALAPPDATA%\Programs\node-portable`; `start-wheel.cmd` puts it on the PATH for you.

## Host tips

- Turn on **Sound** if you want the tick and win sounds. It's off by default.
- Press **Fullscreen** (or F11) on the projector.
- **Settings** lets you edit instructions, durations and materials. Wheel numbers and game names stay locked.
- History, the counter, edits and team scores are saved in the browser, so a page refresh mid-event keeps everything.
- With no internet, the site still works and falls back to system fonts.

## Structure

```
src/
  data/games.ts            fixed 1–20 game mapping
  utils/wheelMath.ts       rotation maths (calculateFinalRotation, getNumberAtPointer)
  utils/wheelMath.test.ts  tests for every number, jitter, repeat prevention
  hooks/useWheel.ts        spin animation and landing verification
  hooks/useSession.ts      history, counter, previous number
  hooks/useGames.ts        editable game details
  hooks/useSound.ts        Web Audio effects
  hooks/useFullscreen.ts   Fullscreen API with fallbacks
  components/              Wheel, ResultModal, SessionControls, SpinHistory,
                           SettingsPanel, Scoreboard, ConfirmDialog, Dialog, Confetti
```
