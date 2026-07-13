export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ModeId =
  | "major"
  | "minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian";

export type ChordQuality =
  | "Major"
  | "Minor"
  | "Diminished"
  | "Augmented"
  | "Major 7"
  | "Minor 7"
  | "Dominant 7"
  | "Half-diminished 7"
  | "Diminished 7"
  | "Sus4"
  | "Major 9"
  | "Minor 9"
  | "Dominant 9"
  | "Major 11"
  | "Minor 11"
  | "Dominant 11"
  | "Major 13"
  | "Minor 13"
  | "Dominant 13";

export type HarmonicFunction = "Tonic" | "Predominant" | "Dominant" | "Modal";
export type ViewId = "explorer" | "practice" | "lessons" | "systems";
export type VoicingMode = "compact" | "triad" | "drop2" | "full";
export type CagedShape = "off" | "C" | "A" | "G" | "E" | "D";

export interface KeySelection {
  tonic: string;
  tonicPc: PitchClass;
  mode: ModeId;
}

export interface ChordDefinition {
  id: string;
  degree: number;
  numeral: string;
  rootPc: PitchClass;
  rootName: string;
  quality: ChordQuality;
  intervals: readonly number[];
  intervalNames: readonly string[];
  function: HarmonicFunction;
  source: "diatonic" | "borrowed" | "secondary";
  rationale: string;
}

export interface Tuning {
  id: string;
  name: string;
  openMidi: readonly number[];
  labels: readonly string[];
}

export interface FretPosition {
  string: number;
  fret: number;
  midi: number;
  pitchClass: PitchClass;
}

export interface Voicing {
  positions: FretPosition[];
  omittedPitchClasses: PitchClass[];
  fretSpan: number;
  score: number;
}

export interface ProgressionTemplate {
  id: string;
  name: string;
  formula: string;
  degrees: readonly number[];
  description: string;
  modes: readonly ModeId[];
  harmonicDominant?: boolean;
  qualityOverrides?: readonly (ChordQuality | null)[];
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  body: readonly string[];
  checkpoint: string;
}
