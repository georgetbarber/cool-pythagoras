# V7 Playing-Based Learning Layer

## Purpose

The Play Lab follows a deliberate sequence:

1. Select or play a guitar shape.
2. Hear the exact selected pitches.
3. Identify plausible chord names.
4. Explain intervals, bass position, completeness, and tonal context.
5. Change one relationship and compare the result.
6. Save exact voicings into a short progression.

## Chord Identification

The first implementation supports major, minor, diminished and augmented
triads; power and suspended chords; and common seventh chords.

Candidates are ranked by:

- exact versus partial interval-set match
- bass/root agreement
- missing or additional tones
- tonal context

Multiple candidates remain visible when the notes are genuinely ambiguous.
Rootless jazz voicings and extended chords are deliberately not guessed.

## Microphone And Recording

Microphone access is opt-in. Processing stays in the browser.

- Pitch detection is monophonic and intended for one sustained note.
- Rhythm assessment detects four separated attacks after a four-click count-in.
- Guitar takes are recorded with the browser's `MediaRecorder` support.
- Recorded blobs remain in memory and are discarded when the page closes.
- No audio is uploaded or persisted.

## Practice Scheduling

Each skill now stores an interval, ease value, and due date.

- A first successful retrieval returns after one day.
- A second successful retrieval returns after three days.
- Later intervals expand using the skill's ease value.
- An incorrect answer becomes due immediately.

This is intentionally simpler than a full SM-2 implementation, but it makes
review timing visible and testable without pretending that every attempt has
the same learning value.

## Browser Coverage

Playwright tests cover desktop and mobile navigation, context disclosure,
fretboard shape entry, chord discovery, custom progression creation, modal
chord inspection, microphone-denial handling, and narrow-screen usability.
