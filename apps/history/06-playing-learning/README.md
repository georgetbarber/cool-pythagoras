# Guitar Academy V6

V6 is an isolated, evolutionary improvement of V5. It does not
import code, state, or assets from the original, V2, V3, or V4 applications.

> Historical status: iteration 06, preserved for comparison. Active development
> belongs in [`../../current`](../../current/).

Its central rule is that musical information must retain a reference:

- Notes are understood relative to a tonal centre.
- Scale degrees and chord tones remain distinct.
- Chord quality is separated from harmonic function.
- Shapes are treated as movable interval structures.
- Progressions are taught as functional movement through time.
- Ear prompts establish the tonic before asking for a relationship.

## Workspaces

- **Dashboard:** orientation and recommended next action
- **Learn:** prerequisite-aware knowledge and play-along lessons
- **Explore:** one pitch across tonic, scale, chord, sound, and fretboard
- **Fretboard:** movable interval geometry, octave transfer, inversions, and compact chord shapes
- **Harmony:** chord construction, Roman numerals, quality, and function
- **Progressions:** genre forms and functional timelines
- **Ear:** assessed melodic and harmonic relationship listening
- **Practice:** retry-first exercises with worked explanations and context-specific evidence
- **Play Along:** tempo-controlled progression application using displayed guitar voicings
- **Play Lab:** fretboard chord discovery, custom progressions, microphone feedback, timing checks, and local recorded takes
- **My Path:** learner goals, genres, priorities, and practice time that influence recommendations

## Architecture

```text
src/
  app/          Application shell and workspace composition
  application/  Versioned state, commands, persistence, and derived model
  audio/        Web Audio playback and progression scheduling
  components/   Shared fretboard, context, help, and relationship UI
  content/      Validated lesson and progression-shaped content
  core/
    instrument/ Tuning, fretboard geometry, intervals, and chord shapes
    music/      Tonal context, scales, chords, functions, and relationships
  features/     Independently scoped learning workspaces
  learning/     Learner profile, mastery evidence, recommendations, exercises
  styles/       Responsive visual system
```

## Run

```bash
cd apps/history/06-playing-learning
npm install
npm run dev
```

V6 runs at [http://localhost:4182](http://localhost:4182).
After installing dependencies once, `./start.command` launches the same server.

## Verify

```bash
npm test
npm run build
npm run test:e2e:install
npm run test:e2e
```

## V6 Improvements

- Correct blues spelling and half-diminished seventh-chord labels
- Mode-aware harmonic-function explanations
- Playable voicings with inversion, bass interval, fret pattern, and voice movement
- Five-form CAGED geography and triad inversions across string sets
- Common-chord identification with partial and ambiguous alternatives
- Clickable progression chords with notes, interval structure, context, shape, and experiments
- User-built progressions that retain exact selected guitar voicings
- Opt-in monophonic pitch feedback and four-attack rhythm assessment
- Browser-local guitar recording and playback; audio is never uploaded
- Spaced-practice due dates driven by successful and unsuccessful retrieval
- Guided lesson actions instead of text-only completion
- Sound-before-symbol ear assessment
- Practice feedback that supports retry before revealing an answer
- Explicit warnings when a progression temporarily changes modal context
- Progressive disclosure for global study controls
- Regression tests for theory, fretboard geometry, learning evidence, and every major page

## Honest Limitations

Reference tones and progression playback remain synthesised. The Play Lab can
record and replay the learner's real guitar locally, but V6 does not bundle
third-party guitar samples. Microphone pitch detection is monophonic, rhythm
assessment expects separated attacks, chord discovery covers common formulas
rather than exhaustive extensions or rootless voicings, and shape generation
still prioritises compact consecutive-string voicings.
