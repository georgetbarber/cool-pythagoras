import type {
  Chord,
  ChordQuality,
  ChordTone,
  FunctionFamily,
  ModeId,
  NoteLetter,
  PitchClass,
  RelationshipFacts,
  ScaleTone,
  SpelledPitch,
  TonalContext
} from "./types";

const LETTERS: readonly NoteLetter[] = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL: Record<NoteLetter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const MODES: Record<
  ModeId,
  { name: string; intervals: readonly number[]; degrees: readonly string[]; character: string }
> = {
  major: { name: "Major / Ionian", intervals: [0, 2, 4, 5, 7, 9, 11], degrees: ["1", "2", "3", "4", "5", "6", "7"], character: "Stable major centre with directed predominant and dominant motion." },
  dorian: { name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10], degrees: ["1", "2", "b3", "4", "5", "6", "b7"], character: "Minor colour illuminated by the natural sixth." },
  phrygian: { name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10], degrees: ["1", "b2", "b3", "4", "5", "b6", "b7"], character: "Minor centre defined by the close tension of b2." },
  lydian: { name: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11], degrees: ["1", "2", "3", "#4", "5", "6", "7"], character: "Major centre brightened by the raised fourth." },
  mixolydian: { name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10], degrees: ["1", "2", "3", "4", "5", "6", "b7"], character: "Major centre with a relaxed b7 and strong bVII colour." },
  minor: { name: "Natural Minor / Aeolian", intervals: [0, 2, 3, 5, 7, 8, 10], degrees: ["1", "2", "b3", "4", "5", "b6", "b7"], character: "Minor centre defined by b3, b6, and b7." },
  locrian: { name: "Locrian", intervals: [0, 1, 3, 5, 6, 8, 10], degrees: ["1", "b2", "b3", "4", "b5", "b6", "b7"], character: "Unstable diminished centre defined by b2 and b5." },
  "harmonic-minor": { name: "Harmonic Minor", intervals: [0, 2, 3, 5, 7, 8, 11], degrees: ["1", "2", "b3", "4", "5", "b6", "7"], character: "Minor colour with a raised leading tone and strong dominant." }
};

export const ROOT_NAMES = ["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B"] as const;
export const MODE_IDS = Object.keys(MODES) as ModeId[];

const INTERVAL_LABELS = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"] as const;
const INTERVAL_NAMES = ["unison", "minor second", "major second", "minor third", "major third", "perfect fourth", "tritone", "perfect fifth", "minor sixth", "major sixth", "minor seventh", "major seventh"] as const;

const FORMULAS: Record<ChordQuality, { intervals: readonly number[]; labels: readonly string[]; suffix: string }> = {
  major: { intervals: [0, 4, 7], labels: ["1", "3", "5"], suffix: "" },
  minor: { intervals: [0, 3, 7], labels: ["1", "b3", "5"], suffix: "m" },
  diminished: { intervals: [0, 3, 6], labels: ["1", "b3", "b5"], suffix: "dim" },
  augmented: { intervals: [0, 4, 8], labels: ["1", "3", "#5"], suffix: "aug" },
  major7: { intervals: [0, 4, 7, 11], labels: ["1", "3", "5", "7"], suffix: "maj7" },
  minor7: { intervals: [0, 3, 7, 10], labels: ["1", "b3", "5", "b7"], suffix: "m7" },
  dominant7: { intervals: [0, 4, 7, 10], labels: ["1", "3", "5", "b7"], suffix: "7" },
  "half-diminished7": { intervals: [0, 3, 6, 10], labels: ["1", "b3", "b5", "b7"], suffix: "m7b5" },
  diminished7: { intervals: [0, 3, 6, 9], labels: ["1", "b3", "b5", "bb7"], suffix: "dim7" },
  "minor-major7": { intervals: [0, 3, 7, 11], labels: ["1", "b3", "5", "7"], suffix: "m(maj7)" },
  "augmented-major7": { intervals: [0, 4, 8, 11], labels: ["1", "3", "#5", "7"], suffix: "aug(maj7)" }
};

export const INTERVALS = INTERVAL_LABELS.map((label, semitones) => ({
  semitones,
  label,
  name: INTERVAL_NAMES[semitones],
  colour: [
    "complete rest", "close friction", "open motion", "minor colour",
    "major colour", "suspension", "maximum instability", "structural stability",
    "dark pull", "warm openness", "dominant colour", "leading tension"
  ][semitones],
  tendency: [
    "home", "usually outward", "moves freely", "defines minor",
    "defines major", "often resolves to 3", "resolves by semitone", "supports the root",
    "often falls to 5", "stable colour", "often falls by step", "rises to the root"
  ][semitones],
  consonance: ["perfect", "dissonant", "mild", "imperfect", "imperfect", "perfect", "dissonant", "perfect", "imperfect", "imperfect", "mild", "dissonant"][semitones]
}));

export function normalize(value: number): PitchClass {
  return ((value % 12) + 12) % 12 as PitchClass;
}

export function pitch(name: string): SpelledPitch {
  const letter = name[0] as NoteLetter;
  if (!LETTERS.includes(letter)) throw new Error(`Invalid pitch: ${name}`);
  const marks = name.slice(1);
  if ([...marks].some((mark) => mark !== "#" && mark !== "b")) throw new Error(`Invalid pitch: ${name}`);
  const accidental = [...marks].reduce((sum, mark) => sum + (mark === "#" ? 1 : -1), 0);
  return { letter, accidental, pitchClass: normalize(NATURAL[letter] + accidental), name: `${letter}${accidental > 0 ? "#".repeat(accidental) : "b".repeat(-accidental)}` };
}

export function spell(letter: NoteLetter, pitchClass: PitchClass): SpelledPitch {
  const upward = normalize(pitchClass - NATURAL[letter]);
  const accidental = upward > 6 ? upward - 12 : upward;
  return { letter, accidental, pitchClass, name: `${letter}${accidental > 0 ? "#".repeat(accidental) : "b".repeat(-accidental)}` };
}

export function fallbackName(value: number, flats = false): string {
  const sharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const flat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  return (flats ? flat : sharp)[normalize(value)];
}

export function intervalLabel(semitones: number): string {
  return INTERVAL_LABELS[normalize(semitones)];
}

export function intervalName(semitones: number): string {
  return INTERVAL_NAMES[normalize(semitones)];
}

export function buildScale(context: TonalContext): ScaleTone[] {
  const mode = MODES[context.mode];
  const tonicLetter = LETTERS.indexOf(context.tonic.letter);
  return mode.intervals.map((interval, index) => {
    const letter = LETTERS[(tonicLetter + index) % 7];
    const pc = normalize(context.tonic.pitchClass + interval);
    return {
      pitch: spell(letter, pc),
      degree: index + 1,
      degreeLabel: mode.degrees[index],
      interval,
      intervalName: intervalName(interval)
    };
  });
}

function qualityFor(intervals: readonly number[]): ChordQuality {
  const match = (Object.entries(FORMULAS) as Array<[ChordQuality, (typeof FORMULAS)[ChordQuality]]>)
    .find(([, formula]) => formula.intervals.join(",") === intervals.join(","));
  if (!match) throw new Error(`Unsupported chord formula ${intervals.join(",")}`);
  return match[0];
}

function roman(degreeLabel: string, quality: ChordQuality): string {
  const match = degreeLabel.match(/^([b#]*)(\d)$/);
  const accidental = match?.[1] ?? "";
  const index = Number(match?.[2] ?? 1) - 1;
  const base = ["I", "II", "III", "IV", "V", "VI", "VII"][index];
  const lower = ["minor", "minor7", "minor-major7", "diminished", "half-diminished7", "diminished7"].includes(quality);
  const marker =
    quality === "diminished" ? "°" :
    quality === "half-diminished7" ? "ø7" :
    quality === "diminished7" ? "°7" :
    quality === "major7" ? "maj7" :
    quality === "minor7" || quality === "dominant7" ? "7" :
    quality === "minor-major7" ? "(maj7)" :
    quality === "augmented" ? "+" :
    quality === "augmented-major7" ? "+maj7" : "";
  return `${accidental}${lower ? base.toLowerCase() : base}${marker}`;
}

function functionFor(context: TonalContext, degreeIndex: number): { family: FunctionFamily; label: string; explanation: string } {
  if (context.mode === "major") {
    const functions: Array<{ family: FunctionFamily; label: string; explanation: string }> = [
      { family: "Tonic", label: "Home", explanation: "Establishes the tonal centre and strongest point of rest." },
      { family: "Predominant", label: "Departure", explanation: "Moves away from tonic and commonly prepares dominant harmony." },
      { family: "Tonic expansion", label: "Tonic colour", explanation: "Shares two tones with tonic and can prolong its colour." },
      { family: "Predominant", label: "Preparation", explanation: "Creates departure and prepares dominant motion." },
      { family: "Dominant function", label: "Directed tension", explanation: "Contains the leading tone and points strongly back to tonic." },
      { family: "Tonic expansion", label: "Relative tonic", explanation: "Shares two tones with tonic and offers relative-minor colour." },
      { family: "Dominant function", label: "Leading-tone chord", explanation: "Its tendency tones resolve by step into the tonic chord." }
    ];
    return functions[degreeIndex];
  }
  if (context.mode === "minor" || context.mode === "harmonic-minor") {
    const strongDominant = context.mode === "harmonic-minor";
    const functions: Array<{ family: FunctionFamily; label: string; explanation: string }> = [
      { family: "Tonic", label: "Home", explanation: "Establishes the minor tonal centre." },
      { family: "Predominant", label: "Preparation", explanation: "Moves toward dominant harmony." },
      { family: "Tonic expansion", label: "Relative-major colour", explanation: "Connects tonic with its relative-major region." },
      { family: "Predominant", label: "Minor preparation", explanation: "Carries characteristic minor predominant motion." },
      { family: strongDominant ? "Dominant function" : "Contextual", label: strongDominant ? "Directed tension" : "Modal dominant", explanation: strongDominant ? "The raised leading tone creates strong resolution to i." : "Natural minor's v has less directed pull than major V." },
      { family: "Modal color", label: "Minor colour", explanation: "Highlights the characteristic lowered sixth." },
      { family: strongDominant ? "Dominant function" : "Modal color", label: strongDominant ? "Leading-tone chord" : "Subtonic colour", explanation: "Its meaning depends on whether degree seven is raised." }
    ];
    return functions[degreeIndex];
  }
  return degreeIndex === 0
    ? { family: "Tonic", label: "Modal home", explanation: "Establishes the modal tonal centre." }
    : { family: "Modal color", label: "Characteristic colour", explanation: `Highlights ${MODES[context.mode].degrees[degreeIndex]} within ${MODES[context.mode].name}.` };
}

export function buildDiatonicChords(context: TonalContext, sevenths = false): Chord[] {
  const scale = buildScale(context);
  return scale.map((rootTone, degreeIndex) => {
    const count = sevenths ? 4 : 3;
    const intervals = Array.from({ length: count }, (_, index) =>
      normalize(scale[(degreeIndex + index * 2) % 7].pitch.pitchClass - rootTone.pitch.pitchClass)
    );
    const quality = qualityFor(intervals);
    const formula = FORMULAS[quality];
    const tones: ChordTone[] = intervals.map((interval, index) => ({
      pitch: scale[(degreeIndex + index * 2) % 7].pitch,
      interval,
      intervalLabel: formula.labels[index],
      required: true
    }));
    const fn = functionFor(context, degreeIndex);
    return {
      id: `${context.tonic.name}-${context.mode}-${sevenths ? "7" : "3"}-${degreeIndex + 1}`,
      root: rootTone.pitch,
      degree: degreeIndex + 1,
      degreeLabel: rootTone.degreeLabel,
      quality,
      symbol: `${rootTone.pitch.name}${formula.suffix}`,
      romanNumeral: roman(rootTone.degreeLabel, quality),
      tones,
      functionFamily: fn.family,
      functionLabel: fn.label,
      explanation: fn.explanation,
      source: "diatonic"
    };
  });
}

function tendencyFor(context: TonalContext, scaleTone: ScaleTone | null, chordTone: ChordTone | null): string {
  if (scaleTone?.interval === 11) return `Leading tone: tends upward to ${context.tonic.name}.`;
  if (scaleTone?.interval === 5) return `Often moves down to degree 3 or up to degree 5.`;
  if (chordTone?.intervalLabel === "b7") return "Chordal seventh: often resolves downward by step.";
  if (scaleTone?.degree === 1) return "Tonal anchor: the strongest point of rest.";
  return "Its direction depends on the surrounding harmony and melodic line.";
}

export function analyzeRelationship(context: TonalContext, pitchClass: PitchClass, chord: Chord): RelationshipFacts {
  const scale = buildScale(context);
  const scaleTone = scale.find((tone) => tone.pitch.pitchClass === pitchClass) ?? null;
  const chordTone = chord.tones.find((tone) => tone.pitch.pitchClass === pitchClass) ?? null;
  const tonicInterval = normalize(pitchClass - context.tonic.pitchClass);
  const spelled = scaleTone?.pitch ?? chordTone?.pitch ?? pitch(fallbackName(pitchClass, context.tonic.accidental < 0));
  const parts = [
    `${spelled.name} is ${intervalName(tonicInterval)} (${intervalLabel(tonicInterval)}) relative to ${context.tonic.name}.`,
    scaleTone ? `It is degree ${scaleTone.degreeLabel} of ${MODES[context.mode].name}.` : "It lies outside the active collection.",
    chordTone ? `Inside ${chord.symbol}, it is the ${chordTone.intervalLabel}.` : `It is not a chord tone of ${chord.symbol}.`
  ];
  return {
    pitch: spelled,
    tonicInterval,
    tonicIntervalLabel: intervalLabel(tonicInterval),
    tonicIntervalName: intervalName(tonicInterval),
    scaleTone,
    chordTone,
    tendency: tendencyFor(context, scaleTone, chordTone),
    summary: parts.join(" ")
  };
}

export function chordPitchClasses(chord: Chord): PitchClass[] {
  return chord.tones.map((tone) => tone.pitch.pitchClass);
}

export function buildChordFromDegree(
  context: TonalContext,
  degree: number,
  quality: ChordQuality,
  romanNumeral?: string,
  label?: string
): Chord {
  const scale = buildScale(context);
  const rootTone = scale[degree - 1];
  const formula = FORMULAS[quality];
  const rootLetterIndex = LETTERS.indexOf(rootTone.pitch.letter);
  const tones: ChordTone[] = formula.intervals.map((interval, index) => ({
    pitch: spell(
      LETTERS[(rootLetterIndex + index * 2) % 7],
      normalize(rootTone.pitch.pitchClass + interval)
    ),
    interval,
    intervalLabel: formula.labels[index],
    required: index < 4
  }));
  const fn = functionFor(context, degree - 1);
  return {
    id: `${context.tonic.name}-${context.mode}-custom-${degree}-${quality}`,
    root: rootTone.pitch,
    degree,
    degreeLabel: rootTone.degreeLabel,
    quality,
    symbol: `${rootTone.pitch.name}${formula.suffix}`,
    romanNumeral: romanNumeral ?? roman(rootTone.degreeLabel, quality),
    tones,
    functionFamily: fn.family,
    functionLabel: label ?? fn.label,
    explanation: fn.explanation,
    source: "diatonic"
  };
}

export function buildBorrowedChords(context: TonalContext): Chord[] {
  const parallel: ModeId = context.mode === "major" ? "minor" : "major";
  const native = buildDiatonicChords(context);
  return buildDiatonicChords({ ...context, mode: parallel })
    .filter((candidate) => !native.some((chord) => chord.root.pitchClass === candidate.root.pitchClass && chord.quality === candidate.quality))
    .map((chord) => ({
      ...chord,
      id: `${context.tonic.name}-${context.mode}-borrowed-${chord.degree}`,
      source: "borrowed" as const,
      functionFamily: "Modal color" as const,
      functionLabel: `Borrowed from parallel ${MODES[parallel].name}`,
      explanation: `${chord.symbol} preserves ${context.tonic.name} as home while importing altered degrees from parallel ${MODES[parallel].name}.`
    }));
}

export function buildSecondaryDominants(context: TonalContext): Chord[] {
  return buildDiatonicChords(context).slice(1, 6).map((target) => {
    const rootLetterIndex = LETTERS.indexOf(target.root.letter);
    const root = spell(LETTERS[(rootLetterIndex + 4) % 7], normalize(target.root.pitchClass + 7));
    const formula = FORMULAS.dominant7;
    const tones = formula.intervals.map((interval, index) => ({
      pitch: spell(LETTERS[(LETTERS.indexOf(root.letter) + index * 2) % 7], normalize(root.pitchClass + interval)),
      interval,
      intervalLabel: formula.labels[index],
      required: true
    }));
    return {
      id: `${context.tonic.name}-${context.mode}-V7-${target.degree}`,
      root,
      degree: target.degree,
      degreeLabel: target.degreeLabel,
      quality: "dominant7" as const,
      symbol: `${root.name}7`,
      romanNumeral: `V7/${target.romanNumeral.replace(/[°+]/g, "")}`,
      tones,
      functionFamily: "Dominant function" as const,
      functionLabel: `Tonicizes ${target.symbol}`,
      explanation: `${root.name}7 temporarily treats ${target.root.name} as a local tonic and directs tension toward ${target.symbol}.`,
      source: "secondary" as const,
      targetDegree: target.degree
    };
  });
}
