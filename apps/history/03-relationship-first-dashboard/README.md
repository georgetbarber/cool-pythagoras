# Guitar Academy V3

V3 is the relationship-first rebuild of the guitar learning dashboard. It is a
separate application and does not import code or state from the original app or V2.

> Historical status: iteration 03, preserved for comparison. Active development
> belongs in [`../../current`](../../current/).

## Product Model

The app keeps one tonal context active across eight workspaces:

- **Learn** sequences concepts from tonal-centre hearing to advanced harmony.
- **Explore** relates selected notes to the tonic, scale, chord, fretboard, and sound.
- **Fretboard** treats shapes as movable interval structures.
- **Harmony** derives chords, Roman numerals, chord tones, and contextual functions.
- **Progressions** connects playable voicings and visualizes individual voice movement.
- **Ear** establishes a tonic before testing scale-degree recognition.
- **Practice** retrieves contextual relationships and gives explanatory feedback.
- **Advanced** compares parallel systems without losing the common tonal centre.

The `Essential`, `Expanded`, and `Advanced` depth setting controls disclosure. It
does not replace the advanced dashboard with a separate beginner product.

## Architecture

```text
src/
  app/          Application shell and workspace navigation
  audio/        Cancellable Web Audio playback
  components/   Context bar, fretboard, and relationship inspector
  domain/       Spelling, scales, chords, functions, and contextual analysis
  features/     The eight learning workspaces
  guitar/       Instrument geometry and ranked playable voicings
  learning/     Concept graph and prerequisite model
  movement/     Progression connection and voice-leading analysis
  state/        Versioned local application state
  styles/       Responsive visual system
```

The domain, guitar, and movement modules do not depend on React or the DOM.

## Run

```bash
cd apps/history/03-relationship-first-dashboard
npm install
npm run dev
```

The development server uses [http://localhost:4176](http://localhost:4176).
`start.command` is also available on macOS.

## Verify

```bash
npm test
npm run build
```

## Current Boundary

V3 implements the complete workspace architecture and a tested vertical slice of
the relationship-first learning model. Parallel-mode comparison, modal
interchange, and secondary dominants are present. Altered harmony, full CAGED
fingering templates, reharmonization, and specialist systems remain future
modules. They should extend the same contextual objects rather than introduce
disconnected calculators.
