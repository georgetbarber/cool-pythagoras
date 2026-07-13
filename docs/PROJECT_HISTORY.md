# Project History

## The Short Version

The project began as an ambitious, dependency-free guitar-theory dashboard. It
could display and calculate a great deal, but it presented advanced information
before establishing the relationships a learner needed. Six subsequent
iterations progressively separated domain logic from UI, centred every view on
one musical context, introduced curriculum and learner evidence, made guitar
playing primary, and finally reorganised the product around long-term musical
agency and original work.

The current product is iteration 08 in `apps/current`.

## Source-of-Truth Note

The Git history records the original dashboard work in June 2026 and the
multi-version workspace snapshot in July 2026. Iterations 02–07 were preserved
together in that snapshot, so their numerical order—not individual Git commit
dates—is the reliable development sequence. This document does not invent dates
that the repository cannot prove.

## Iteration Timeline

### 01 — Original prototype

Location: `apps/history/01-original-prototype`

The project started as a static HTML, CSS, and JavaScript dashboard with no
package dependencies. It combined note and chord audio, fretboard display,
diatonic harmony, voicing controls, lessons, retrieval games, and voice control.

What it proved:

- A browser can connect fretboard positions, theory labels, and sound in one tool.
- The underlying music calculations were valuable enough to preserve and validate.
- Fast prototyping exposed the breadth of the desired product.

Why it changed:

- Too many independent selectors and advanced concepts appeared at once.
- The information architecture behaved like a calculator dashboard, not a lesson.
- UI, theory, and interaction logic were difficult to evolve independently.

### 02 — Typed React rebuild

Location: `apps/history/02-typed-react-rebuild`

The first ground-up rebuild introduced React, TypeScript, Vite, unit tests, and
browser tests. Theory, fretboard geometry, voicing selection, services, state,
and UI features received explicit boundaries. It also expanded correct note
spelling, modes, progressions, voicing constraints, and practice systems.

What it proved:

- Pure theory and fretboard modules can be tested without the browser.
- Shared domain definitions prevent UI panels from disagreeing musically.
- Type safety and regression tests make broader theory support safer.

Why it changed:

- Better engineering did not by itself create a beginner learning sequence.
- Feature breadth still competed with the learner's next action.
- The product needed a single shared tonal reference across every workspace.

### 03 — Relationship-first dashboard

Location: `apps/history/03-relationship-first-dashboard`

This rebuild made one tonal context the organising principle. Learn, Explore,
Fretboard, Harmony, Progressions, Ear, Practice, and Advanced workspaces all
described notes and actions relative to the same tonic. A prerequisite graph
and Essential/Expanded/Advanced depth levels introduced progressive disclosure.

What it proved:

- A shared tonal centre turns separate calculators into one learning system.
- Intervals, scale degrees, chord tones, function, and physical position must
  remain distinct but connected.
- Movable shapes are best explained as interval structures around roots.

Why it changed:

- A full workspace system still needed a clearer overview and stronger guidance.
- Architecture existed for learning, but the learner journey was only a tested
  vertical slice.

### 04 — Connected learning dashboard

Location: `apps/history/04-connected-dashboard`

Iteration 04 combined the at-a-glance value of the original dashboard with the
shared-context model from iteration 03. It coordinated dashboard analysis,
focused shapes, layer controls, interval work, harmony, progressions, and voice
movement around a single application store.

What it proved:

- An overview is useful when it preserves the same context as specialist views.
- Fretboard, harmony, progression, and analysis panels can coordinate without
  collapsing their meanings into one overloaded display.

Why it changed:

- Coordination still needed a curriculum, learner profile, evidence model, and
  durable recommendation engine.
- The next rebuild required a product foundation, not another dashboard layer.

### 05 — Learning-platform foundation

Location: `apps/history/05-learning-platform`

Iteration 05 established the long-term application shape: a versioned store,
pure music and instrument cores, validated content catalogues, learner profiles,
mastery evidence, recommendations, exercises, audio scheduling, and ten focused
workspaces including Play Along and My Path.

What it proved:

- Curriculum and practice can be data-driven rather than embedded in page UI.
- Learner evidence can guide recommendations without pretending clicks equal mastery.
- The product architecture can support growth without duplicating theory rules.

Why it changed:

- The app still asked learners to read and answer more often than it asked them to play.
- Physical voicings, instrument input, recording, and worked retries needed to
  become first-class parts of the learning loop.

### 06 — Playing-learning layer

Location: `apps/history/06-playing-learning`

Iteration 06 evolved iteration 05 with chord discovery, exact selected voicings,
CAGED geography, triad inversions, voice movement, Play Lab, opt-in monophonic
pitch feedback, rhythm checks, local recording, guided lesson actions, retry-first
practice, sound-before-symbol ear work, and spaced-practice due dates.

What it proved:

- Theory becomes more meaningful when every explanation leads to a guitar action.
- Exact voicings matter; a chord name alone does not describe what the hand plays.
- Honest, limited instrument feedback is more useful than overstated recognition.

Why it changed:

- Practice remained a finite multiple-choice loop rather than an instrument-led session.
- Play Lab explained possible experiments in prose but did not make next actions immediate.
- Saved progressions needed sequence-level analysis and robust context resets.

### 07 — Practice-first coach

Location: `apps/history/07-practice-first`

Iteration 07 was an evolutionary improvement of iteration 06. It added an
endless mixed guitar coach, difficulty ranges,
hints and reveal flow, explicit relationship labels, theory-grounded next-chord
suggestions, nearby voicings, progression re-analysis when context changes, and
state resets that prevent stale musical explanations.

What it did well:

- Keeps one tonal context across eleven learning and playing workspaces.
- Connects sound, theory, fretboard geometry, chord shapes, and practice evidence.
- Separates theory, instrument, learning, application state, and feature UI.
- Keeps microphone and recorded audio local to the browser.
- Backs core music, guitar, learning, feature, and state behaviour with tests.

Why it changed:

- Eleven equal destinations still made the learner choose the pedagogy each day.
- Evidence was too flat to distinguish assisted recognition from independent transfer.
- Creative work and recordings did not survive reload as durable projects.
- The curriculum needed a complete year-scale path rather than isolated activities.

### 08 — Musical Freedom Learning System

Location: `apps/current`

Iteration 08 is a ground-up product and learning redesign that preserves the
validated V7 domain foundations. It organises 48 core units across eight stages
and eight interdependent competencies. The daily planner builds a 25-minute
session around playing, time, relationships, ear-to-hand work, creation, and
reflection. Activity-specific evidence records assistance and context, so a
hint or reveal cannot masquerade as secure mastery.

What it adds:

- Five purposeful destinations: Today, Path, Practice, Create, and Explore.
- Bookmarkable routes, browser history, interruption recovery, and deep links.
- A typed activity contract from hearing and prediction through creation and transfer.
- A durable IndexedDB Sketchbook with workflow stages, revisions, takes, and archive export/import.
- Rhythm, motif, chromatic-description, and fingering-feasibility domain modules.
- A calm responsive design with keyboard access, mobile bottom navigation, text alternatives, and reduced motion.
- Automated checks for curriculum integrity, mastery, planning, persistence,
  music logic, responsive browser journeys, and production builds.

## Where the Project Is Now

The current app is a private, local-first musical-agency learning system. Its
present feedback boundaries remain explicit:

- pitch feedback is monophonic;
- rhythm checking expects separated attacks;
- chord discovery covers common triads, suspended/power chords, and common sevenths;
- generated shapes are labelled playable only after a fingering feasibility check;
- alternate tunings and a complete chord dictionary are not yet supported;
- synthesised tones are used rather than bundled sampled guitar audio;
- creative recordings rely on browser MediaRecorder support and are assessed by structured self-review.

See [ROADMAP.md](ROADMAP.md) for future directions grounded in these findings.
