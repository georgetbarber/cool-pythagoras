# Current Architecture

## Scope

This document describes `apps/current` (iteration 07). Historical applications
are isolated snapshots and are not runtime dependencies.

## System Shape

```text
React feature pages
        |
        v
shared application state ----> derived active scale and chord model
        |                               |
        v                               v
learning records/content         music + guitar domain modules
        |                               |
        +--------------+----------------+
                       v
              audio and browser adapters
```

The application owns one active tonal context. Every workspace receives the
same state, dispatcher, and derived model, while temporary interaction state
such as a current quiz response remains local to the feature that owns it.

## Source Ownership

```text
src/
  app/          Shell, navigation, and workspace composition
  application/  Versioned global state, reducer commands, persistence, derived model
  audio/        Playback, microphone analysis, rhythm analysis, and recording support
  components/   Shared context, fretboard, chord, shape, lesson, and help UI
  content/      Lesson catalogue and progression definitions
  core/
    music/      Tonal context, scales, chords, spelling, discovery, and connections
    instrument/ Guitar tuning, fret geometry, voicings, proximity, and movement
  features/     Eleven user-facing learning and playing workspaces
  learning/     Learner evidence, recommendations, quizzes, and coach prompt generation
  styles/       Global responsive visual system
```

## Application State

`src/application/store.ts` owns durable cross-page state:

- active tonic and mode;
- selected pitch, interval, chord, fret position, and shape;
- progression and seventh-chord settings;
- relationship/note label mode and theme;
- learner profile and learning evidence.

The reducer resets dependent selections when tonal context changes. This is a
musical correctness requirement: a label or analysis derived in one key must not
remain visible as if it described another.

State is stored in browser `localStorage` under a versioned envelope. Invalid or
older state falls back safely to defaults. The app remains usable when storage is
unavailable.

## Domain Boundaries

The music and instrument cores do not depend on React or the DOM.

- `core/music` answers theoretical questions: spelling, scale membership,
  degrees, chord construction, Roman numerals, function, chord candidates, and
  contextual chord connections.
- `core/instrument` answers guitar questions: pitches at positions, interval
  geography, compact voicings, inversions, CAGED regions, movement, and nearby shapes.
- `learning` turns domain facts and learner evidence into prompts,
  recommendations, explanations, and review timing.
- `features` orchestrate interactions. They should not invent alternate theory rules.

## Audio and Privacy

Playback uses browser audio synthesis. Microphone access and recording are
opt-in. Pitch/rhythm analysis and recorded takes stay in the browser; no server
or upload layer exists in this repository. Recorded blobs are held in memory and
discarded when the page closes.

## Test Strategy

The current test suite covers:

- contextual theory and spelling;
- chord discovery and chord connections;
- fretboard geometry, labels, shapes, and proximity;
- learner evidence and practice-coach prompt generation;
- reducer behaviour and stale-state prevention;
- feature-page rendering;
- audio-analysis primitives;
- desktop/mobile browser flows and denied microphone access.

Unit tests live beside source. Browser tests live under `tests/e2e`.

## Architectural Rules

1. Add a concept to the pure domain before exposing it in UI.
2. Derive labels; do not copy music constants into components.
3. Keep global state to information that must coordinate pages.
4. Reset or re-derive dependent state when tonal context changes.
5. Keep browser capabilities behind opt-in adapters and state limitations clearly.
6. Add curriculum content as data where possible, not hard-coded page sequences.
