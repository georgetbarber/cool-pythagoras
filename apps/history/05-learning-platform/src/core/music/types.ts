export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type ModeId = "major" | "minor" | "dorian" | "mixolydian" | "blues";
export type ChordQuality = "major" | "minor" | "diminished" | "dominant7" | "major7" | "minor7";
export type FunctionFamily = "tonic" | "tonic-colour" | "predominant" | "dominant" | "modal";

export interface TonalContext {
  tonic: PitchClass;
  tonicName: string;
  mode: ModeId;
}

export interface ScaleTone {
  pitchClass: PitchClass;
  name: string;
  degree: number;
  degreeLabel: string;
  interval: number;
  intervalName: string;
}

export interface ChordTone {
  pitchClass: PitchClass;
  name: string;
  interval: number;
  intervalLabel: string;
}

export interface Chord {
  id: string;
  degree: number;
  degreeLabel: string;
  root: PitchClass;
  rootName: string;
  quality: ChordQuality;
  symbol: string;
  roman: string;
  tones: readonly ChordTone[];
  functionFamily: FunctionFamily;
  functionLabel: string;
  explanation: string;
}

export interface Relationship {
  pitchClass: PitchClass;
  noteName: string;
  tonicInterval: number;
  tonicIntervalLabel: string;
  tonicIntervalName: string;
  scaleDegree: ScaleTone | null;
  chordTone: ChordTone | null;
  functionText: string;
  tendency: string;
  summary: string;
}

export interface ProgressionDefinition {
  id: string;
  name: string;
  genre: "Foundations" | "Pop" | "Rock" | "Blues" | "Jazz" | "Modal";
  mode: ModeId;
  formula: string;
  degrees: readonly number[];
  qualities?: readonly (ChordQuality | undefined)[];
  description: string;
  learningFocus: string;
}
