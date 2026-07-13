# V7 Diagnostic and Architecture

## Current System

V6 supplied a strong React/TypeScript relationship-learning application with
global tonal context, derived scale and chord models, playable fretboard
shapes, progression playback, chord discovery, browser-local recording, and
adaptive theory retrieval.

Data flows from the versioned reducer in `src/application/store.ts` into a
derived scale/chord model. Every workspace receives the same state, dispatch,
and model. Page-specific interaction state stays local to each feature.

## Diagnostic Findings

- Practice was a finite multiple-choice loop rather than an instrument-led session.
- Play Lab named and explained chords but offered only prose experiments.
- User progressions kept exact voicings but lacked sequence-level analysis.
- `D3`, `C3`, and `I3` labels visually conflicted with note names.
- Progression steps, ear resolution, playback, and stored context analysis
  could become stale after changing the active musical context.
- The domain and instrument layers were already sufficiently separated, so an
  evolutionary improvement was safer than a rebuild.

## V7 Architecture

- `learning/practiceCoach.ts` generates deterministic, testable guitar prompts.
- `core/music/chordConnections.ts` owns next-chord and progression analysis.
- `core/instrument/guitar.ts` ranks generated voicings by physical proximity.
- Shared theory formatters produce learner-facing relationship labels.
- Feature components orchestrate sessions without duplicating theory rules.

## Future Ground-Up Direction

A larger rebuild should introduce explicit page contexts, normalized saved
progressions, a fingering-aware voicing graph, alternate tunings, richer chord
formula coverage, and an instrument-input event layer that can support
polyphonic recognition. Those changes are deliberately outside V7's focused
scope.
