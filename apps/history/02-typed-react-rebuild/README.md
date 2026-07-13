# Guitar Academy Dashboard v2

This directory is the ground-up rebuild of the guitar dashboard. The original
application is preserved separately in `../01-original-prototype`.

> Historical status: iteration 02, preserved for comparison. Active development
> belongs in [`../../current`](../../current/).

## What is included

- TypeScript and React application built with Vite.
- Dynamically derived harmony for major, natural minor, Dorian, Phrygian,
  Lydian, and Mixolydian.
- Key-aware note spelling, including names such as E# and Cb when required.
- Exact tuning-aware fretboard positions and MIDI pitches.
- A voicing solver that selects one note per used string under fret-span,
  string-count, CAGED-region, and tone-priority constraints.
- Mode-specific progressions, chromatic harmony, scale overlays, and audio.
- Three practice games, persisted lesson progress, opt-in voice control, and a
  validated twelve-tone matrix.
- Unit tests and a Playwright browser workflow.

## Run

From this directory:

```bash
npm install
npm run dev
```

`start.command` uses the locally installed Node.js and npm toolchain and installs
missing dependencies before launching.

From the repository root, this app lives at:

```bash
cd apps/history/02-typed-react-rebuild
```

## Verify

```bash
npm test
npm run build
npm run test:e2e
```

## Architecture

```text
src/
  app/          Application shell and navigation
  components/   Shared visual components
  content/      Lesson content
  domain/       Pure theory models and algorithms
  features/     Explorer, practice, lessons, and systems
  fretboard/    Tunings, geometry, and voicing solver
  services/     Audio and opt-in speech adapters
  state/        Reducer and local persistence
  styles/       Global visual system and responsive layout
```

The `domain` and `fretboard` directories do not depend on React or the DOM. UI
features consume those modules and never maintain separate chord definitions.
