import {
  CHORD_FORMULAS,
  MODE_INTERVALS,
  NOTE_NAMES_SHARP
} from "./constants";
import type {
  ChordDefinition,
  ChordQuality,
  HarmonicFunction,
  KeySelection,
  PitchClass
} from "./types";

const NATURAL_PCS: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11
};
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];

function pc(value: number): PitchClass {
  return ((value % 12) + 12) % 12 as PitchClass;
}

function signedDistance(from: number, to: number): number {
  const distance = pc(to - from);
  return distance > 6 ? distance - 12 : distance;
}

export function spellScale(key: KeySelection): string[] {
  const rootLetterIndex = LETTERS.indexOf(key.tonic[0]);
  return MODE_INTERVALS[key.mode].map((interval, degree) => {
    const letter = LETTERS[(rootLetterIndex + degree) % LETTERS.length];
    const targetPc = pc(key.tonicPc + interval);
    const accidental = signedDistance(NATURAL_PCS[letter], targetPc);
    if (accidental > 0) return `${letter}${"#".repeat(accidental)}`;
    if (accidental < 0) return `${letter}${"b".repeat(-accidental)}`;
    return letter;
  });
}

export function getScalePitchClasses(key: KeySelection): PitchClass[] {
  return MODE_INTERVALS[key.mode].map((interval) => pc(key.tonicPc + interval));
}

export function getPentatonicPitchClasses(key: KeySelection): PitchClass[] {
  const degrees = key.mode === "major" || key.mode === "lydian" || key.mode === "mixolydian"
    ? [0, 1, 2, 4, 5]
    : [0, 2, 3, 4, 6];
  const scale = getScalePitchClasses(key);
  return degrees.map((degree) => scale[degree]);
}

export function getChordPitchClasses(
  rootPc: PitchClass,
  quality: ChordQuality
): PitchClass[] {
  return CHORD_FORMULAS[quality].intervals.map((interval) => pc(rootPc + interval));
}

function identifyQuality(intervals: readonly number[]): ChordQuality {
  const key = intervals.join(",");
  const quality = (Object.entries(CHORD_FORMULAS) as Array<
    [ChordQuality, { intervals: readonly number[] }]
  >).find(([, formula]) => formula.intervals.join(",") === key)?.[0];
  if (!quality) throw new Error(`Unsupported chord formula: ${key}`);
  return quality;
}

function numeralFor(degree: number, quality: ChordQuality, seventh: boolean): string {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII"][degree];
  const minor = quality.startsWith("Minor") || quality.includes("diminished");
  const suffix = quality.includes("Diminished")
    ? "o"
    : quality.includes("Half-diminished")
      ? "ø"
      : "";
  const seventhSuffix = seventh ? "7" : "";
  return `${minor ? roman.toLowerCase() : roman}${suffix}${seventhSuffix}`;
}

function functionForDegree(degree: number): HarmonicFunction {
  if (degree === 0 || degree === 2 || degree === 5) return "Tonic";
  if (degree === 1 || degree === 3) return "Predominant";
  if (degree === 4 || degree === 6) return "Dominant";
  return "Modal";
}

function stackedIntervals(scale: readonly PitchClass[], degree: number, count: number): number[] {
  const root = scale[degree];
  return Array.from({ length: count }, (_, index) => {
    const note = scale[(degree + index * 2) % 7];
    return pc(note - root);
  });
}

export function buildDiatonicChords(
  key: KeySelection,
  seventh = false
): ChordDefinition[] {
  const scale = getScalePitchClasses(key);
  const names = spellScale(key);
  const toneCount = seventh ? 4 : 3;

  return scale.map((rootPc, degree) => {
    const intervals = stackedIntervals(scale, degree, toneCount);
    const quality = identifyQuality(intervals);
    const formula = CHORD_FORMULAS[quality];
    const harmonicFunction = functionForDegree(degree);

    return {
      id: `diatonic-${degree}-${quality}`,
      degree,
      numeral: numeralFor(degree, quality, seventh),
      rootPc,
      rootName: names[degree],
      quality,
      intervals: formula.intervals,
      intervalNames: formula.names,
      function: harmonicFunction,
      source: "diatonic",
      rationale: `${names[degree]} ${quality} is the ${harmonicFunction.toLowerCase()} family chord built on scale degree ${degree + 1}.`
    };
  });
}

export function buildChromaticChords(key: KeySelection): ChordDefinition[] {
  const diatonic = buildDiatonicChords(key);
  const borrowedMode = key.mode === "major" ? "minor" : "major";
  const borrowed = buildDiatonicChords({ ...key, mode: borrowedMode }).filter(
    (candidate) =>
      !diatonic.some(
        (chord) =>
          chord.rootPc === candidate.rootPc && chord.quality === candidate.quality
      )
  );

  const secondaryDominants = diatonic.slice(1, 6).map((target, index) => {
    const rootPc = pc(target.rootPc + 7);
    const formula = CHORD_FORMULAS["Dominant 7"];
    return {
      id: `secondary-${index}`,
      degree: target.degree,
      numeral: `V7/${target.numeral}`,
      rootPc,
      rootName: noteName(rootPc, key.tonic.includes("b")),
      quality: "Dominant 7" as const,
      intervals: formula.intervals,
      intervalNames: formula.names,
      function: "Dominant" as const,
      source: "secondary" as const,
      rationale: `A temporary dominant that resolves toward ${target.rootName} ${target.quality}.`
    };
  });

  return [
    ...borrowed.slice(0, 4).map((chord) => ({
      ...chord,
      id: `borrowed-${chord.id}`,
      source: "borrowed" as const,
      function: "Modal" as const,
      rationale: `Borrowed from the parallel ${borrowedMode} collection.`
    })),
    ...secondaryDominants
  ];
}

export function extendChord(chord: ChordDefinition): ChordDefinition {
  const qualityMap: Partial<Record<ChordQuality, ChordQuality>> = {
    Major: "Major 9",
    Minor: "Minor 9",
    "Dominant 7": "Dominant 9",
    "Major 7": "Major 9",
    "Minor 7": "Minor 9"
  };
  const quality = qualityMap[chord.quality] ?? chord.quality;
  const formula = CHORD_FORMULAS[quality];
  return {
    ...chord,
    id: `${chord.id}-extended`,
    numeral: chord.numeral.replace("7", "") + "9",
    quality,
    intervals: formula.intervals,
    intervalNames: formula.names,
    rationale: `${chord.rationale} The ninth adds color without changing its harmonic role.`
  };
}

export function noteName(value: number, preferFlats = false): string {
  const normalized = pc(value);
  if (!preferFlats) return NOTE_NAMES_SHARP[normalized];
  return ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"][
    normalized
  ];
}

export function relativeKey(key: KeySelection): KeySelection {
  if (key.mode === "major") {
    const tonicPc = pc(key.tonicPc + 9);
    return { tonic: noteName(tonicPc, true), tonicPc, mode: "minor" };
  }
  if (key.mode === "minor") {
    const tonicPc = pc(key.tonicPc + 3);
    return { tonic: noteName(tonicPc, true), tonicPc, mode: "major" };
  }
  return key;
}

export function createStandaloneChord(
  rootPc: PitchClass,
  rootName: string,
  quality: ChordQuality
): ChordDefinition {
  const formula = CHORD_FORMULAS[quality];
  return {
    id: `standalone-${rootPc}-${quality}`,
    degree: -1,
    numeral: "-",
    rootPc,
    rootName,
    quality,
    intervals: formula.intervals,
    intervalNames: formula.names,
    function: "Modal",
    source: "borrowed",
    rationale: "A manually selected chord outside the current diatonic table."
  };
}
