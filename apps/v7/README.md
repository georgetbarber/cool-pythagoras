# Guitar Academy V7

V7 is an isolated, evolutionary improvement of V6. It preserves every theory,
explanation, ear, progression, and play-along workspace while making real
guitar practice the primary activity.

## Run

From the repository root, double-click `start-v7.command`, or run:

```bash
cd apps/v7
./start.command
```

V7 opens at [http://localhost:4184](http://localhost:4184).

For a fresh dependency install:

```bash
cd apps/v7
npm install
npm run dev
```

## What V7 Adds

- Endless Mixed Coach, Note Hunt, Interval Moves, Chord-Tone Targets, and Triad Shapes sessions
- Foundation, Moving, and Challenge difficulty ranges
- Hint, reveal, self-assessment, accuracy, and useful streak feedback
- Theory quick checks retained as a secondary practice tool
- Play Lab next-chord suggestions with diatonic, resolution, borrowed, modal/rock, and blues context
- Nearby compact guitar voicings that can be heard, loaded, or added directly
- User progression analysis with recalculated Roman numerals when the tonal centre changes
- Explicit `Key`, `Scale degree`, `Chord tone`, and `Interval` labels instead of ambiguous `D`, `C`, and `I` initials
- Page-state resets for progression changes, tonal-context changes, ear prompts, voicing selection, and scheduled playback

## Architecture

```text
src/
  app/          Application shell and workspace composition
  application/  Versioned state, commands, persistence, and derived model
  audio/        Web Audio playback, microphone, rhythm, and recording support
  components/   Shared fretboard, context, help, and relationship UI
  content/      Validated lessons and progression content
  core/
    instrument/ Guitar geometry, voicings, proximity, and movement
    music/      Tonal theory, chord discovery, connections, and analysis
  features/     Learning and playing workspaces
  learning/     Learner evidence, quizzes, and guitar-coach prompt generation
  styles/       Responsive visual system
```

## Verify

```bash
npm test
npm run build
npm run test:e2e:install
npm run test:e2e
```

## Honest Limits

Microphone pitch feedback remains monophonic. Chord discovery covers common
triads, suspended and power chords, and common seventh chords rather than
exhaustive extensions or rootless jazz voicings. Suggested connections are
theory-grounded options, not claims that one progression is uniquely correct.
Generated shapes favour compact consecutive-string voicings and do not yet
model fingering difficulty, alternate tunings, or a complete chord dictionary.
