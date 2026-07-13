import type { Lesson } from "../domain/types";

export const LESSONS: readonly Lesson[] = [
  {
    id: "pitch-map",
    title: "Pitch Classes and the Fretboard",
    summary: "Connect the repeating 12-note system to physical guitar positions.",
    body: [
      "Every fret raises a string by one semitone. After 12 frets, the same pitch class returns one octave higher.",
      "Enharmonic names such as F# and Gb can share a fret while serving different jobs in written harmony.",
      "Use the Explorer's scale overlay to trace one pitch class across all six strings."
    ],
    checkpoint: "Find every C on the standard-tuned fretboard before revealing labels."
  },
  {
    id: "chord-building",
    title: "Building Chords from Intervals",
    summary: "Understand why the third and seventh define harmonic identity.",
    body: [
      "Major and minor triads differ only in the size of the third.",
      "Seventh chords add functional detail: a major seventh softens tonic color, while a minor seventh creates dominant pull over a major triad.",
      "On extended guitar voicings, the fifth is often omitted before the third, seventh, or extension."
    ],
    checkpoint: "Build one major, minor, and dominant seventh chord in Practice."
  },
  {
    id: "diatonic-harmony",
    title: "Diatonic Harmony",
    summary: "Derive chords by stacking notes from a selected scale.",
    body: [
      "Each scale degree can become a chord root. Stacking every other scale note produces thirds.",
      "The resulting chord qualities change by mode because the distance between scale notes changes.",
      "Roman numerals describe both scale degree and chord quality without locking the idea to one key."
    ],
    checkpoint: "Compare C major and C Dorian, then identify the chord that reveals Dorian's natural sixth."
  },
  {
    id: "voice-leading",
    title: "Voicings and Voice Leading",
    summary: "Turn pitch collections into playable, economical guitar shapes.",
    body: [
      "A chord name describes pitch classes, not a unique grip.",
      "A playable voicing chooses one note per used string and keeps the fret span within the hand's reach.",
      "Good progression playing minimizes movement between corresponding voices."
    ],
    checkpoint: "Choose a progression and compare compact and drop-2 voicings."
  }
];
