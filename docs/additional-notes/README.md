# Additional Notes — Distilled Takeaways

## Why This Folder Exists

This folder preserves the useful ideas from informal personal project notes
without treating every old request as unfinished work. The source material was:

- a note asking for more enjoyable, ongoing practice activities that use a real guitar;
- requests for playable chord suggestions, clearer relationship labels, and
  fewer confusing interactions between pages;
- a screenshot of an intentionally ambiguous user-built progression.

The raw notes and screenshot are not copied into the repository. Their durable
product conclusions are recorded here and checked against the current app.

## What the Notes Led To

| Original thought | Current status | Where it lives now |
| --- | --- | --- |
| Practice should primarily involve actually playing guitar. | Addressed and still a core principle. | `apps/current/src/features/Practice.tsx` starts ongoing guitar-coach sessions. |
| A session should continue until the learner chooses to stop. | Addressed. | Mixed Coach, Note Hunt, Interval Moves, Chord-Tone Targets, and Triad Shapes have no fixed ending. |
| Existing explanation and non-playing pages should remain available. | Addressed. | The current app retains Learn, Explore, Fretboard, Harmony, Progressions, Ear, Dashboard, and optional theory quick checks. |
| Play Lab should suggest interesting chords that work with a discovered chord and show how to play them. | Addressed. | Chord connections include a musical reason, listening cue, nearby exact voicing, playback, load, and add-next actions. |
| `D3` and `C3`-style abbreviations are confusing because they resemble note names. | Addressed and regression-tested. | Fretboard labels explicitly say `Key`, `Scale degree`, `Chord tone`, or `Interval`. |
| Page interactions should not leave confusing chord or context labels behind. | Addressed as an ongoing correctness rule. | Tonal-context, chord-structure, progression, ear, voicing, and playback changes reset or re-derive dependent state. |
| An unusual progression should not be forced into one confident functional explanation. | Addressed and still a core principle. | Progression analysis distinguishes clear, mixed, and ambiguous contexts and says when Roman numerals show root relationships rather than certain function. |

## Durable Product Guardrails

These ideas remain relevant even though their first implementation exists:

1. **Playing is the centre of practice.** Theory browsing and quick checks should
   support physical practice, not displace it.
2. **Practice can be continuous without becoming aimless.** Each generated prompt
   still needs a root, key, chord, interval, shape, or audible reference.
3. **No-instrument practice is complementary.** Ear, theory, note-location, and
   shape-recognition activities are valuable when a guitar is unavailable.
4. **Suggestions are options, not rules.** Chord connections should explain why
   an option may work, provide a playable voicing, and leave room for musical judgement.
5. **Relationship labels must name their reference.** Never reintroduce initials
   that could be mistaken for note names.
6. **Context changes invalidate dependent explanations.** Resetting stale state is
   part of music-theory correctness, not merely interface polish.
7. **Ambiguity should remain visible.** Exact voicings may be preserved while
   harmonic function remains context-dependent.

### Worked ambiguity example from the screenshot

The captured progression was `Am7 -> Cmaj7 -> Bm7` while the app was set to C
Dorian. Its roots can be described relative to C, but the chord qualities and
tones do not all belong to C Dorian. The useful behaviour is therefore to:

- keep each exact guitar voicing;
- show the root relationships `vi7 -> Imaj7 -> vii7`;
- label altered or chromatic material explicitly;
- recalculate the analysis if the tonal centre changes;
- avoid claiming one certain harmonic function without more musical context.

This is a concrete example of relationship-first analysis being more honest and
more useful than forcing every chord into a diatonic answer.

## Remaining Relevant Thought

The notes imagine practising on a phone during a commute. The present app is
responsive and retains no-guitar theory and ear activities, but it is not a
native mobile application and does not yet offer a purpose-built commute mode.

A sensible future step is to validate a focused phone experience before deciding
that a native app is necessary. That experience should:

- work well without a guitar or microphone;
- use short ear, interval, note-location, and shape-recognition rounds;
- preserve the same relationship language as guitar-led practice;
- synchronize with the same learner evidence model if persistence expands;
- avoid turning portable practice into disconnected trivia.

This is a product direction to test, not a commitment to a new platform or a new
application version.
