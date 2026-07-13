# Lessons Learned

This file captures conclusions supported by the seven preserved iterations and
the detailed product reviews. It exists to prevent the project from repeating
old mistakes during future expansion.

## Product and Pedagogy

| Observation | Lesson | Current response |
| --- | --- | --- |
| The original app displayed many correct facts at once. | Correct information is not automatically a learning sequence. | Guided workspaces and progressive disclosure provide a next action. |
| Advanced modes, extensions, tunings, and systems competed with fundamentals. | Depth should follow demonstrated prerequisites. | Relationship labels and difficulty levels reveal complexity progressively. |
| Browsing diagrams felt informative but passive. | Retrieval needs an attempt before reveal. | Practice uses hints, reveal, self-assessment, retries, and evidence. |
| Note names alone did not transfer across keys. | Intervals and functions are the durable language. | The default label model foregrounds relationships while retaining note context. |
| Theory panels could feel separate from the guitar. | Every explanation should lead to sound and physical action. | Play Lab, exact voicings, fret prompts, playback, and practice coach connect the layers. |
| Chord symbols hid the actual hand position. | Exact voicings and voice movement matter. | Progressions can retain selected shapes and analyse nearby alternatives. |
| Finite quizzes became repetitive. | Practice should generate varied, contextual instrument tasks. | Iteration 07 adds continuous mixed guitar-coach sessions and difficulty ranges. |

## Music-Theory Quality

- A chord quality is not the same as a harmonic function.
- A chord tone is relative to the chord root; a scale degree is relative to the tonal centre.
- Modal, borrowed, secondary-dominant, blues, and natural-minor explanations need explicit context.
- Natural minor must not silently substitute a raised-seventh dominant.
- Ambiguous chord shapes should return ranked possibilities rather than false certainty.
- Shared domain formatters are safer than hand-written labels in feature components.

## Engineering

| Observation | Lesson | Current response |
| --- | --- | --- |
| Prototype UI and theory logic were intertwined. | Pure domain boundaries make correctness testable. | Music and instrument cores are independent of React and the DOM. |
| Rebuilds repeatedly copied whole applications. | Isolation is useful for experiments, but only one target should be current. | `apps/current` is explicit; prior versions live under `apps/history`. |
| Page-local state survived context changes. | Stale state can become musically wrong, not merely visually stale. | Reducer and feature resets follow tonal/progression changes. |
| Content embedded in pages was difficult to extend. | Curriculum and progression content should be structured data. | Catalogues and learning engines sit outside feature UI. |
| Machine-specific launch paths hindered portability. | Repository commands must rely on standard local tooling. | Launchers now use npm and explain dependency setup. |
| Generated dependencies obscured the portable source record. | Only reproducible source and metadata belong in Git. | Ignore rules exclude dependencies, builds, browsers, reports, and caches. |

## What Still Needs Work

- A fingering-aware voicing graph rather than compactness alone.
- Clearer explicit page contexts and normalized saved progressions.
- Broader but still honest chord-formula and tuning support.
- An instrument-input event layer capable of future polyphonic recognition.
- More beginner sessions that prove transfer across roots and positions.
- Real-instrument sound options that do not compromise repository size or licensing.

These are directions, not permission to add them all at once. Each addition must
strengthen the relationship-first learning loop.
