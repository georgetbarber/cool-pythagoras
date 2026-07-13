export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type ModeId =
  | "major"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "minor"
  | "locrian"
  | "harmonic-minor";
export type Depth = "essential" | "expanded" | "advanced";
export type LabelMode = "degree" | "chord" | "note" | "combined";
export type StringPolicy = "auto" | 3 | 4 | 5 | 6;
export type ProgressionCategory =
  | "Foundations"
  | "Pop & rock"
  | "Blues"
  | "Jazz"
  | "Minor"
  | "Modal"
  | "Chromatic";
export type WorkspaceId =
  | "dashboard"
  | "learn"
  | "explore"
  | "fretboard"
  | "harmony"
  | "progressions"
  | "ear"
  | "practice"
  | "advanced";

export interface SpelledPitch {
  letter: NoteLetter;
  accidental: number;
  pitchClass: PitchClass;
  name: string;
}

export interface TonalContext {
  tonic: SpelledPitch;
  mode: ModeId;
}

export interface ScaleTone {
  pitch: SpelledPitch;
  degree: number;
  degreeLabel: string;
  interval: number;
  intervalName: string;
}

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "major7"
  | "minor7"
  | "dominant7"
  | "half-diminished7"
  | "diminished7"
  | "minor-major7"
  | "augmented-major7";

export type FunctionFamily =
  | "Tonic"
  | "Tonic expansion"
  | "Predominant"
  | "Dominant function"
  | "Modal color"
  | "Contextual";

export interface ChordTone {
  pitch: SpelledPitch;
  interval: number;
  intervalLabel: string;
  required: boolean;
}

export interface Chord {
  id: string;
  root: SpelledPitch;
  degree: number;
  degreeLabel: string;
  quality: ChordQuality;
  symbol: string;
  romanNumeral: string;
  tones: readonly ChordTone[];
  functionFamily: FunctionFamily;
  functionLabel: string;
  explanation: string;
  source: "diatonic" | "borrowed" | "secondary";
  targetDegree?: number;
}

export interface FretPosition {
  string: number;
  fret: number;
  midi: number;
  pitchClass: PitchClass;
}

export interface Voicing {
  id: string;
  chordId: string;
  positions: readonly FretPosition[];
  omittedPitchClasses: readonly PitchClass[];
  inversion: number;
  bassLabel: string;
  minFret: number;
  maxFret: number;
  physicalSpan: number;
  score: number;
}

export interface VoiceMovement {
  from: FretPosition;
  to: FretPosition;
  semitones: number;
  direction: "held" | "up" | "down";
}

export interface ProgressionAnalysis {
  steps: readonly { chord: Chord; voicing: Voicing | null }[];
  movements: readonly VoiceMovement[][];
  totalMovement: number;
}

export interface ProgressionStepDefinition {
  degree: number;
  quality?: ChordQuality;
  roman?: string;
  label?: string;
}

export interface ProgressionDefinition {
  id: string;
  name: string;
  category: ProgressionCategory;
  formula: string;
  description: string;
  learningFocus: string;
  mode: ModeId | "current";
  sevenths: boolean;
  steps: readonly ProgressionStepDefinition[];
  tags: readonly string[];
}

export interface IntervalGeometry {
  semitones: number;
  label: string;
  name: string;
  colour: string;
  tendency: string;
  consonance: string;
}

export interface RelationshipFacts {
  pitch: SpelledPitch;
  tonicInterval: number;
  tonicIntervalLabel: string;
  tonicIntervalName: string;
  scaleTone: ScaleTone | null;
  chordTone: ChordTone | null;
  tendency: string;
  summary: string;
}
