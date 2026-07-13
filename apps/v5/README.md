# Guitar Academy V5

V5 is an isolated, relationship-first guitar learning application. It does not
import code, state, or assets from the original, V2, V3, or V4 applications.

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
- **Fretboard:** movable interval geometry and compact chord shapes
- **Harmony:** chord construction, Roman numerals, quality, and function
- **Progressions:** genre forms and functional timelines
- **Ear:** contextual tonic-target-tonic listening
- **Practice:** five evidence-recording exercise families
- **Play Along:** tempo-controlled progression application
- **My Path:** learner goals, genres, priorities, and practice time

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
cd apps/v5
npm install
npm run dev
```

V5 runs at [http://localhost:4180](http://localhost:4180).

## Verify

```bash
npm test
npm run build
```

## Current Scope

V5 establishes the product and engineering foundation for a larger curriculum.
The content catalogue is deliberately structured so additional lessons,
exercise generators, progressions, backing arrangements, tunings, and
instrument-feedback adapters can be added without coupling them to page UI.
