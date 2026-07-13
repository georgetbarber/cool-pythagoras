# Roadmap

This roadmap is evidence-based direction, not a promise that every item should
be built. Work should remain small enough to validate with learners and tests.

## Current Baseline

Iteration 07 already provides a coherent tonal-context model, relationship-first
workspaces, tested music and guitar domains, guided lessons, adaptive evidence,
instrument-led practice, chord discovery, exact voicings, progression analysis,
and browser-local audio input/recording.

## Near-Term Priorities

1. Strengthen the beginner path around root landmarks, major/minor comparison,
   triad extraction, and transfer to another root.
2. Make practice outcomes more explicit: what was heard, found, played, and
   transferred, rather than only overall accuracy.
3. Normalize saved progression data and make musical context explicit wherever
   a progression or voicing is stored.
4. Introduce fingering difficulty to voicing ranking so compact is not assumed
   to mean playable.
5. Expand regression coverage when new theory formulas or guitar mappings are added.

## Later Directions

- Explicit page-context objects for cleaner feature isolation.
- Alternate tunings built on tuning-aware interval geometry.
- Richer chord formulas, omissions, and rootless/extended voicing analysis.
- A voicing graph that models fingering, movement, inversions, and register.
- An instrument-input event layer that can support improved timing and eventual
  polyphonic recognition.
- Optional higher-quality sound sources with clear licensing and load-cost decisions.

## Non-Goals Until Foundations Support Them

- Claiming reliable polyphonic chord recognition from the present microphone analyser.
- Adding every scale, tuning, or chord name as a browseable catalogue.
- Treating a full CAGED system or full-neck display as beginner content by default.
- Gamification based on clicks or time without evidence of musical capability.
- Server-side audio upload or account infrastructure without a deliberate privacy design.
- A broad rewrite when an evolutionary change can preserve the tested domain model.

## Decision Test

A roadmap item should move forward only if it answers all four questions:

1. What relationship will the learner understand or perform better?
2. What observable action will demonstrate that improvement?
3. Which existing domain owns the rule, and how will it be tested?
4. What complexity will be hidden until the learner needs it?
