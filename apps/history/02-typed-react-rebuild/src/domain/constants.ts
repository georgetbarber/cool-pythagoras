import type {
  ChordQuality,
  ModeId,
  PitchClass,
  ProgressionTemplate
} from "./types";

export const ROOT_OPTIONS: ReadonlyArray<{ label: string; pc: PitchClass }> = [
  { label: "C", pc: 0 },
  { label: "C#", pc: 1 },
  { label: "Db", pc: 1 },
  { label: "D", pc: 2 },
  { label: "Eb", pc: 3 },
  { label: "E", pc: 4 },
  { label: "F", pc: 5 },
  { label: "F#", pc: 6 },
  { label: "Gb", pc: 6 },
  { label: "G", pc: 7 },
  { label: "Ab", pc: 8 },
  { label: "A", pc: 9 },
  { label: "Bb", pc: 10 },
  { label: "B", pc: 11 }
];

export const MODE_INTERVALS: Record<ModeId, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10]
};

export const MODE_LABELS: Record<ModeId, string> = {
  major: "Major / Ionian",
  minor: "Natural Minor / Aeolian",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian"
};

export const CHORD_FORMULAS: Record<
  ChordQuality,
  { intervals: readonly number[]; names: readonly string[] }
> = {
  Major: { intervals: [0, 4, 7], names: ["1", "3", "5"] },
  Minor: { intervals: [0, 3, 7], names: ["1", "b3", "5"] },
  Diminished: { intervals: [0, 3, 6], names: ["1", "b3", "b5"] },
  Augmented: { intervals: [0, 4, 8], names: ["1", "3", "#5"] },
  "Major 7": { intervals: [0, 4, 7, 11], names: ["1", "3", "5", "7"] },
  "Minor 7": { intervals: [0, 3, 7, 10], names: ["1", "b3", "5", "b7"] },
  "Dominant 7": { intervals: [0, 4, 7, 10], names: ["1", "3", "5", "b7"] },
  "Half-diminished 7": {
    intervals: [0, 3, 6, 10],
    names: ["1", "b3", "b5", "b7"]
  },
  "Diminished 7": {
    intervals: [0, 3, 6, 9],
    names: ["1", "b3", "b5", "bb7"]
  },
  Sus4: { intervals: [0, 5, 7], names: ["1", "4", "5"] },
  "Major 9": { intervals: [0, 4, 7, 11, 2], names: ["1", "3", "5", "7", "9"] },
  "Minor 9": { intervals: [0, 3, 7, 10, 2], names: ["1", "b3", "5", "b7", "9"] },
  "Dominant 9": { intervals: [0, 4, 7, 10, 2], names: ["1", "3", "5", "b7", "9"] },
  "Major 11": {
    intervals: [0, 4, 7, 11, 2, 5],
    names: ["1", "3", "5", "7", "9", "11"]
  },
  "Minor 11": {
    intervals: [0, 3, 7, 10, 2, 5],
    names: ["1", "b3", "5", "b7", "9", "11"]
  },
  "Dominant 11": {
    intervals: [0, 4, 7, 10, 2, 5],
    names: ["1", "3", "5", "b7", "9", "11"]
  },
  "Major 13": {
    intervals: [0, 4, 7, 11, 2, 5, 9],
    names: ["1", "3", "5", "7", "9", "11", "13"]
  },
  "Minor 13": {
    intervals: [0, 3, 7, 10, 2, 5, 9],
    names: ["1", "b3", "5", "b7", "9", "11", "13"]
  },
  "Dominant 13": {
    intervals: [0, 4, 7, 10, 2, 5, 9],
    names: ["1", "3", "5", "b7", "9", "11", "13"]
  }
};

export const PROGRESSIONS: readonly ProgressionTemplate[] = [
  {
    id: "pop-canon",
    name: "Pop Canon",
    formula: "I - V - vi - IV",
    degrees: [0, 4, 5, 3],
    description: "A broad tonic-to-dominant loop.",
    modes: ["major"]
  },
  {
    id: "doo-wop",
    name: "50s Doo-Wop",
    formula: "I - vi - IV - V",
    degrees: [0, 5, 3, 4],
    description: "A classic tonic loop with a relative-minor turn.",
    modes: ["major"]
  },
  {
    id: "blues-turnaround",
    name: "Blues Changes",
    formula: "I7 - IV7 - V7",
    degrees: [0, 3, 4],
    description: "The dominant-seventh chord palette used to build a twelve-bar blues.",
    modes: ["major"],
    qualityOverrides: ["Dominant 7", "Dominant 7", "Dominant 7"]
  },
  {
    id: "jazz-ii-v-i",
    name: "Jazz ii-V-I",
    formula: "ii7 - V7 - Imaj7",
    degrees: [1, 4, 0],
    description: "The standard jazz cadence with seventh-chord color.",
    modes: ["major"],
    qualityOverrides: ["Minor 7", "Dominant 7", "Major 7"]
  },
  {
    id: "axis",
    name: "Extended Axis",
    formula: "I - V - vi - iii - IV",
    degrees: [0, 4, 5, 2, 3],
    description: "An extended variant of the common Axis-style pop loop.",
    modes: ["major"]
  },
  {
    id: "minor-pop",
    name: "Minor Pop",
    formula: "i - VI - III - VII",
    degrees: [0, 5, 2, 6],
    description: "A minor tonic loop built from the relative-major family.",
    modes: ["minor"]
  },
  {
    id: "aeolian-descent",
    name: "Minor Descent",
    formula: "i - VII - VI - V",
    degrees: [0, 6, 5, 4],
    description: "A descending minor-key line ending with a harmonic dominant.",
    modes: ["minor"],
    harmonicDominant: true
  },
  {
    id: "minor-blues",
    name: "Minor Blues Changes",
    formula: "i7 - iv7 - V7",
    degrees: [0, 3, 4],
    description: "The core seventh chords used in a conventional minor blues.",
    modes: ["minor"],
    qualityOverrides: ["Minor 7", "Minor 7", "Dominant 7"]
  },
  {
    id: "emotional",
    name: "Emotional",
    formula: "i - iv - VI - V",
    degrees: [0, 3, 5, 4],
    description: "A minor subdominant movement opening into VI and a strong V.",
    modes: ["minor"],
    harmonicDominant: true
  },
  {
    id: "classic-minor",
    name: "Classic Minor",
    formula: "i - iv - i - V",
    degrees: [0, 3, 0, 4],
    description: "A tonic-centered cadence using the harmonic-minor dominant.",
    modes: ["minor"],
    harmonicDominant: true
  },
  {
    id: "andalusian",
    name: "Andalusian Cadence",
    formula: "i - VII - VI - V",
    degrees: [0, 6, 5, 4],
    description: "The conventional descending minor-key Andalusian cadence.",
    modes: ["minor"],
    harmonicDominant: true
  },
  {
    id: "dorian-vamp",
    name: "Dorian Vamp",
    formula: "i - IV",
    degrees: [0, 3],
    description: "Highlights Dorian's natural sixth through the major IV chord.",
    modes: ["dorian"]
  },
  {
    id: "phrygian-pulse",
    name: "Phrygian Pulse",
    formula: "i - bII",
    degrees: [0, 1],
    description: "Moves directly between the tonic and Phrygian's defining bII.",
    modes: ["phrygian"]
  },
  {
    id: "mixolydian",
    name: "Mixolydian Turn",
    formula: "I - bVII - IV - I",
    degrees: [0, 6, 3, 0],
    description: "Centers the tonic around the characteristic bVII.",
    modes: ["mixolydian"]
  },
  {
    id: "lydian",
    name: "Lydian Lift",
    formula: "I - II - I",
    degrees: [0, 1, 0],
    description: "Uses the bright major II to expose the raised fourth.",
    modes: ["lydian"]
  }
];

export const NOTE_NAMES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
] as const;
