# Current Architecture

## Scope

This document describes `apps/current` (iteration 08). Historical applications
are isolated, runnable snapshots and are not runtime dependencies.

## System Shape

```text
URL route + React shell
        |
        v
V8 store and commands -----> daily session + mastery derivation
        |                              |
        v                              v
IndexedDB repositories       curriculum + activity definitions
        |                              |
        +--------------+---------------+
                       v
       music, guitar, rhythm, motif, and analysis domains
                       |
                       v
          browser audio and recording adapters
```

The shell has five destinations: Today, Path, Practice, Create, and Explore.
History API routes are durable UI state; an activity can open a tool and return
to its exact attempt, assistance, reflection, and timing state.

## Source Ownership

```text
src/
  app/             V8 shell, first-run diagnostic, navigation, overlays
  v8/
    curriculum.ts  Eight stages, 48 units, typed activity definitions, validation
    learning.ts    Sessions, evidence, mastery, transfer, progress summaries
    repository.ts  IndexedDB, fallback storage, blobs, archive export/import
    store.tsx       Versioned product state, commands, routing, persistence
    components/     Activity player, micro-study, rhythm notation, settings
    features/       Today, Path, Practice, Create, Explore
  core/
    music/          Theory, rhythm, motif, and chromatic descriptions
    instrument/     Fretboard geometry, shapes, transitions, fingering feasibility
  audio/            Playback, honest limited analysis, browser recording
  components/       Shared relationship visualisations
  styles/           Responsive V8 visual and accessibility system
```

The V7 modules retained outside `src/v8` remain the validated source for pitch
spelling, tonal context, chord construction, fretboard geometry, playback, and
limited microphone analysis. New V8 UI does not duplicate those constants.

## Learning and Evidence

Curriculum is data, not page markup. Every core unit includes sound, ear-to-hand,
technique in context, rhythm, relationship explanation, variation, creation,
transfer, and reflection. Validation rejects broken prerequisites, duplicate IDs,
missing activity types, invalid budgets, and incomplete assets.

Evidence records source, assistance, outcome, activity, time, and musical context.
Mastery is derived: secure requires independent success on two different days;
transfer-ready also requires a successful changed context. Creative work is
tracked as artifacts and revisions, not reduced to a creativity score.

## Persistence and Privacy

IndexedDB stores V8 state and device-only recorded blobs behind a repository
interface. Lightweight schema metadata and a graceful fallback use local storage.
Saves are automatic. A versioned `.guitar-academy` archive exports and imports
JSON plus retained local recordings.

When configured, Firebase Authentication and Firestore synchronise structured
learning data. Evidence is append-only; settings use last-modified resolution;
sketches use newest-edit resolution while merging revision history; deletion
tombstones prevent stale resurrection. Firestore rules isolate every learner under
their authenticated user ID. The service worker makes the application installable
and caches its shell for offline use.

Recordings are temporary by default and are explicitly excluded from cloud
documents. Retained audio stays on one device and can be measured or cleared.
There are no analytics. Microphone feedback claims only clean sustained
monophonic pitch and suitable onset timing; richer performances use comparison
and self-review.

## Test Strategy

Unit tests cover theory, spelling, chord relationships, fretboard geometry,
fingering feasibility, rhythm, motif transformation, chromatic interpretation,
curriculum integrity, mastery, and session budgets. Browser journeys cover first
launch, navigation/history, activity evidence, interrupted work, Sketchbook
persistence, microphone denial, exports, and 320/390 px layouts. Production build
success is part of the release gate.

## Architectural Rules

1. Put musical rules in pure domains before exposing them in UI.
2. Derive relationship labels from shared context; do not copy constants.
3. Treat assistance, outcome, and context as distinct learning evidence.
4. Keep creation durable and preserve revision history.
5. Label generated note layouts honestly until fingering validation passes.
6. Make routes refreshable and activity interruptions resumable.
7. Keep browser capabilities opt-in, local, and explicit about limitations.
