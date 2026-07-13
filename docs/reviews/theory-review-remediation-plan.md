# Theory Review Remediation Plan (Implementation Handoff)

**Date:** 2026-07-13
**Scope:** All problems identified and verified across two independent music-theory reviews of the dashboard.
**Audience:** An implementing agent/developer who has NOT read the reviews. Everything needed is in this document. Follow it literally; where judgement is required, the decision has already been made and is stated.

---

## Ground rules for the implementer

1. All paths are relative to `apps/current/`.
2. Match the existing code style: no new dependencies, no refactors beyond what each task specifies, keep the terse functional style of the codebase.
3. After EACH phase, run: `npm run test` and `npm run build` (from `apps/current/`). All existing tests must still pass. New tests are specified in Phase 4.
4. Do not change any behaviour not listed here.
5. Musical facts in this document have been independently verified — do not "correct" them. If code appears to contradict this document, the document wins; flag any true conflict in your summary rather than improvising.
6. String indexing convention used everywhere in this codebase: `string 0` = high E, `string 5` = low E. Open-string MIDI values: `[64, 59, 55, 50, 45, 40]` (high E, B, G, D, A, low E). Tab lines are written the usual way (`e` `B` `G` `D` `A` `E`).

---

# PHASE 1 — Correctness bugs (do these first, in order)

## Task 1.1 — D♭ (and other flat tonics) silently fall back to C major

**Problem (verified).** `createContext` in `src/core/music/theory.ts` (line ~115) resolves the tonic name against the `ROOTS` table (line 12), which contains `C#`, `Eb`, `Ab`, `Bb` but NOT `Db`, `D#`, `Gb`, `G#`, `A#`. Two v8 UI surfaces offer `"Db"` in their key dropdowns:

- `src/v8/components/SettingsPanel.tsx` line ~45: `["C", "Db", "D", "Eb", ...]`
- `src/v8/features/Explore.tsx` line ~25: same list

When a learner picks `Db`, `createContext` fails the lookup and falls back to `ROOTS[0]` = C. **The learner is silently shown C-major theory while believing they chose D♭.**

**Fix.** Make `createContext` resolve enharmonic names instead of falling back. In `theory.ts`, add above `createContext`:

```ts
const TONIC_ALIASES: Record<string, PitchClass> = {
  "C#": 1, "Db": 1,
  "D#": 3, "Eb": 3,
  "F#": 6, "Gb": 6,
  "G#": 8, "Ab": 8,
  "A#": 10, "Bb": 10
};
```

Rewrite `createContext`:

```ts
export function createContext(tonicName = "C", mode: ModeId = "major"): TonalContext {
  const root = ROOTS.find(([name]) => name === tonicName);
  if (root) return { tonicName: root[0], tonic: root[1] as PitchClass, mode };
  const aliased = TONIC_ALIASES[tonicName];
  if (aliased !== undefined) return { tonicName, tonic: aliased, mode };
  return { tonicName: ROOTS[0][0], tonic: ROOTS[0][1] as PitchClass, mode };
}
```

This is safe because the spelling engine (`buildScale` → `spellName`) derives letters from `tonicName[0]` and computes accidentals per pitch class, so `"Db"` correctly yields D♭–E♭–F–G♭–A♭–B♭–C. (Verified: `spellName` handles multi-flat/sharp spellings including C♭ and E♯.)

**Also:** the `preferFlats` heuristics in `buildChordFromRoot` (theory.ts) and `identifyChord`/`contextualName` (chordDiscovery.ts, practiceCoach.ts) test `context.tonicName.includes("b")` — these now work correctly for `"Db"` with no change needed.

**Do NOT** change the dropdown lists themselves; `Db` is the friendlier spelling for major-mode use and should remain offered.

**Acceptance:** choosing `Db` in v8 Settings or v8 Explore shows a scale starting on D♭ (pitch class 1) with the spelling D♭ E♭ F G♭ A♭ B♭ C, and Roman-numeral chords rooted accordingly. Unit test in Phase 4 (Task 4.1).

---

## Task 1.2 — v8 lesson audio is arbitrary (most serious pedagogical bug)

**Problem (verified).** `src/v8/components/ActivityPlayer.tsx` lines 27–33:

```ts
const hear = (harmonic = false) => {
  setAttempted(true);
  const tonic = 60;
  const target = 60 + ((unit.order * 2 + activity.kind.length) % 12);
  ...
};
```

The "Hear reference and target" / "Hear together" buttons compute the target pitch from **the unit's order number and the length of the activity-kind string**. The audio has no relationship to the lesson content. A lesson about octaves can play a tritone. Because these buttons appear on `listen-compare`, `sing-predict`, and `relationship` activities in **every** unit, this actively trains wrong sound–concept associations.

**Fix — three parts.**

### 1.2a — Add authored ear targets to the curriculum data

In `src/v8/types.ts`, extend the `MicroStudy` interface with:

```ts
earTargets?: readonly number[]; // semitones above tonic; cycled by repeated presses
```

In `src/v8/curriculum.ts`, extend `UnitSeed` with `earTargets: number[]`, add it as a 6th tuple element to every unit seed, thread it through `tuple()` and into the `microStudy` object built in the `CURRICULUM` mapping.

Use EXACTLY this table (unit order → targets). Rationale is given so future edits stay principled; do not change the numbers.

| Unit | Title | earTargets | Rationale |
|---|---|---|---|
| 01 | Your musical baseline | `[0]` | Reference tone only |
| 02 | Clean beginnings and endings | `[0]` | Reference tone only |
| 03 | Pulse before speed | `[0]` | Reference tone only |
| 04 | Subdivide the space | `[0]` | Reference tone only |
| 05 | Silence is an action | `[0]` | Reference tone only |
| 06 | Change without losing time | `[0, 7]` | Two-shape motion; fifth as second anchor |
| 07 | Open-string compass | `[5]` | Adjacent strings tuned in fourths |
| 08 | Octaves reveal the neck | `[12]` | Octave identity (see 1.2b for register) |
| 09 | Root and fifth skeleton | `[7]` | Perfect fifth |
| 10 | Thirds change colour | `[3, 4]` | Minor vs major third contrast |
| 11 | Crossing the B string | `[4, 5]` | M3 (G→B tuning gap) vs P4 (all other pairs) |
| 12 | Transpose without losing meaning | `[7, 12]` | Structure preserved under transposition |
| 13 | Home and departure | `[2, 4, 0]` | Matches micro-study 1-2-3-1 |
| 14 | Degrees have character | `[2, 4, 5, 7, 9, 11]` | Major-scale degree ladder |
| 15 | Make a motif | `[2, 4, 7]` | Matches 1-2-3 / 1-2-5 study |
| 16 | Phrase toward a destination | `[0, 7]` | Settled (1) vs open (5) endings |
| 17 | Answer what you hear | `[4, 2, 5]` | Matches 1-3-2 / 2-4-3 study |
| 18 | Find a melody by ear | `[4, 7, 9, 5, 2]` | Varied diatonic targets for search |
| 19 | Triads are relationships | `[4, 7]` | Third and fifth above root |
| 20 | Inversions change perspective | `[4, 7, 12]` | Reordered chord tones |
| 21 | Keep what can stay | `[4, 9]` | Shared third of I/vi; root of vi |
| 22 | Hear each moving voice | `[4, 5, 7]` | Top voice 3-4-5 in the study |
| 23 | Target the changing chord | `[4, 9, 11]` | Thirds of I, IV, V |
| 24 | First harmonised phrase | `[4, 2, 0]` | Melody 3-2-1 |
| 25 | A riff is rhythm plus contour | `[7]` | Root–fifth engine (after Task 2.1 fix) |
| 26 | Syncopation creates lift | `[0]` | Rhythm unit; reference only |
| 27 | Articulation changes meaning | `[0]` | Same pitches, different touch |
| 28 | Develop an idea | `[2, 4, 7]` | 1-2-3 → 1-2-5 |
| 29 | Improvise with constraints | `[3, 5]` | The 1, ♭3, 4 pitch set |
| 30 | Compare musical dialects | `[0]` | Time/touch focus, not pitch |
| 31 | Departure, tension, return | `[5, 7, 0]` | Roots of IV, V, I |
| 32 | Loops tell different stories | `[9, 5]` | Roots of vi and IV |
| 33 | Blues bends the categories | `[3, 4, 10]` | ♭3 vs 3 ambiguity; ♭7 colour |
| 34 | Modes keep a different light | `[9, 10]` | Dorian natural 6; Mixolydian ♭7 |
| 35 | Borrow colour deliberately | `[9, 8]` | 6 (in IV) vs ♭6 (in iv) |
| 36 | Outside is not wrong | `[1, 11]` | Semitone approaches from either side |
| 37 | Harmonic rhythm shapes pace | `[0]` | Pacing focus |
| 38 | Build and release tension | `[7, 11, 0]` | Stability → tension → release |
| 39 | Repetition earns contrast | `[2, 4]` | Motif family steps |
| 40 | Create an A/B form | `[0]` | Form focus |
| 41 | Bass movement reframes harmony | `[11, 9, 7]` | Descending line C-B-A-G relative to tonic |
| 42 | Arrange the guitar part | `[0]` | Texture focus |
| 43 | Transcribe a fingerprint | `[0]` | Reference only |
| 44 | Transform what you learned | `[0]` | Reference only |
| 45 | Reharmonise one melody | `[4, 9]` | Same melody note, changed harmonic role |
| 46 | Revise with intention | `[0]` | Reference only |
| 47 | Finish a complete original | `[0]` | Reference only |
| 48 | Design your next path | `[0]` | Reference only |

### 1.2b — Use the targets in ActivityPlayer

Replace the `hear` function in `ActivityPlayer.tsx` with:

```ts
const [earIndex, setEarIndex] = useState(0);
const targets = unit.microStudy.earTargets ?? [0];
const hear = (harmonic = false) => {
  setAttempted(true);
  const tonicPc = createContext(state.settings.tonicName, state.settings.mode).tonic;
  const semitones = targets[earIndex % targets.length];
  setEarIndex((i) => i + 1);
  if (harmonic) playHarmonicRelationship(tonicPc, normalize(tonicPc + semitones));
  else playMelodicRelationship(tonicPc, normalize(tonicPc + semitones));
};
```

Import `createContext` and `normalize` from `../../core/music/theory`. Note: `playMelodicRelationship`/`playHarmonicRelationship` (src/audio/engine.ts lines 103–118) take pitch classes; the octave target (12) therefore normalizes to 0 — acceptable: unit 08's audio plays the tonic in two registers only if the engine supports it, otherwise a unison reference is still honest. Do not modify the audio engine for this task.

### 1.2c — Honest button labels

Where `targets` is exactly `[0]`, render the primary button label as **"Hear the tonic reference"** and hide the "Hear together" button (a unison played together is meaningless). For all other units keep the current labels.

**Acceptance:** for unit 10, repeated presses alternate a minor third and a major third above the user's chosen tonic. For unit 01, the button plays only the tonic and is labelled accordingly. No audio anywhere depends on `activity.kind.length` or `unit.order`.

---

## Task 1.3 — "Thirds change colour" micro-study plays a fifth and a minor sixth, not thirds

**Problem (verified by pitch arithmetic).** `src/v8/curriculum.ts` line ~37, unit 10 study tab:

```
["A|--3-----------|", "D|------5---6---|"]
```

A-string fret 3 = C. D-string fret 5 = G (perfect fifth above C); fret 6 = G♯/A♭ (minor sixth). The unit's entire point is the one-fret m3/M3 difference, and the reference example demonstrates the wrong intervals.

**Fix.** Change the root to E (A-string fret 7) so the existing D-string frets become correct thirds: E→G = minor third, E→G♯ = major third. Replace the study tuple's tab with:

```
["A|--7-----------|", "D|------5---6---|"]
```

Change nothing else in the tuple.

**Acceptance:** the two D-string notes are 3 and 4 semitones above the A-string root note. Covered by the Phase 4 tab-audit test (Task 4.2).

---

## Task 1.4 — Blues IV7 and V7 cannot be selected in v8 Explore

**Problem (verified).** `src/v8/features/Explore.tsx` line ~19:

```ts
const chord = chords[chordDegree - 1] ?? chords[0];
```

In blues mode, `buildChords` returns exactly three chords whose `degree` fields are 1, 4, 5 (NOT indices 0,1,2 ↔ degrees 1,2,3). Clicking IV7 sets `chordDegree = 4` → `chords[3]` → `undefined` → falls back to I7. IV7 and V7 are unselectable; the UI silently shows I7 analysis for them.

**Fix.** Replace with degree lookup:

```ts
const chord = chords.find((item) => item.degree === chordDegree) ?? chords[0];
```

Also add a guard so a stale degree resets when the mode changes (e.g. switching from major with degree 6 selected into blues):

```ts
useEffect(() => {
  if (!chords.some((item) => item.degree === chordDegree)) setChordDegree(1);
}, [chords]); // chordDegree deliberately omitted; this is a reset-on-context-change
```

**Acceptance:** in blues mode all three picker buttons select their own chord (check the `roman` heading changes to IV7 / V7). In major mode all seven remain selectable. Unit test in Task 4.3.

---

## Task 1.5 — Rhythm notation is musically false

**Problem (verified).** `src/v8/components/RhythmNotation.tsx` draws every non-`rest` token as an identical filled notehead with a stem. Consequences: whole, half, quarter and eighth notes all look the same; the token `tie` is drawn as a NEW attack (the opposite of a tie); non-rhythm strings like `"record compare revise"` are rendered as fake three-note rhythms. Additionally some curriculum rhythm strings do not match their tabs (see 1.5b).

### 1.5a — Rewrite the renderer

Rules for `RhythmNotation.tsx`:

1. Define the vocabulary: `whole`, `half`, `quarter`, `eighth`, `sixteenth`, `rest`, `tie`, `dotted-half`, `dotted-quarter`.
2. **If any token is outside the vocabulary, do not draw notation at all.** Render the figure with the pattern as styled descriptive text (keep the existing `<figcaption>`; replace the SVG with a simple text card such as `<p className="rhythm-words">{pattern}</p>`). This covers curriculum strings like `"straight swing syncopated"`, `"free over pulse"`, `"section A section B"`, `"record compare revise"`, `"unknown"`, `"A B A' ending"`, `"listen choose plan"`, `"sparse dense sparse dense"`, `"original transformed"` — these are descriptions, not rhythms, and must never be drawn as notes.
3. Glyphs (keep the existing single-line SVG layout and x-spacing logic):
   - `whole`: hollow notehead (circle with `fill="none"`), no stem.
   - `half` / `dotted-half`: hollow notehead + stem; dotted variants add a small filled dot to the right of the head.
   - `quarter` / `dotted-quarter`: filled notehead + stem (current drawing).
   - `eighth`: filled notehead + stem + a single flag (a short curved/diagonal path from the stem top, e.g. `M{x+7} 32 q10 4 8 14`).
   - `sixteenth`: as eighth with two flags.
   - `rest`: keep the current rest glyph.
   - `tie`: draw NO new notehead. Draw a slur arc from the previous drawn note's head to a point one slot to the right (e.g. `M{prevX} 60 q {gap/2} -14 {gap} 0` with `fill="none"`), and extend nothing else. If `tie` is the first token, treat the pattern as invalid (rule 2).
4. Keep the per-token text labels under the line; label a tie slot `(tie)`.

### 1.5b — Fix curriculum rhythm strings that contradict their tabs

In `src/v8/curriculum.ts`:

1. **Unit 04 "Subdivide the space"**: rhythm is `"eighth eighth eighth eighth"` (4 tokens) but the tab plays 8 notes (`E|--0-0-0-0-0-0-0-0--|`) and the count line shows `1 + 2 + 3 + 4 +`. Change rhythm to `"eighth eighth eighth eighth eighth eighth eighth eighth"`. (The renderer's `.slice(0, 8)` already accommodates 8 tokens.)
2. **Unit 26 "Syncopation creates lift"**: rhythm is `"eighth rest eighth tie"`, which neither fills 4/4 nor matches the count lines (`Count 1 + 2 + 3 + 4 +` / `Play + + 4`). Change rhythm to `"rest eighth rest eighth rest eighth quarter tie"` — silences on 1, 2, 3; attacks on each "+"; landing on beat 4 held through the bar-end (tie).
3. Leave all deliberately non-rhythm strings (listed in 1.5a rule 2) unchanged — the renderer now handles them as text.

**Acceptance:** unit 03 shows four identical quarter glyphs; unit 02 shows two hollow half-note glyphs; unit 26 shows rests+eighths and a tie arc with no extra attack; unit 43 ("unknown") shows no fake notation. Validation test in Task 4.4.

---

## Task 1.6 — Harmonic-rhythm data is ignored during playback

**Problem (verified).** Sketches store per-chord `beats` (editable 1–16 in the chord track, `src/v8/features/Create.tsx` line ~100) and a metre (4/4, 3/4, 6/8), but `play()` (line ~65) discards both, and `startVoicingProgression` (`src/audio/engine.ts` lines 138–154) hardcodes every chord to `(60000 / bpm) * 4` ms. The stage-7 unit "Harmonic rhythm shapes pace" teaches exactly the thing this control fails to do.

**Fix.**

### 1.6a — Engine

Change the signature to accept optional per-voicing beat counts (backward-compatible):

```ts
export function startVoicingProgression(
  voicings: readonly (readonly number[])[],
  bpm: number,
  onStep?: (index: number) => void,
  beats?: readonly number[]        // beats per voicing; default 4 each
): () => void {
  stopAudio();
  const beatMs = 60000 / bpm;
  let elapsed = 0;
  voicings.forEach((voicing, index) => {
    const durationMs = beatMs * (beats?.[index] ?? 4);
    const at = elapsed;
    elapsed += durationMs;
    const timer = window.setTimeout(() => {
      onStep?.(index);
      playVoicing(voicing, 0, Math.max(0.55, durationMs * 0.0008));
    }, at);
    activeTimers.push(timer);
  });
  activeTimers.push(window.setTimeout(() => onStep?.(-1), elapsed));
  return stopAudio;
}
```

### 1.6b — Callers (all three; verified list)

- `src/v8/features/Create.tsx` line ~67: pass the stored beats:
  `startVoicingProgression(voicings, sketch.tempo, () => undefined, sketch.chords.map((event) => event.beats));`
- `src/features/PlayAlong.tsx` line ~48: no change required (omitting `beats` keeps 4-beat bars), but verify it still compiles.
- `src/features/PlayLab.tsx` line ~126: same — verify only.

Metre (3/4, 6/8) affects grouping, not this scheduler; per-chord beats already express it (a 3/4 bar = beats 3). Do not attempt metre-aware accenting in this task.

**Acceptance:** a sketch with chords at 2, 4, and 8 beats audibly holds them for 1:2:4 relative durations. Unit test in Task 4.5 (assert scheduler timing math, not audio).

---

# PHASE 2 — Content corrections (small, exact edits)

## Task 2.1 — "Root-fifth engine" riff is root–minor-third

**Problem (verified).** `src/v8/curriculum.ts` unit 25 study tab: `["E|--0-0-x-3-0---|", "accent the return"]`. Low-E fret 3 = G = minor third above E, not a fifth. The unit title, focus and the stage-2 root-fifth unit all promise a fifth.

**Fix.** Replace the first tab line with `"E|--0-0-x-7-0---|"` (low-E fret 7 = B = perfect fifth above E). Keep the caption line.

## Task 2.2 — Garbled description of the perfect fourth

**Problem (verified).** `src/features/intervalData.ts`, the `"4"` entry: "A stable distance that often suspends against a major third." A sus4 chord *replaces* the third and resolves *down to* it; the sentence as written is meaningless.

**Fix.** Replace the description with:

```
"Open and neutral melodically; in a sus4 chord it takes the third's place and typically resolves down to it."
```

## Task 2.3 — Tritone label vs sharp note names

**Problem (verified, low severity).** `INTERVAL_LABELS` in `theory.ts` has no `#4`/`#5`; six semitones always displays as `b5`, so F♯ against C reads "F♯ is b5 relative to C" — a sharp name with a flat label. Accepted simplification; fix only the explanation text.

**Fix.** In `src/features/intervalData.ts`, change the `"b5"` entry description to:

```
"Maximum instability, often resolving by semitone. Spelled ♯4 or ♭5 depending on direction; this app labels it ♭5."
```

## Task 2.4 — State the Roman-numeral convention

**Problem.** Natural minor is labelled i–ii°–♭III–iv–v–♭VI–♭VII (pop/rock convention, flats relative to the major scale). Classical texts often write III, VI, VII without flats in minor. The app never says which convention it uses.

**Fix.** In `src/content/catalog.ts`, extend `HELP.romanNumerals.body` by appending:

```
 This app labels degrees relative to the major scale in every mode, so natural minor reads i, ii°, bIII, iv, v, bVI, bVII. Classical texts sometimes omit those flats in minor; both describe the same chords.
```

## Task 2.5 — Name the pentatonic connection

**Problem.** The blues collection (1 ♭3 4 ♭5 5 ♭7) is the minor pentatonic plus ♭5, but the app never names the pentatonic — the single most common guitar scale vocabulary word.

**Fix (text only, two places).**

1. `theory.ts`, `MODES.blues.character` → replace with:
   `"The minor pentatonic (1, b3, 4, 5, b7) plus the b5 blue note: a six-note expressive collection built around minor colour."`
2. `src/v8/curriculum.ts` unit 29 ("Improvise with constraints") — append to its `focus` string nothing; instead change the second tab caption line from `"leave one beat of silence"` to `"leave one beat of silence · these live inside the minor pentatonic"`.

## Task 2.6 — Blues intonation note

**Problem.** The blue third/fifth are treated as fixed equal-tempered pitches; bending and inflection are never mentioned in the blues content.

**Fix (text only).** In `src/v8/curriculum.ts` unit 33 ("Blues bends the categories"), the seed's outcome currently ends "...without forcing one classical explanation." Append one sentence:

```
 On guitar the b3 and b5 are often bent slightly sharp toward 3 and 5 — the colour lives between the frets.
```

(These seeds are plain strings in the `STAGES` array; edit the string in place.)

---

# PHASE 3 — Pedagogy and design improvements

## Task 3.1 — Triads before sevenths in v8 Explore and Create

**Problem (verified).** Both `src/v8/features/Explore.tsx` (line ~18) and `src/v8/features/Create.tsx` (line ~45) call `buildChords(context, true)` — seventh chords from day one — while the curriculum introduces triads in stage 4 and sevenths later. The v1 Harmony feature already has the right pattern (an "Add sevenths" toggle).

**Fix.** In both files, default to triads and add a sevenths toggle:

1. Add local state: `const [sevenths, setSevenths] = useState(false);`
2. Change to `buildChords(context, sevenths)`.
3. Render a toggle matching the v1 pattern (`src/features/Harmony.tsx` lines ~18–22):
   ```tsx
   <label className="toggle">
     <input type="checkbox" checked={sevenths} onChange={() => setSevenths(!sevenths)} />
     Add sevenths
   </label>
   ```
   In Explore put it in the `.context-controls` header div; in Create put it in the chord-track `<header>` next to the add-chord select.
4. Blues mode ignores the flag by design (`buildChords` returns I7/IV7/V7 regardless) — no special handling needed, but do not "fix" that.
5. In Create, note that existing sketches store chord `symbol` strings; `addChord` falls back to `chords[0]` when a symbol isn't found. With triads default, a previously added `Cmaj7` still renders from its stored voicing — only the *picker* contents change. No migration needed.

**Acceptance:** fresh v8 Explore shows I, ii, iii… triad symbols (C, Dm, Em…); toggling shows Cmaj7, Dm7…; blues mode always shows I7/IV7/V7.

## Task 3.2 — Chromatic targets shown as raw pitch-class numbers

**Problem (verified).** `src/v8/features/Explore.tsx` line ~28 renders `Possible semitone targets: ${chromatic.possibleTargets.join(", ")}` — learners see `0, 2` instead of note names.

**Fix.** Map to contextual names:

```ts
`Possible semitone targets: ${chromatic.possibleTargets
  .map((pc) => scale.find((tone) => tone.pitchClass === pc)?.name ?? noteName(pc, context.tonicName.includes("b")))
  .join(", ")}`
```

Import `noteName` from `../../core/music/theory`.

## Task 3.3 — Make the diagnostic baseline actually do something

**Problem (verified).** `startingBaseline` (`"repair" | "some" | "secure"`, set during onboarding in `src/app/App.tsx` line ~67, stored in `src/v8/store.tsx` line ~28) is never read by the learning engine. The onboarding copy implies placement and "transfer checks" that do not exist.

**Fix (minimal honest version — do NOT build a placement engine):**

1. In `src/v8/store.tsx` (or wherever the initial `activeUnitId` is set after the diagnostic completes), set the starting unit from the baseline: `repair` → `unit-01`, `some` → `unit-03`, `secure` → `unit-07`. Earlier units remain available in the Path view, just not the starting recommendation.
2. Find the onboarding copy in `src/app/App.tsx` around line 67. If it promises transfer checks or adaptive placement, rewrite it to describe only what now happens, e.g.: "Your answer chooses where the path starts. You can open any earlier unit at any time, and nothing is marked as mastered without you doing it."
3. Add a one-line note in `docs/curriculum-v8.md` under "Evidence rules": "The starting baseline sets the initial recommended unit only; it grants no mastery records."

**Acceptance:** choosing "secure" during onboarding lands the learner on unit-07 as the recommended next unit; no evidence records are created by onboarding; no UI text promises unimplemented adaptivity.

## Task 3.4 — Functional minor: introduce the raised leading tone

**Problem.** Natural minor only. Learners in A minor meet E7 constantly in real music; the app can currently only call it "Altered colour". Harmonic-minor V deserves first-class treatment as borrowed colour (correct at this level; do not add a harmonic-minor scale mode).

**Fix — three precise edits:**

1. **`src/core/music/chordDiscovery.ts`, `analyzeCandidateInContext`.** In the `scaleRoot` branch (relationship `"altered-diatonic-root"`), add a special case BEFORE the generic return: if `context.mode === "minor"` and the chord root is scale degree 5 (i.e. `normalize(root - context.tonic) === 7`) and quality is `"major"` or `"dominant7"`, return:
   ```ts
   {
     roman,                                    // will read V or V7
     relationship: "borrowed-or-modal",
     functionLabel: "Raised-leading-tone dominant",
     explanation: `${roman} borrows the raised 7th (the leading tone) from harmonic minor, giving a stronger pull to i than the natural-minor v. This is the most common borrowing in minor keys.`
   }
   ```
   Note `romanFor` already renders uppercase `V`/`V7` for major/dominant7 qualities — verify in output.
2. **`src/core/music/chordConnections.ts`, `suggestChordConnections`.** After the existing major/mixolydian block (line ~106), add a parallel block: if `context.mode === "minor"` and `candidate.root === context.tonic`, build and suggest V7 via `buildChordFromRoot(context, normalize(context.tonic + 7), "dominant7", "V7", "Borrowed dominant", "V7 raises the 7th degree to create a leading tone, borrowed from harmonic minor for a stronger return to i.")`, category `"borrowed"`, label `"Add a true dominant"`, listenFor: `"Compare v–i (gentle, modal) with V7–i (directed, classical)."`
3. **`src/v8/curriculum.ts` unit 35 ("Borrow colour deliberately")** — append to its outcome string: ` In minor keys the most common borrowing is the raised leading tone: V or V7 in place of v.`

**Acceptance:** in A natural minor, discovering/playing an E major or E7 chord labels it "Raised-leading-tone dominant" with an explanation mentioning harmonic minor, not "Altered colour". The connections panel on Am suggests E7.

## Task 3.5 — Interval class vs voiced interval: say it where it bites

**Problem (verified).** Intervals are normalised mod 12 throughout (`normalize(position.midi - root.midi)`), so "find a perfect fifth from this root" also accepts a perfect fourth BELOW, and octaves/unisons collapse. Useful for shape identity; confusing when unstated.

**Fix (text only):**

1. `src/content/catalog.ts` — add a HELP entry:
   ```ts
   intervalClass: {
     title: "Interval or interval class?",
     body: "When the app hunts positions across the whole neck it matches pitch-class distance, so a fifth above and a fourth below count as the same relationship. When direction and register matter, the prompt says so."
   }
   ```
2. `src/learning/practiceCoach.ts`, `intervalMove` — the `instruction` currently says "find at least two …s from it". Append to `setup`: ` Positions above and below the root both count: the app matches the relationship in any octave.`
3. `src/features/FretboardLab.tsx` — add `<HelpButton {...HELP.intervalClass} />` beside the existing HelpButton in the fretboard panel heading.

## Task 3.6 — Rhythm-language gaps (scoped)

**Problem.** No triplets, swing, sixteenths or dotted rhythms are modelled anywhere; stage 5 mentions swing verbally ("straight swing syncopated") without ever notating or defining it.

**Fix (scoped to notation vocabulary + one unit):**

1. Task 1.5a already adds `sixteenth`, `dotted-half`, `dotted-quarter` glyph support.
2. `src/v8/curriculum.ts` unit 30 ("Compare musical dialects") — its rhythm string `"straight swing syncopated"` stays (renders as text per 1.5a). Append to the seed's outcome: ` Swing plays pairs of eighths long-short instead of evenly; the notation looks identical, the feel differs.`
3. Do NOT attempt triplet notation or audio swing in this pass; note it in the commit message as deferred.

## Task 3.7 — Generic activity templates (mechanism only — content deferred)

**Problem (verified).** Every one of the 48 units gets the same nine template activities (`ACTIVITY_TEMPLATE`, `src/v8/curriculum.ts` line ~121). "Sing or hum the target" is nonsense for units about attack/release, arrangement, or planning your next practice cycle.

**Fix (mechanism, plus the worst offenders):**

1. Extend `UnitSeed` with optional `overrides?: Partial<Record<ActivityKind, { title?: string; instruction?: string }>>`, and in `makeActivity` apply `seed.overrides?.[kind]` over the template title/instruction.
2. Author overrides ONLY for the `sing-predict` activity of these units (use exactly this wording):
   - Units 01–05: title `"Predict the sound of your action"`, instruction `"Before playing, describe (aloud or internally) how the note will start, sustain and stop. Then play and compare reality with the prediction."`
   - Units 26, 27, 30, 37, 40, 42: title `"Predict the feel"`, instruction `"Before playing, count or sketch the pattern and predict where the emphasis will land. Then play and compare."`
   - Units 43–48: title `"Predict before checking"`, instruction `"Commit to a specific expectation — what you will hear, keep or change — before listening back or looking at the reference."`
3. Everything else stays templated. Full per-unit authoring is future work; do not start it.

**Acceptance:** `validateCurriculum()` still returns no errors; unit 02's sing-predict activity no longer asks the learner to sing an arbitrary target.

---

# PHASE 4 — Tests (assert what learners see and hear)

Existing tests pass but validate only internal theory consistency. Add the following. Place theory-facing tests beside their subjects (`*.test.ts` colocated, matching current convention); curriculum audits go in `src/v8/v8.test.ts` or a new `src/v8/curriculum.test.ts`.

## Task 4.1 — Tonic option resolution

For EVERY key offered by any UI (`["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"]` from v8 Settings/Explore, plus every name in `ROOTS` used by the v1 ContextBar):

- `createContext(name, "major").tonicName === name` (no silent renaming)
- `createContext("Db", "major").tonic === 1`
- `buildScale(createContext("Db", "major")).map(t => t.name)` equals `["Db","Eb","F","Gb","Ab","Bb","C"]`

## Task 4.2 — Micro-study tab audit (this test would have caught bugs 1.3 and 2.1)

Write a tab-parsing helper in the test file:

- A tab token line matches `/^[eBGDAE]\|/`; extract `(string letter, fret)` pairs with a regex on `-(\d+)-` style runs (frets are 1–2 digit numbers separated by dashes; `x` is a mute).
- Map string letter (with position: first `E`-line encountered from a lowercase `e` = high E, uppercase bare `E|` at line start in these tabs = the stated string; in this curriculum every tab line explicitly starts with its string letter, and `e` = high E, `E` = low E) to open MIDI: `e`=64, `B`=59, `G`=55, `D`=50, `A`=45, `E`=40. MIDI = open + fret.

Then assert, for the specific units (do not attempt to auto-verify all 48 — many tab arrays contain annotation lines, degree numbers or captions rather than tab):

- **Unit 08 (Octaves):** the two tab notes are exactly 12 semitones apart.
- **Unit 09 (Root-fifth skeleton):** the D-string note is 7 semitones above the first A-string note.
- **Unit 10 (Thirds change colour, after Task 1.3):** D-string notes are 3 and 4 semitones above the A-string root.
- **Unit 25 (Riff, after Task 2.1):** the non-zero fret note is 7 semitones above the open low E.
- Skip any line that doesn't match the tab-line regex.

## Task 4.3 — Blues chord selection

- `buildChords(createContext("A", "blues"))` returns 3 chords with `degree` values `[1, 4, 5]` and all `quality === "dominant7"`.
- Replicate the Explore lookup: `chords.find(c => c.degree === 4)` is defined and has roman `"IV7"`; the OLD expression `chords[4 - 1]` is `undefined` (regression documentation).

## Task 4.4 — Rhythm pattern validation

Add to `validateCurriculum()` in `src/v8/curriculum.ts` (so it runs wherever validation already runs) — for each unit, tokenize `microStudy.rhythm`; if EVERY token is in the notation vocabulary (`whole half quarter eighth sixteenth rest tie dotted-half dotted-quarter`), then additionally require: no leading `tie`, and total duration in beats (whole=4, dotted-half=3, half=2, dotted-quarter=1.5, quarter=1, eighth=0.5, sixteenth=0.25, rest=1, tie=0) must not exceed beats-per-bar × 2 for the stated metre (loose sanity bound, not strict bar-fill — several studies are deliberately partial). Patterns with any out-of-vocabulary token are exempt (they render as text). Add a test asserting `validateCurriculum()` returns `[]`.

## Task 4.5 — Scheduler respects beats

Test `startVoicingProgression` timing math without audio: mock `window.setTimeout` (vitest `vi.spyOn(window, "setTimeout")`), call with 3 voicings, `bpm = 60`, `beats = [2, 4, 8]`, and assert the scheduled delays are `[0, 2000, 6000]` and the completion callback at `14000`.

## Task 4.6 — ActivityPlayer audio contract

Unit-test the data, not the component: assert every `CURRICULUM` unit has `microStudy.earTargets` with length ≥ 1 and every value in `0..12`. Assert unit 10's targets are `[3, 4]` and unit 01's are `[0]`.

## Task 4.7 — Raised leading tone (after Task 3.4)

- In `createContext("A", "minor")`: `analyzeCandidateInContext(4 /* E */, "dominant7", [0,4,7,10], ctx)` returns `functionLabel === "Raised-leading-tone dominant"` and roman `"V7"`.
- `suggestChordConnections` for an A-minor tonic candidate includes a suggestion whose chord has root `4` and quality `"dominant7"`.

---

# Suggested execution order & sizing

| Order | Task | Size | Risk |
|---|---|---|---|
| 1 | 1.1 Db fallback | S | Low |
| 2 | 1.4 Blues selection | S | Low |
| 3 | 1.3 Thirds tab | XS | None |
| 4 | 2.1 Root-fifth tab | XS | None |
| 5 | 2.2, 2.3, 2.4, 2.5, 2.6 text fixes | S | None |
| 6 | 1.6 Harmonic rhythm | M | Low (3 callers) |
| 7 | 1.5 Rhythm notation | M | Medium (SVG) |
| 8 | 1.2 Activity audio | L | Medium (48-row data + player) |
| 9 | 3.1, 3.2 Explore/Create | M | Low |
| 10 | 3.3 Baseline | M | Medium (copy lives in App.tsx) |
| 11 | 3.4 Functional minor | M | Medium (theory-sensitive; follow spec exactly) |
| 12 | 3.5, 3.6, 3.7 | M | Low |
| 13 | Phase 4 tests | L | Low |

Run `npm run test` and `npm run build` after each numbered row. Commit per row with the task ID in the message (e.g. `fix(theory): resolve Db tonic without C fallback [1.1]`).

---

# Explicitly OUT of scope (do not do these)

- No harmonic/melodic minor scale modes; Task 3.4's borrowed-V treatment is the chosen design.
- No triplet/swing audio or notation beyond Task 3.6.
- No per-unit authored activity content beyond the overrides in Task 3.7.
- No placement/adaptive engine beyond Task 3.3.
- No changes to `INTERVAL_LABELS` (the ♭5-only labelling is an accepted simplification, documented via Task 2.3).
- No changes to CAGED templates, `spellName`, `buildScale`, `romanFor`, chord formulas, or `functionFor` — all verified correct.

# Background: what was verified correct (do not "improve")

The core engine is sound: diatonic letter-order spelling (E♯ in F♯ major, C♭ in A♭ minor), correct diatonic qualities in all five modes (including Dorian's IV7 as a true dominant-quality chord and vi°, Mixolydian's iii°), natural minor's v treated as a modal dominant distinct from V, blues as I7/IV7/V7 with dominant *quality* separated from dominant *function*, borrowed chords labelled as colour rather than key changes, chromatic pitches treated as contextual motion, and correct CAGED/triad/octave fretboard geometry. The failures addressed by this plan are almost all in the bridge between that engine and what learners see and hear.
