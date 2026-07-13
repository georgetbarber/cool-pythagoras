import type {
  Chord,
  ChordQuality,
  ChordTone,
  HarmonicFunction,
  ModeDefinition,
  ModeId,
  NoteLetter,
  PitchAnalysis,
  PitchClass,
  ScaleTone,
  SpelledPitch,
  TonalContext
} from "./types";

const LETTERS: readonly NoteLetter[] = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL_PITCH_CLASSES: Record<NoteLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11
};

export const MODES: Record<ModeId, ModeDefinition> = {
  major: {
    id: "major",
    name: "Major / Ionian",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degreeLabels: ["1", "2", "3", "4", "5", "6", "7"],
    character: "A stable major centre with strong predominant and dominant motion."
  },
  dorian: {
    id: "dorian",
    name: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degreeLabels: ["1", "2", "b3", "4", "5", "6", "b7"],
    character: "Minor color shaped by the natural 6 and the major IV chord."
  },
  phrygian: {
    id: "phrygian",
    name: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degreeLabels: ["1", "b2", "b3", "4", "5", "b6", "b7"],
    character: "A minor centre with an immediate, tense b2 relationship."
  },
  lydian: {
    id: "lydian",
    name: "Lydian",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degreeLabels: ["1", "2", "3", "#4", "5", "6", "7"],
    character: "A major centre brightened by #4 and the major II chord."
  },
  mixolydian: {
    id: "mixolydian",
    name: "Mixolydian",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degreeLabels: ["1", "2", "3", "4", "5", "6", "b7"],
    character: "A major centre softened by b7 and the major bVII chord."
  },
  minor: {
    id: "minor",
    name: "Natural Minor / Aeolian",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degreeLabels: ["1", "2", "b3", "4", "5", "b6", "b7"],
    character: "A minor centre with b3, b6, and b7 defining its natural form."
  },
  locrian: {
    id: "locrian",
    name: "Locrian",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degreeLabels: ["1", "b2", "b3", "4", "b5", "b6", "b7"],
    character: "An unstable diminished tonic colored by b2 and b5."
  },
  "harmonic-minor": {
    id: "harmonic-minor",
    name: "Harmonic Minor",
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degreeLabels: ["1", "2", "b3", "4", "5", "b6", "7"],
    character: "Minor color with a raised 7 that creates a strong dominant."
  }
};

export const ROOT_OPTIONS: readonly SpelledPitch[] = [
  pitch("C"),
  pitch("C#"),
  pitch("Db"),
  pitch("D"),
  pitch("Eb"),
  pitch("E"),
  pitch("F"),
  pitch("F#"),
  pitch("Gb"),
  pitch("G"),
  pitch("Ab"),
  pitch("A"),
  pitch("Bb"),
  pitch("B")
];

const INTERVAL_LABELS = [
  "1",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "b6",
  "6",
  "b7",
  "7"
] as const;

const CHORD_FORMULAS: Record<
  ChordQuality,
  { intervals: readonly number[]; labels: readonly string[]; suffix: string }
> = {
  major: { intervals: [0, 4, 7], labels: ["1", "3", "5"], suffix: "" },
  minor: { intervals: [0, 3, 7], labels: ["1", "b3", "5"], suffix: "m" },
  diminished: { intervals: [0, 3, 6], labels: ["1", "b3", "b5"], suffix: "dim" },
  augmented: { intervals: [0, 4, 8], labels: ["1", "3", "#5"], suffix: "aug" },
  major7: { intervals: [0, 4, 7, 11], labels: ["1", "3", "5", "7"], suffix: "maj7" },
  "minor-major7": {
    intervals: [0, 3, 7, 11],
    labels: ["1", "b3", "5", "7"],
    suffix: "m(maj7)"
  },
  "augmented-major7": {
    intervals: [0, 4, 8, 11],
    labels: ["1", "3", "#5", "7"],
    suffix: "aug(maj7)"
  },
  minor7: { intervals: [0, 3, 7, 10], labels: ["1", "b3", "5", "b7"], suffix: "m7" },
  dominant7: { intervals: [0, 4, 7, 10], labels: ["1", "3", "5", "b7"], suffix: "7" },
  "half-diminished7": {
    intervals: [0, 3, 6, 10],
    labels: ["1", "b3", "b5", "b7"],
    suffix: "m7b5"
  },
  diminished7: {
    intervals: [0, 3, 6, 9],
    labels: ["1", "b3", "b5", "bb7"],
    suffix: "dim7"
  }
};

export function normalizePitchClass(value: number): PitchClass {
  return ((value % 12) + 12) % 12 as PitchClass;
}

function accidentalText(accidental: number): string {
  if (accidental > 0) return "#".repeat(accidental);
  if (accidental < 0) return "b".repeat(-accidental);
  return "";
}

function shortestAccidental(natural: number, target: number): number {
  const upward = normalizePitchClass(target - natural);
  return upward > 6 ? upward - 12 : upward;
}

export function pitch(name: string): SpelledPitch {
  const letter = name[0] as NoteLetter;
  const accidentalPart = name.slice(1);
  const accidental =
    [...accidentalPart].filter((mark) => mark === "#").length -
    [...accidentalPart].filter((mark) => mark === "b").length;
  const pitchClass = normalizePitchClass(NATURAL_PITCH_CLASSES[letter] + accidental);
  return { letter, accidental, pitchClass, name: `${letter}${accidentalText(accidental)}` };
}

export function spellPitch(letter: NoteLetter, pitchClass: PitchClass): SpelledPitch {
  const accidental = shortestAccidental(NATURAL_PITCH_CLASSES[letter], pitchClass);
  return {
    letter,
    accidental,
    pitchClass,
    name: `${letter}${accidentalText(accidental)}`
  };
}

export function fallbackPitchName(value: number, preferFlats = false): string {
  const pc = normalizePitchClass(value);
  const names = preferFlats
    ? ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
    : ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return names[pc];
}

export function buildScale(context: TonalContext): ScaleTone[] {
  const mode = MODES[context.mode];
  const tonicLetterIndex = LETTERS.indexOf(context.tonic.letter);
  return mode.intervals.map((interval, index) => {
    const letter = LETTERS[(tonicLetterIndex + index) % LETTERS.length];
    const pitchClass = normalizePitchClass(context.tonic.pitchClass + interval);
    return {
      pitch: spellPitch(letter, pitchClass),
      degree: index + 1,
      degreeLabel: mode.degreeLabels[index],
      semitonesFromTonic: interval
    };
  });
}

function stackedIntervals(scale: readonly ScaleTone[], degree: number, count: number): number[] {
  const root = scale[degree].pitch.pitchClass;
  return Array.from({ length: count }, (_, index) => {
    const tone = scale[(degree + index * 2) % 7];
    return normalizePitchClass(tone.pitch.pitchClass - root);
  });
}

function identifyQuality(intervals: readonly number[]): ChordQuality {
  const match = (Object.entries(CHORD_FORMULAS) as Array<
    [ChordQuality, (typeof CHORD_FORMULAS)[ChordQuality]]
  >).find(([, formula]) => formula.intervals.join(",") === intervals.join(","));
  if (!match) throw new Error(`Unsupported tertian chord: ${intervals.join(",")}`);
  return match[0];
}

function romanFor(degreeLabel: string, quality: ChordQuality, seventh: boolean): string {
  const match = degreeLabel.match(/^([b#]*)(\d)$/);
  const accidental = match?.[1] ?? "";
  const degree = Number(match?.[2] ?? 1) - 1;
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const isMinor =
    quality === "minor" ||
    quality === "minor7" ||
    quality === "minor-major7";
  const isDiminished =
    quality === "diminished" ||
    quality === "half-diminished7" ||
    quality === "diminished7";
  const base = isMinor || isDiminished ? romans[degree].toLowerCase() : romans[degree];
  const qualityMarker = quality === "augmented" ? "+" : "";
  const suffix =
    quality === "major7"
      ? "maj7"
      : quality === "minor-major7"
        ? "(maj7)"
        : quality === "augmented-major7"
          ? "+maj7"
      : quality === "dominant7" || quality === "minor7"
        ? "7"
        : quality === "half-diminished7"
          ? "ø7"
          : quality === "diminished7"
            ? "°7"
            : quality === "diminished"
              ? "°"
              : seventh
                ? "7"
                : "";
  return `${accidental}${base}${qualityMarker}${suffix}`;
}

function functionFor(context: TonalContext, degree: number): {
  function: HarmonicFunction;
  explanation: string;
} {
  if (context.mode === "major") {
    const values: Array<[HarmonicFunction, string]> = [
      ["Tonic", "I establishes the tonal centre and provides the strongest point of rest."],
      ["Predominant", "ii moves away from tonic and prepares dominant harmony."],
      ["Tonic expansion", "iii shares two tones with I and can prolong tonic color."],
      ["Predominant", "IV moves away from tonic and commonly prepares V."],
      ["Dominant", "V contains the leading tone and creates strong pull toward I."],
      ["Tonic expansion", "vi shares two tones with I and offers a relative-minor tonic color."],
      ["Dominant", "vii° contains both tendency tones that resolve into I."]
    ];
    const [fn, explanation] = values[degree];
    return { function: fn, explanation };
  }
  if (context.mode === "minor" || context.mode === "harmonic-minor") {
    const values: Array<[HarmonicFunction, string]> = [
      ["Tonic", "i establishes the minor tonal centre."],
      ["Predominant", "ii harmony commonly prepares dominant motion."],
      ["Tonic expansion", "III connects the tonic family to its relative-major color."],
      ["Predominant", "iv carries minor predominant motion."],
      [
        context.mode === "harmonic-minor" ? "Dominant" : "Contextual",
        context.mode === "harmonic-minor"
          ? "V contains the raised leading tone and strongly resolves to i."
          : "Natural minor's v has weaker dominant pull; raising scale degree 7 creates V."
      ],
      ["Modal color", "VI supplies characteristic minor color and supports descending motion."],
      [
        context.mode === "harmonic-minor" ? "Dominant" : "Modal color",
        "Seventh-degree harmony reflects whether the scale uses b7 or a raised leading tone."
      ]
    ];
    const [fn, explanation] = values[degree];
    return { function: fn, explanation };
  }
  if (degree === 0) {
    return {
      function: "Tonic",
      explanation: "The tonic chord establishes the modal centre."
    };
  }
  return {
    function: "Modal color",
    explanation: `This chord exposes the characteristic ${MODES[context.mode].degreeLabels[degree]} degree of ${MODES[context.mode].name}.`
  };
}

export function buildDiatonicChords(
  context: TonalContext,
  seventh = false
): Chord[] {
  const scale = buildScale(context);
  return scale.map((rootTone, degree) => {
    const intervals = stackedIntervals(scale, degree, seventh ? 4 : 3);
    const quality = identifyQuality(intervals);
    const formula = CHORD_FORMULAS[quality];
    const tones: ChordTone[] = formula.intervals.map((interval, index) => {
      const scaleTone = scale[(degree + index * 2) % 7];
      return {
        pitch: scaleTone.pitch,
        interval,
        intervalLabel: formula.labels[index],
        chordToneIndex: index
      };
    });
    const role = functionFor(context, degree);
    return {
      id: `${context.tonic.name}-${context.mode}-${degree + 1}-${quality}`,
      root: rootTone.pitch,
      degree: degree + 1,
      degreeLabel: rootTone.degreeLabel,
      quality,
      symbol: `${rootTone.pitch.name}${formula.suffix}`,
      romanNumeral: romanFor(rootTone.degreeLabel, quality, seventh),
      tones,
      function: role.function,
      functionExplanation: role.explanation
    };
  });
}

export function intervalLabel(semitones: number): string {
  return INTERVAL_LABELS[normalizePitchClass(semitones)];
}

export function analyzePitch(
  context: TonalContext,
  pitchClass: PitchClass,
  activeChord: Chord | null
): PitchAnalysis {
  const scale = buildScale(context);
  const scaleDegree =
    scale.find((tone) => tone.pitch.pitchClass === pitchClass) ?? null;
  const chordTone =
    activeChord?.tones.find((tone) => tone.pitch.pitchClass === pitchClass) ?? null;
  const tonicInterval = normalizePitchClass(pitchClass - context.tonic.pitchClass);
  const spelled =
    scaleDegree?.pitch ??
    activeChord?.tones.find((tone) => tone.pitch.pitchClass === pitchClass)?.pitch ??
    pitch(fallbackPitchName(pitchClass, context.tonic.accidental < 0));
  const roleParts = [
    `${spelled.name} is ${intervalLabel(tonicInterval)} relative to ${context.tonic.name}.`,
    scaleDegree ? `It is scale degree ${scaleDegree.degreeLabel}.` : "It is outside the current scale.",
    chordTone && activeChord
      ? `Inside ${activeChord.symbol}, it functions as chord tone ${chordTone.intervalLabel}.`
      : activeChord
        ? `It is not a chord tone of ${activeChord.symbol}.`
        : ""
  ].filter(Boolean);
  return {
    pitch: spelled,
    tonicInterval,
    tonicIntervalLabel: intervalLabel(tonicInterval),
    scaleDegree,
    chordTone,
    summary: roleParts.join(" ")
  };
}

export function chordPitchClasses(chord: Chord): PitchClass[] {
  return chord.tones.map((tone) => tone.pitch.pitchClass);
}

function chordFromFormula({
  id,
  root,
  degree,
  degreeLabel,
  quality,
  romanNumeral,
  harmonicFunction,
  explanation
}: {
  id: string;
  root: SpelledPitch;
  degree: number;
  degreeLabel: string;
  quality: ChordQuality;
  romanNumeral: string;
  harmonicFunction: HarmonicFunction;
  explanation: string;
}): Chord {
  const formula = CHORD_FORMULAS[quality];
  const rootLetterIndex = LETTERS.indexOf(root.letter);
  const tones = formula.intervals.map((interval, index) => {
    const letter = LETTERS[(rootLetterIndex + index * 2) % LETTERS.length];
    return {
      pitch: spellPitch(letter, normalizePitchClass(root.pitchClass + interval)),
      interval,
      intervalLabel: formula.labels[index],
      chordToneIndex: index
    };
  });
  return {
    id,
    root,
    degree,
    degreeLabel,
    quality,
    symbol: `${root.name}${formula.suffix}`,
    romanNumeral,
    tones,
    function: harmonicFunction,
    functionExplanation: explanation
  };
}

export function buildSecondaryDominants(context: TonalContext): Chord[] {
  const targets = buildDiatonicChords(context, false).slice(1, 6);
  return targets.map((target) => {
    const targetLetterIndex = LETTERS.indexOf(target.root.letter);
    const rootLetter = LETTERS[(targetLetterIndex + 4) % LETTERS.length];
    const rootPc = normalizePitchClass(target.root.pitchClass + 7);
    const root = spellPitch(rootLetter, rootPc);
    const targetNumeral = target.romanNumeral.replace(/[°+]/g, "");
    return chordFromFormula({
      id: `${context.tonic.name}-${context.mode}-V7-of-${target.degree}`,
      root,
      degree: target.degree,
      degreeLabel: target.degreeLabel,
      quality: "dominant7",
      romanNumeral: `V7/${targetNumeral}`,
      harmonicFunction: "Dominant",
      explanation: `${root.name}7 temporarily treats ${target.root.name} as a local tonic. Its third acts as a leading tone into the target root.`
    });
  });
}

export function buildBorrowedChords(context: TonalContext): Chord[] {
  const parallelMode: ModeId =
    context.mode === "major" ? "minor" : "major";
  const native = buildDiatonicChords(context, false);
  return buildDiatonicChords({ ...context, mode: parallelMode }, false)
    .filter(
      (candidate) =>
        !native.some(
          (chord) =>
            chord.root.pitchClass === candidate.root.pitchClass &&
            chord.quality === candidate.quality
        )
    )
    .map((chord) => ({
      ...chord,
      id: `${context.tonic.name}-${context.mode}-borrowed-${chord.degree}`,
      function: "Modal color" as const,
      functionExplanation: `${chord.symbol} is borrowed from parallel ${MODES[parallelMode].name}. Its altered scale degrees change the color while ${context.tonic.name} remains the tonal centre.`
    }));
}

export function transposeContext(
  context: TonalContext,
  tonicName: string
): TonalContext {
  return { ...context, tonic: pitch(tonicName) };
}
