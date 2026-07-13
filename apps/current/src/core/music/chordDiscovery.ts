import type { FretPosition } from "../instrument/guitar";
import { buildChords, buildScale, intervalLabel, noteName, normalize } from "./theory";
import type { PitchClass, TonalContext } from "./types";

export type DiscoveredQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "power"
  | "sus2"
  | "sus4"
  | "dominant7"
  | "major7"
  | "minor7"
  | "half-diminished7";

interface ChordFormula {
  quality: DiscoveredQuality;
  intervals: readonly number[];
  suffix: string;
  label: string;
}

const FORMULAS: readonly ChordFormula[] = [
  { quality: "major", intervals: [0, 4, 7], suffix: "", label: "major triad" },
  { quality: "minor", intervals: [0, 3, 7], suffix: "m", label: "minor triad" },
  { quality: "diminished", intervals: [0, 3, 6], suffix: "dim", label: "diminished triad" },
  { quality: "augmented", intervals: [0, 4, 8], suffix: "aug", label: "augmented triad" },
  { quality: "power", intervals: [0, 7], suffix: "5", label: "power chord" },
  { quality: "sus2", intervals: [0, 2, 7], suffix: "sus2", label: "suspended second" },
  { quality: "sus4", intervals: [0, 5, 7], suffix: "sus4", label: "suspended fourth" },
  { quality: "dominant7", intervals: [0, 4, 7, 10], suffix: "7", label: "dominant seventh" },
  { quality: "major7", intervals: [0, 4, 7, 11], suffix: "maj7", label: "major seventh" },
  { quality: "minor7", intervals: [0, 3, 7, 10], suffix: "m7", label: "minor seventh" },
  { quality: "half-diminished7", intervals: [0, 3, 6, 10], suffix: "m7b5", label: "half-diminished seventh" }
];

export interface ChordContextAnalysis {
  roman: string;
  relationship: "diatonic" | "altered-diatonic-root" | "borrowed-or-modal" | "chromatic";
  functionLabel: string;
  explanation: string;
}

export interface ChordCandidate {
  root: PitchClass;
  rootName: string;
  symbol: string;
  quality: DiscoveredQuality;
  qualityLabel: string;
  intervals: readonly number[];
  intervalLabels: readonly string[];
  missingIntervals: readonly number[];
  extraIntervals: readonly number[];
  bassInterval: number;
  inversionLabel: string;
  completeness: "complete" | "partial" | "colour-tone";
  score: number;
  explanation: string;
  context: ChordContextAnalysis;
}

export interface ChordDiscoveryResult {
  notes: readonly { midi: number; pitchClass: PitchClass; name: string }[];
  uniquePitchClasses: readonly PitchClass[];
  doubledPitchClasses: readonly PitchClass[];
  candidates: readonly ChordCandidate[];
  summary: string;
  limitation: string;
}

function sameSet(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function romanFor(degreeLabel: string, quality: DiscoveredQuality): string {
  const match = degreeLabel.match(/^([b#]*)(\d)$/);
  const accidental = match?.[1] ?? "";
  const degree = Number(match?.[2] ?? 1);
  const base = ["I", "II", "III", "IV", "V", "VI", "VII"][degree - 1] ?? "I";
  if (quality === "diminished") return `${accidental}${base.toLowerCase()}°`;
  if (quality === "half-diminished7") return `${accidental}${base.toLowerCase()}ø7`;
  if (quality === "minor" || quality === "minor7") {
    return `${accidental}${base.toLowerCase()}${quality === "minor7" ? "7" : ""}`;
  }
  if (quality === "dominant7") return `${accidental}${base}7`;
  if (quality === "major7") return `${accidental}${base}maj7`;
  if (quality === "power") return `${accidental}${base}5`;
  if (quality === "sus2") return `${accidental}${base}sus2`;
  if (quality === "sus4") return `${accidental}${base}sus4`;
  if (quality === "augmented") return `${accidental}${base}+`;
  return `${accidental}${base}`;
}

function inversionLabel(interval: number): string {
  if (interval === 0) return "Root position";
  if ([3, 4].includes(interval)) return "First inversion";
  if ([6, 7, 8].includes(interval)) return "Second inversion";
  if ([10, 11].includes(interval)) return "Third inversion";
  return `${intervalLabel(interval)} in the bass`;
}

function chromaticDegree(interval: number): string {
  return ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"][normalize(interval)];
}

export function analyzeCandidateInContext(
  root: PitchClass,
  quality: DiscoveredQuality,
  intervals: readonly number[],
  context: TonalContext
): ChordContextAnalysis {
  const scale = buildScale(context);
  const scaleRoot = scale.find((tone) => tone.pitchClass === root);
  const degreeLabel = scaleRoot?.degreeLabel ?? chromaticDegree(root - context.tonic);
  const roman = romanFor(degreeLabel, quality);
  const diatonic = [...buildChords(context), ...buildChords(context, true)].find((chord) =>
    chord.root === root &&
    sameSet(chord.tones.map((tone) => tone.interval), intervals)
  );

  if (diatonic) {
    return {
      roman: diatonic.roman,
      relationship: "diatonic",
      functionLabel: diatonic.functionLabel,
      explanation: `${diatonic.symbol} is diatonic to ${context.tonicName} ${context.mode}. ${diatonic.explanation}`
    };
  }
  if (scaleRoot) {
    return {
      roman,
      relationship: "altered-diatonic-root",
      functionLabel: "Altered colour",
      explanation: `The root is scale degree ${degreeLabel}, but this chord quality is not the diatonic chord built on that degree. Treat ${roman} as an altered colour and judge its role from the surrounding motion.`
    };
  }

  const tonicDistance = normalize(root - context.tonic);
  if (quality === "major" && [3, 8, 10].includes(tonicDistance)) {
    return {
      roman,
      relationship: "borrowed-or-modal",
      functionLabel: tonicDistance === 10 ? "Modal return" : "Borrowed colour",
      explanation: `${roman} is outside the active ${context.mode} collection, but this major chord is a common rock, blues, or modal borrowing. It is best understood by how it moves relative to ${context.tonicName}, not as a hidden key change.`
    };
  }
  return {
    roman,
    relationship: "chromatic",
    functionLabel: "Context dependent",
    explanation: `${roman} is outside the active ${context.tonicName} ${context.mode} collection. The app can name its root relationship, but its function depends on what comes before and after it.`
  };
}

export function identifyChord(
  positions: readonly Pick<FretPosition, "midi" | "pitchClass">[],
  context: TonalContext
): ChordDiscoveryResult {
  const contextualName = (pitchClass: PitchClass) => {
    const distance = normalize(pitchClass - context.tonic);
    const preferFlats = context.tonicName.includes("b") || [1, 3, 6, 8, 10].includes(distance);
    return noteName(pitchClass, preferFlats);
  };
  const notes = [...positions]
    .sort((a, b) => a.midi - b.midi)
    .map((position) => ({
      midi: position.midi,
      pitchClass: position.pitchClass,
      name: contextualName(position.pitchClass)
    }));
  const uniquePitchClasses = [...new Set(notes.map((note) => note.pitchClass))] as PitchClass[];
  const doubledPitchClasses = uniquePitchClasses.filter(
    (pitchClass) => notes.filter((note) => note.pitchClass === pitchClass).length > 1
  );
  const bass = notes[0]?.pitchClass;
  if (uniquePitchClasses.length < 2 || bass === undefined) {
    return {
      notes,
      uniquePitchClasses,
      doubledPitchClasses,
      candidates: [],
      summary: "Select at least two different pitches before asking for a chord name.",
      limitation: "Single notes and octave doublings do not establish a chord quality."
    };
  }

  const matches: ChordCandidate[] = [];
  for (const root of uniquePitchClasses) {
    for (const formula of FORMULAS) {
      const intervals: number[] = uniquePitchClasses
        .map((pitchClass) => normalize(pitchClass - root))
        .sort((a, b) => a - b);
      const missingIntervals = formula.intervals.filter((interval) => !intervals.includes(interval));
      const extraIntervals = intervals.filter((interval) => !formula.intervals.includes(interval));
      if (missingIntervals.length > 1 || extraIntervals.length > 1) continue;
      const exact = missingIntervals.length === 0 && extraIntervals.length === 0;
      const rootInBass = root === bass;
      const score = (exact ? 100 : 64) - missingIntervals.length * 12 - extraIntervals.length * 18 +
        Number(rootInBass) * 8 + formula.intervals.length;
      if (score < 45) continue;
      const bassInterval = normalize(bass - root);
      const completeness = exact ? "complete" : extraIntervals.length ? "colour-tone" : "partial";
      const rootName = contextualName(root);
      const contextAnalysis = analyzeCandidateInContext(root, formula.quality, formula.intervals, context);
      const explanation = exact
        ? `The selected pitch classes match ${formula.intervals.map(intervalLabel).join("-")} relative to ${rootName}.`
        : `This interpretation matches ${formula.intervals.filter((interval) => intervals.includes(interval)).map(intervalLabel).join("-")}; ${missingIntervals.length ? `it omits ${missingIntervals.map(intervalLabel).join(", ")}` : `it adds ${extraIntervals.map(intervalLabel).join(", ")} as colour`}.`;
      matches.push({
        root,
        rootName,
        symbol: `${rootName}${formula.suffix}`,
        quality: formula.quality,
        qualityLabel: formula.label,
        intervals: formula.intervals,
        intervalLabels: formula.intervals.map(intervalLabel),
        missingIntervals,
        extraIntervals,
        bassInterval,
        inversionLabel: inversionLabel(bassInterval),
        completeness,
        score,
        explanation,
        context: contextAnalysis
      });
    }
  }
  const candidates = matches
    .sort((a, b) => b.score - a.score || a.symbol.localeCompare(b.symbol))
    .slice(0, 6);

  const exactCount = candidates.filter((candidate) => candidate.completeness === "complete").length;
  return {
    notes,
    uniquePitchClasses,
    doubledPitchClasses,
    candidates,
    summary: candidates.length
      ? exactCount > 1
        ? `This voicing has ${exactCount} complete interpretations. Bass note and musical context decide which name is most useful.`
        : `Best match: ${candidates[0].symbol}. ${candidates[0].explanation}`
      : "No supported common chord formula matches this pitch collection cleanly.",
    limitation: "Identification covers common triads, power and suspended chords, and major, minor, dominant, and half-diminished sevenths. Extensions and rootless jazz voicings may need manual interpretation."
  };
}

export function experimentSuggestions(
  candidate: ChordCandidate,
  positions: readonly Pick<FretPosition, "string" | "fret" | "pitchClass">[]
): string[] {
  const suggestions = [
    "Move every fretted note up two frets. The shape keeps its interval structure while the absolute root changes.",
    `Resolve ${candidate.context.roman} to the current tonic and listen for whether the motion feels settled, modal, or deliberately unresolved.`
  ];
  const third = candidate.intervals.find((interval) => interval === 3 || interval === 4);
  if (third !== undefined) {
    const thirdPosition = positions.find((position) => normalize(position.pitchClass - candidate.root) === third);
    if (thirdPosition) {
      suggestions.unshift(
        `Lift or mute string ${thirdPosition.string + 1}, fret ${thirdPosition.fret}. Removing the ${intervalLabel(third)} makes major/minor quality less explicit.`
      );
    }
  } else {
    suggestions.unshift("Add a b3, then a 3 above the possible root. Compare how one semitone changes the chord from minor to major.");
  }
  if (!candidate.intervals.includes(10)) {
    suggestions.push("Add the b7 above the root and compare the stronger blues/rock colour with the current voicing.");
  }
  return suggestions.slice(0, 3);
}
