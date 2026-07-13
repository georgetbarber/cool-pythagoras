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
export type WorkspaceId =
  | "learn"
  | "explore"
  | "fretboard"
  | "harmony"
  | "progressions"
  | "ear"
  | "practice"
  | "advanced";
export type LabelMode = "degree" | "interval" | "note";
export type HarmonicFunction =
  | "Tonic"
  | "Tonic expansion"
  | "Predominant"
  | "Dominant"
  | "Modal color"
  | "Contextual";

export interface SpelledPitch {
  letter: NoteLetter;
  accidental: number;
  pitchClass: PitchClass;
  name: string;
}

export interface ModeDefinition {
  id: ModeId;
  name: string;
  intervals: readonly number[];
  degreeLabels: readonly string[];
  character: string;
}

export interface TonalContext {
  tonic: SpelledPitch;
  mode: ModeId;
}

export interface ScaleTone {
  pitch: SpelledPitch;
  degree: number;
  degreeLabel: string;
  semitonesFromTonic: number;
}

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "major7"
  | "minor-major7"
  | "augmented-major7"
  | "minor7"
  | "dominant7"
  | "half-diminished7"
  | "diminished7";

export interface ChordTone {
  pitch: SpelledPitch;
  interval: number;
  intervalLabel: string;
  chordToneIndex: number;
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
  function: HarmonicFunction;
  functionExplanation: string;
}

export interface PitchAnalysis {
  pitch: SpelledPitch;
  tonicInterval: number;
  tonicIntervalLabel: string;
  scaleDegree: ScaleTone | null;
  chordTone: ChordTone | null;
  summary: string;
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
  inversion: number;
  fretSpan: number;
  minFret: number;
  score: number;
}

export interface VoiceMovement {
  from: FretPosition;
  to: FretPosition;
  semitones: number;
  direction: "held" | "up" | "down";
}

export interface ProgressionStep {
  chord: Chord;
  voicing: Voicing | null;
}

export interface ProgressionAnalysis {
  steps: readonly ProgressionStep[];
  movements: readonly VoiceMovement[][];
  totalMovement: number;
}
