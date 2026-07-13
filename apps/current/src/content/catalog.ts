import type { ProgressionDefinition } from "../core/music/types";

export type LessonKind = "knowledge" | "play-along";
export type LearningFocus = "fretboard" | "intervals" | "harmony" | "progressions" | "ear" | "improvisation";

export interface LessonStep {
  title: string;
  body: string;
  prompt: string;
  action: "read" | "hear" | "find" | "play";
}

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  level: "foundation" | "developing" | "advanced";
  focus: LearningFocus;
  minutes: number;
  outcome: string;
  prerequisites: readonly string[];
  genres?: readonly ("pop" | "rock" | "blues" | "jazz" | "songwriting" | "freestyle")[];
  steps: readonly LessonStep[];
}

export const PROGRESSIONS: readonly ProgressionDefinition[] = [
  {
    id: "one-four-five",
    name: "Departure and return",
    genre: "Foundations",
    mode: "major",
    formula: "I - IV - V - I",
    degrees: [1, 4, 5, 1],
    description: "The clearest functional journey from home through preparation and tension.",
    learningFocus: "Hear each chord as a state relative to tonic."
  },
  {
    id: "pop-axis",
    name: "Pop axis",
    genre: "Pop",
    mode: "major",
    formula: "I - V - vi - IV",
    degrees: [1, 5, 6, 4],
    description: "A circular pop loop with shared tones and strong melodic continuity.",
    learningFocus: "Track held tones while roots move."
  },
  {
    id: "rock-mixolydian",
    name: "Mixolydian rock",
    genre: "Rock",
    mode: "mixolydian",
    formula: "I - bVII - IV - I",
    degrees: [1, 7, 4, 1],
    description: "A major-centred loop whose bVII creates a broad modal return.",
    learningFocus: "Compare bVII-I with dominant V-I."
  },
  {
    id: "twelve-bar",
    name: "12-bar blues",
    genre: "Blues",
    mode: "major",
    formula: "I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7",
    degrees: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5],
    qualities: Array(12).fill("dominant7"),
    description: "The foundational blues form using dominant colour on all three primary chords.",
    learningFocus: "Separate dominant-seventh quality from dominant function."
  },
  {
    id: "jazz-two-five-one",
    name: "Major ii-V-I",
    genre: "Jazz",
    mode: "major",
    formula: "ii7 - V7 - Imaj7",
    degrees: [2, 5, 1],
    qualities: ["minor7", "dominant7", "major7"],
    description: "The central directed cadence of tonal jazz.",
    learningFocus: "Follow chordal sevenths resolving into the next chord."
  },
  {
    id: "dorian-vamp",
    name: "Dorian vamp",
    genre: "Modal",
    mode: "dorian",
    formula: "i7 - IV7",
    degrees: [1, 4],
    qualities: ["minor7", "dominant7"],
    description: "A two-chord field that makes Dorian's natural sixth audible.",
    learningFocus: "Keep the tonic fixed while hearing one characteristic degree."
  }
];

export const LESSONS: readonly Lesson[] = [
  {
    id: "tonal-home",
    title: "Hear and see home",
    kind: "knowledge",
    level: "foundation",
    focus: "ear",
    minutes: 6,
    outcome: "Recognise the tonic as a reference point rather than just a note name.",
    prerequisites: [],
    steps: [
      {
        title: "A note needs context",
        body: "The same pitch can feel settled, tense, bright, or dark depending on the tonal centre beneath it.",
        prompt: "Listen to the tonic before comparing any other note.",
        action: "hear"
      },
      {
        title: "Find repeated homes",
        body: "Every occurrence of the tonic has the same identity, even when its string and register change.",
        prompt: "Find three tonic positions on different strings.",
        action: "find"
      },
      {
        title: "Return deliberately",
        body: "Resolution becomes clear when a phrase ends on the tonal centre.",
        prompt: "Play any three scale tones, then finish on the tonic.",
        action: "play"
      }
    ]
  },
  {
    id: "interval-map",
    title: "Intervals as movable relationships",
    kind: "knowledge",
    level: "foundation",
    focus: "intervals",
    minutes: 9,
    outcome: "Identify interval meaning separately from fretboard location.",
    prerequisites: ["tonal-home"],
    genres: ["pop", "rock", "songwriting"],
    steps: [
      {
        title: "Measure from a root",
        body: "An interval names the distance and sound relationship between a chosen root and another pitch.",
        prompt: "Choose a root and compare its 3, b3, and 5.",
        action: "hear"
      },
      {
        title: "Move the shape",
        body: "Transposition changes note names while preserving interval structure.",
        prompt: "Move one root-fifth shape to three different frets.",
        action: "play"
      },
      {
        title: "Cross the B string",
        body: "Standard tuning changes one geometric rule between the G and B strings.",
        prompt: "Compare the same interval before and across the G-B boundary.",
        action: "find"
      }
    ]
  },
  {
    id: "chords-from-scales",
    title: "How chords emerge from scales",
    kind: "knowledge",
    level: "developing",
    focus: "harmony",
    minutes: 11,
    outcome: "Connect chord quality, scale degree, Roman numeral, and function.",
    prerequisites: ["interval-map"],
    steps: [
      {
        title: "Stack alternate scale tones",
        body: "Taking every other scale degree creates thirds. Three stacked tones create a triad.",
        prompt: "Build the I, ii, and V chords from the active scale.",
        action: "find"
      },
      {
        title: "Quality is structure",
        body: "Major, minor, and diminished describe interval content, not harmonic purpose.",
        prompt: "Compare the interval formulas 1-3-5, 1-b3-5, and 1-b3-b5.",
        action: "hear"
      },
      {
        title: "Function is contextual",
        body: "Roman numerals and function describe what a chord means relative to a tonal centre.",
        prompt: "Play I-IV-V-I and name home, preparation, tension, and return.",
        action: "play"
      }
    ]
  },
  {
    id: "first-playalong",
    title: "Play the I-IV-V network",
    kind: "play-along",
    level: "foundation",
    focus: "progressions",
    minutes: 10,
    outcome: "Change between three functions in time while hearing their roles.",
    prerequisites: ["tonal-home"],
    genres: ["pop", "rock", "songwriting"],
    steps: [
      {
        title: "Map the three roots",
        body: "Locate I, IV, and V in one compact fretboard area before the pulse begins.",
        prompt: "Say each Roman numeral before playing its root.",
        action: "find"
      },
      {
        title: "Play one chord per bar",
        body: "Use any comfortable voicing. Harmonic timing matters more than complexity.",
        prompt: "Start at 60 BPM and change only on beat one.",
        action: "play"
      },
      {
        title: "Hear the return",
        body: "V creates directed tension. I answers it.",
        prompt: "Mute the strings after V, imagine I, then play the resolution.",
        action: "hear"
      }
    ]
  },
  {
    id: "blues-phrasing",
    title: "Phrase through the blues",
    kind: "play-along",
    level: "developing",
    focus: "improvisation",
    minutes: 14,
    outcome: "Target chord tones while using the blues scale as connecting material.",
    prerequisites: ["interval-map"],
    genres: ["blues", "freestyle"],
    steps: [
      {
        title: "Anchor the form",
        body: "The 12-bar form is a timeline. Know where I, IV, and V occur before adding notes.",
        prompt: "Count the form aloud while listening.",
        action: "hear"
      },
      {
        title: "Target each root",
        body: "A phrase becomes harmonically clear when an important beat lands on the current chord.",
        prompt: "Improvise using only the three chord roots.",
        action: "play"
      },
      {
        title: "Add expressive neighbours",
        body: "The b3, 4, b5, and b7 create blues colour around stable chord tones.",
        prompt: "Approach each target from one fret above or below.",
        action: "play"
      }
    ]
  },
  {
    id: "voice-leading",
    title: "Move chords by their nearest voices",
    kind: "play-along",
    level: "advanced",
    focus: "harmony",
    minutes: 16,
    outcome: "Choose inversions by voice movement rather than isolated shape preference.",
    prerequisites: ["chords-from-scales"],
    genres: ["jazz"],
    steps: [
      {
        title: "Find common tones",
        body: "Held notes create continuity between chords and reduce physical movement.",
        prompt: "Mark shared tones between ii7, V7, and Imaj7.",
        action: "find"
      },
      {
        title: "Resolve tendency tones",
        body: "Chordal sevenths commonly fall by step while leading tones rise.",
        prompt: "Play each moving voice separately before playing full chords.",
        action: "play"
      },
      {
        title: "Connect the cadence",
        body: "A progression becomes one moving texture when each voice has a destination.",
        prompt: "Play ii-V-I without lifting common fingers.",
        action: "play"
      }
    ]
  }
];

export const HELP = {
  tonalCentre: {
    title: "What is the tonal centre?",
    body: "The tonal centre is the note heard as home. Scale degrees, functions, tension, and resolution are all described relative to it."
  },
  degreeVsChord: {
    title: "Degree versus chord tone",
    body: "A tonal degree describes a note relative to the key. A chord tone describes the same note relative to the current chord root. One pitch can have both roles."
  },
  romanNumerals: {
    title: "Why Roman numerals?",
    body: "Roman numerals preserve harmonic relationships when a progression moves to another key. I-IV-V has the same function in C, F#, or Bb. This app labels degrees relative to the major scale in every mode, so natural minor reads i, ii°, bIII, iv, v, bVI, bVII. Classical texts sometimes omit those flats in minor; both describe the same chords."
  },
  shape: {
    title: "What does a shape encode?",
    body: "A shape is a physical arrangement of intervals. Moving it changes absolute notes while preserving its internal relationship, except where tuning geometry changes."
  },
  intervalClass: {
    title: "Interval or interval class?",
    body: "When the app hunts positions across the whole neck it matches pitch-class distance, so a fifth above and a fourth below count as the same relationship. When direction and register matter, the prompt says so."
  },
  function: {
    title: "What is harmonic function?",
    body: "Function describes a chord's role around home: stability, expansion, preparation, tension, modal colour, or return."
  }
} as const;
