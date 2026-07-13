# Product/Learning Review: Stage 1 Guitar Learning

## Review context

The current repo contains useful theory primitives: interval-labelled chord tones, major and minor scale data, a fretboard, diatonic chord tables, progression examples, audio, lessons, and retrieval games. The problem is sequencing. The present experience exposes a large amount of information at once, including modes, altered harmony, extensions, alternate tunings, voicing terminology, chromatic options, and full-neck displays. That makes the app a theory dashboard before it is a learning tool.

Stage 1 should not attempt to explain everything the engine can calculate. It should teach one reusable idea:

> A root plus an interval pattern creates a scale or chord, and that pattern appears in repeatable physical relationships on the guitar.

C major and C natural minor are the right comparison set because they share the same root. A learner can hear and see exactly which degrees change:

- C major: C D E F G A B, or 1 2 3 4 5 6 7
- C natural minor: C D Eb F G Ab Bb, or 1 2 b3 4 5 b6 b7

This keeps the root stable while making the sound and fretboard effect of b3, b6, and b7 explicit.

## 1. The core learning goal

By the end of Stage 1, a learner should be able to:

- Find several C roots on a standard-tuned fretboard.
- Treat those roots as landmarks rather than memorize an undifferentiated grid of note names.
- Build C major and C natural minor from interval formulas.
- See, hear, and play the three changed degrees between the two scales.
- Identify a chord as a subset of its parent scale.
- Build and recognize the C major triad (1 3 5) and C minor triad (1 b3 5).
- Understand that a movable shape preserves interval relationships when its root moves.
- Use a small fretboard area to play a scale fragment, locate chord tones, and create a simple phrase.

The target is functional understanding, not terminology recall. Success is demonstrated when the learner can predict a location or sound before the app reveals it.

## 2. The ideal Stage 1 learner experience

Stage 1 should feel like a short guided investigation, not an open control panel.

### Entry

The learner sees a standard-tuned fretboard limited to a useful region, ideally frets 0-8, and a single prompt:

**Start with C major**

The app identifies one accessible C root, plays it, and asks the learner to find or select another C. It then introduces intervals as distances from C, not as abstract definitions.

### Guided sequence

1. **Find the root**
   The learner locates C on two or three strings. The app names these as root landmarks.

2. **Build C major**
   Degrees appear one at a time: 1, 2, 3, 4, 5, 6, 7. Each addition can be heard. The learner predicts the next location before reveal.

3. **Extract the C major chord**
   The app removes 2, 4, 6, and 7, leaving 1, 3, and 5. It explains: "The C major chord uses three notes from the C major scale."

4. **Change major into natural minor**
   The app keeps 1, 2, 4, and 5 fixed and visibly moves 3, 6, and 7 down one fret to b3, b6, and b7. The before/after sound is played immediately.

5. **Extract the C minor chord**
   The scale fades to leave 1, b3, and 5. The learner sees that one changed chord tone, 3 to b3, changes major to minor.

6. **Use the knowledge musically**
   A simple C-based backing loop or drone plays. The learner targets 1, 3, and 5 over C major, then 1, b3, and 5 over C minor.

7. **Retrieve without labels**
   Labels disappear. The learner identifies roots, changed degrees, and chord tones from position and sound.

### Session shape

Each lesson should use the same loop:

**Predict -> select or play -> hear -> reveal -> explain -> retry**

The app should end with a concrete summary such as:

- "You found 3 C roots."
- "You changed C major to C natural minor."
- "You built both tonic triads from scale degrees."

## 3. What the app should teach first

### A. The fretboard as repeating pitch geography

Teach only the minimum mechanics needed to orient the learner:

- One fret equals one semitone.
- The 12-note sequence repeats at the octave.
- The 12th fret repeats the open-string notes.
- Standard tuning is E A D G B E, with the display orientation made unambiguous.
- The same note occurs in multiple places.

Do not begin with memorizing all notes. Begin with C roots and nearby interval relationships.

### B. Intervals as the durable language

Use degree labels as the primary display and note names as supporting information:

- Primary: 1, 2, 3, 4, 5, 6, 7
- Supporting: C, D, E, F, G, A, B

For natural minor:

- Primary: 1, 2, b3, 4, 5, b6, b7
- Supporting: C, D, Eb, F, G, Ab, Bb

The app should consistently say "b3 is three semitones above the root" and show the physical distance. This lets the learner transfer the idea to other roots.

### C. Small, connected shapes

A shape should be presented as a local map of intervals around a known root, not as a pattern to memorize without meaning.

Stage 1 should teach:

- One compact C major scale region.
- The corresponding C natural minor region.
- The C major and C minor triads embedded inside those regions.
- One connection to the next nearby C root.

Every shape must mark its root and interval contents. The learner should be able to answer, "Where is 1? Where is 3 or b3? Where is 5?" Naming a shape is less important than understanding it.

### D. Scale-to-chord relationships

Teach this hierarchy explicitly:

- Key/scale = available note collection.
- Scale degree = a note's role relative to the root.
- Triad = selected degrees 1, 3, 5 from a root.
- Chord tones are strong targets for melody.

For C major, introduce the diatonic triads only after the tonic relationship is understood:

| Degree | Chord | Notes |
| --- | --- | --- |
| I | C major | C E G |
| ii | D minor | D F A |
| iii | E minor | E G B |
| IV | F major | F A C |
| V | G major | G B D |
| vi | A minor | A C E |
| vii | B diminished | B D F |

For C natural minor, preserve the natural-minor collection:

| Degree | Chord | Notes |
| --- | --- | --- |
| i | C minor | C Eb G |
| ii | D diminished | D F Ab |
| III | Eb major | Eb G Bb |
| iv | F minor | F Ab C |
| v | G minor | G Bb D |
| VI | Ab major | Ab C Eb |
| VII | Bb major | Bb D F |

The existing repo promotes a major V chord in minor and treats minor v as a variant. That is useful later for harmonic minor, but it is not C natural minor. Stage 1 must show G minor as the diatonic v chord. G major or G7 should appear only in a later, clearly labelled explanation of raising Bb to B for stronger resolution.

### E. Hearing before vocabulary expansion

Every visual concept should have an immediate sound comparison:

- 3 versus b3
- C major triad versus C minor triad
- full scale versus isolated chord tones
- 5 resolving to 1

The learner should hear the consequence of an interval change, not merely see a renamed dot.

## 4. What Stage 1 should avoid

Remove or hide these from the Stage 1 path:

- Modes beyond major and natural minor.
- Harmonic and melodic minor until natural minor is secure.
- Seventh chords, ninths, elevenths, and thirteenths.
- Secondary dominants, borrowed chords, Neapolitan chords, and chromatic overrides.
- Diminished and augmented construction drills beyond recognizing the diatonic diminished triad in context.
- Alternate tunings.
- Drop voicings and voicing-omission rules.
- Atonal, serial, microtonal, raga, and maqam material.
- The full CAGED system as five shapes delivered at once.
- Full-neck "all positions" displays by default.
- Time pressure before accuracy.
- Self-grading without an observable learner action.
- Metaphorical labels such as "matrix," "sovereign centre," "domestic structure," "foreign exchange," "geometrist override," or "eustress perimeter."

These items are not inherently bad. They compete with the foundational model and make it difficult for a beginner to know what matters.

## 5. The most important interactions

### 1. Root-first note selection

The learner clicks a fret to identify a requested C root. Correct selections remain visible; incorrect selections give a brief hint such as string name, direction, or distance from a known landmark.

### 2. Major/minor comparison toggle

A single control switches between C major and C natural minor while preserving the same fretboard region. The changed degrees animate by one fret:

- 3 -> b3
- 6 -> b6
- 7 -> b7

This is the highest-value interaction in Stage 1.

### 3. Layer controls with strict defaults

Use three mutually clear views:

- **Scale degrees**
- **Chord tones**
- **Notes**

Default to scale degrees. Avoid showing all layers at once. When chord tones are selected, non-chord scale tones should remain faint enough to preserve context.

### 4. Build rather than browse

Ask the learner to construct:

- C major from its formula.
- C minor from its formula.
- C major triad from 1, 3, 5.
- C minor triad from 1, b3, 5.

Selections should be validated by interval role, with note names revealed afterward.

### 5. Shape tracing

The learner follows a playable route through the selected region, ascending and descending. The app should show suggested fingering only after the learner attempts the sequence.

### 6. Chord-tone targeting

Play a simple C major or C minor loop. Ask the learner to land on the root, third, or fifth. This connects fretboard knowledge to improvisation and makes the scale/chord relationship practical.

### 7. Audio with purpose

Provide separate actions for:

- Play root.
- Play selected interval.
- Play scale.
- Play chord.
- Play major/minor comparison.

Do not use audio only as an ornamental "play everything" button.

## 6. The most important visual explanations

### Interval movement

Show C major and C natural minor in the same region with unchanged notes visually stable and 3, 6, and 7 moving down one fret. A short caption should say:

**Natural minor keeps 1, 2, 4, and 5; it lowers 3, 6, and 7.**

### Chords inside scales

Display all seven scale degrees, then emphasize 1, 3, and 5 while fading the rest. Do this for both C major and C minor. This communicates "subset" more effectively than a separate chord table.

### Root landmarks and octave repetition

Use a distinct, consistent root color. Connect octave-equivalent C notes subtly or reveal them in sequence. The root must never be confused with other chord tones.

### Physical shape plus theoretical meaning

Every illuminated fret should support two label modes:

- Interval label for transfer: 1, b3, 5.
- Note label for orientation: C, Eb, G.

Do not rely on color alone. Labels, contrast, and a small legend should remain available.

### Local context

Visually frame the active fret span. Notes outside the lesson region should be hidden rather than merely dimmed across a crowded full neck. A learner needs a playable map, not proof that the same pitch class exists everywhere.

### Guitar orientation

Always label string names and fret numbers. State whether the high E string is at the top. Open strings and the nut should be visually distinct.

## 7. How to keep the app simple but genuinely useful

Stage 1 can be one screen with:

- A lesson prompt at the top.
- One standard-tuned fretboard.
- A C major/C natural minor switch.
- Scale degrees/chord tones/notes view controls.
- Focused audio controls.
- A short explanation and one next action.

Complexity should be progressive:

1. Show one root.
2. Add a local scale.
3. Extract a triad.
4. Compare major and minor.
5. Add a second root landmark.
6. Test retrieval.
7. Apply it over sound.

The app becomes genuinely useful when it repeatedly connects four representations:

**sound <-> interval <-> note name <-> fret location**

No representation should live in an isolated panel. Selecting a degree should highlight its frets, show its note name, and play its sound. Selecting a chord should show which degrees came from the active scale.

Progress should measure demonstrated capabilities, not clicks or elapsed time. Suggested Stage 1 mastery checks:

- Find two requested C roots without labels.
- Build C major and C natural minor with no more than one hint.
- Identify which three degrees change.
- Build C major and C minor triads.
- Identify 1, 3/b3, and 5 in the active shape.
- Play or select a chord tone over the matching backing sound.

## 8. Specific recommendations for the implementation agent

### Stage 1 product scope

1. Make the default learning context standard tuning, C major, and a limited fret range.
2. Provide only two scale states: C major and C natural minor.
3. Use interval labels as the default fret markers; make note names a toggle or secondary label.
4. Implement the major/minor comparison as a stable visual transition, not two unrelated diagrams.
5. Add focused views for full scale and tonic-triad tones.
6. Add purposeful audio for root, interval, scale, chord, and A/B comparison.
7. Build guided prompts with an attempt before reveal.
8. Save only simple mastery state per skill; a full spaced-repetition system is not required for Stage 1.

### Content and theory rules

1. Use these exact formulas:
   - Major: 1 2 3 4 5 6 7
   - Natural minor: 1 2 b3 4 5 b6 b7
   - Major triad: 1 3 5
   - Minor triad: 1 b3 5
2. Spell C natural minor as C D Eb F G Ab Bb.
3. Treat G minor as the diatonic v chord in C natural minor.
4. Do not introduce G major/G7 without explaining the raised seventh and labelling the result as harmonic-minor behavior.
5. Keep interval meaning relative to the active root. Chord intervals and key/scale degrees must not be visually conflated.

### Interaction acceptance criteria

1. A learner can select a fret and receive correctness feedback tied to the requested interval or note.
2. Switching major/minor leaves 1, 2, 4, and 5 fixed and visibly changes 3, 6, and 7.
3. Selecting "Chord tones" highlights exactly 1, 3, 5 in major and 1, b3, 5 in minor.
4. Every highlighted degree can be heard independently.
5. A reveal follows an attempted answer; it is not the default state.
6. The active lesson can be completed without opening an advanced settings panel.
7. The screen remains understandable without color perception because every important marker has a text label or shape distinction.

### Reuse from the current repo

Reuse the current theory and fretboard concepts where they support the narrow path:

- Major and natural-minor interval arrays.
- Chord interval definitions for major and minor triads.
- Standard-tuning fret calculation.
- Interval-labelled fret markers.
- Basic note and chord audio.
- Click-based fretboard exercises.

Do not carry the existing information architecture into Stage 1. In particular, the large diatonic table, independent key and chord selectors, advanced chord-quality list, mode selector, chromatic and extension toggles, alternate systems, and advanced voicing controls should sit outside the beginner path.

### Recommended implementation order

1. Establish the constrained fretboard and unambiguous orientation.
2. Implement C root finding.
3. Implement C major construction and playback.
4. Implement C major triad extraction.
5. Implement the C major/C natural minor comparison transition.
6. Implement C minor triad extraction.
7. Add attempt-before-reveal checks.
8. Add chord-tone targeting over simple audio.
9. Add mastery checks and completion summary.

The Stage 1 release is successful if a learner leaves understanding why C major and C minor differ, where those differences live on the guitar, and how the scales relate to their tonic chords. It is not successful merely because it can display every correct note.
