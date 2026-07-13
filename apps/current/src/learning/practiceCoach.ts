import {
  buildFretboard,
  STANDARD_GUITAR,
  triadShapes
} from "../core/instrument/guitar";
import type { FretPosition, GuitarShape } from "../core/instrument/guitar";
import {
  chordToneDisplayLabel,
  displayRelationshipLabel,
  intervalLabel,
  intervalName,
  noteName,
  normalize
} from "../core/music/theory";
import type { Chord, PitchClass, ScaleTone, TonalContext } from "../core/music/types";

export type CoachMode = "mixed" | "note-hunt" | "interval-move" | "chord-tone" | "triad-shape";
export type CoachDifficulty = "foundation" | "moving" | "challenge";

export interface CoachPrompt {
  id: string;
  mode: Exclude<CoachMode, "mixed">;
  skill: string;
  title: string;
  instruction: string;
  setup: string;
  hint: string;
  answer: string;
  explanation: string;
  whyItMatters: string;
  fretStart: number;
  fretEnd: number;
  targetPitch?: PitchClass;
  rootPosition?: FretPosition;
  targetInterval?: number;
  shape?: GuitarShape;
  chord?: Chord;
  audioTarget?: PitchClass;
}

const MODE_ORDER: readonly Exclude<CoachMode, "mixed">[] = [
  "note-hunt",
  "interval-move",
  "chord-tone",
  "triad-shape"
];

const DIFFICULTY = {
  foundation: {
    fretEnd: 5,
    intervals: [3, 4, 5, 7] as const
  },
  moving: {
    fretEnd: 9,
    intervals: [2, 3, 4, 5, 7, 9, 10] as const
  },
  challenge: {
    fretEnd: 15,
    intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
  }
} as const;

function pick<T>(values: readonly T[], seed: number, offset = 0): T {
  return values[Math.abs(seed * 17 + offset * 31) % values.length];
}

function positionList(positions: readonly FretPosition[]): string {
  return [...positions]
    .sort((a, b) => a.string - b.string || a.fret - b.fret)
    .map((position) => `string ${position.string + 1}, fret ${position.fret}`)
    .join("; ");
}

function contextualName(context: TonalContext, pitchClass: PitchClass, scale: readonly ScaleTone[]): string {
  return scale.find((tone) => tone.pitchClass === pitchClass)?.name ??
    noteName(pitchClass, context.tonicName.includes("b"));
}

function noteHunt(
  context: TonalContext,
  scale: readonly ScaleTone[],
  difficulty: CoachDifficulty,
  seed: number
): CoachPrompt {
  const config = DIFFICULTY[difficulty];
  const chromaticTargets = difficulty === "challenge"
    ? Array.from({ length: 12 }, (_, semitones) => normalize(context.tonic + semitones))
    : scale.map((tone) => tone.pitchClass);
  const targetPitch = pick(chromaticTargets, seed, 1);
  const name = contextualName(context, targetPitch, scale);
  const positions = buildFretboard(config.fretEnd).filter((position) => position.pitchClass === targetPitch);
  const scaleTone = scale.find((tone) => tone.pitchClass === targetPitch);
  return {
    id: `note-hunt-${context.tonicName}-${context.mode}-${difficulty}-${seed}`,
    mode: "note-hunt",
    skill: `coach-note-${targetPitch}`,
    title: `Find every ${name}`,
    instruction: `Without looking at the answer, play every ${name} from the open strings through fret ${config.fretEnd}. Say the string and fret before each note.`,
    setup: scaleTone
      ? `${name} is key degree ${displayRelationshipLabel(scaleTone.degreeLabel)} in ${context.tonicName} ${context.mode}.`
      : `${name} is outside the active scale, so use octave landmarks and neighbouring notes.`,
    hint: "Start from a known open string or octave shape, then transfer the same pitch identity across the neck.",
    answer: positionList(positions),
    explanation: `There are ${positions.length} positions in this range. Each is the same pitch class in a different register or physical location.`,
    whyItMatters: "Fast note geography lets theory become a playable choice instead of a calculation.",
    fretStart: 0,
    fretEnd: config.fretEnd,
    targetPitch,
    audioTarget: targetPitch
  };
}

function intervalMove(
  context: TonalContext,
  scale: readonly ScaleTone[],
  difficulty: CoachDifficulty,
  seed: number
): CoachPrompt {
  const config = DIFFICULTY[difficulty];
  const board = buildFretboard(config.fretEnd);
  const targetInterval = pick(config.intervals, seed, 2);
  const roots = board.filter((root) =>
    root.fret <= Math.max(3, config.fretEnd - 2) &&
    board.some((position) =>
      position.midi !== root.midi &&
      normalize(position.midi - root.midi) === targetInterval
    )
  );
  const rootPosition = pick(roots, seed, 3);
  const rootName = contextualName(context, rootPosition.pitchClass, scale);
  const targetPitch = normalize(rootPosition.pitchClass + targetInterval);
  const targets = board.filter((position) =>
    position.midi !== rootPosition.midi &&
    normalize(position.midi - rootPosition.midi) === targetInterval
  );
  const relationship = `${displayRelationshipLabel(intervalLabel(targetInterval))} · ${intervalName(targetInterval)}`;
  return {
    id: `interval-move-${context.tonicName}-${context.mode}-${difficulty}-${seed}`,
    mode: "interval-move",
    skill: `coach-interval-${targetInterval}`,
    title: `Play the ${relationship}`,
    instruction: `Use ${rootName} on string ${rootPosition.string + 1}, fret ${rootPosition.fret} as the root. Play the root, then find at least two ${intervalName(targetInterval)}s from it.`,
    setup: "Keep the physical root fixed. Name the distance before naming the target note.",
    hint: targetInterval === 3 || targetInterval === 4
      ? "Compare the one-fret difference between the minor and major third shapes."
      : "Track the interval shape across string pairs and adjust when crossing the G-B tuning boundary.",
    answer: `${relationship} lands on ${contextualName(context, targetPitch, scale)}. In range: ${positionList(targets)}.`,
    explanation: `Every target keeps the same ${targetInterval}-semitone pitch-class relationship modulo octaves, even when the string/fret geometry or register changes.`,
    whyItMatters: "Intervals are the portable structure underneath riffs, melodies, chord tones, and movable shapes.",
    fretStart: 0,
    fretEnd: config.fretEnd,
    targetPitch,
    rootPosition,
    targetInterval,
    audioTarget: targetPitch
  };
}

function chordTone(
  context: TonalContext,
  chord: Chord,
  difficulty: CoachDifficulty,
  seed: number
): CoachPrompt {
  const config = DIFFICULTY[difficulty];
  const availableTones = chord.tones.length > 1 ? chord.tones.slice(1) : chord.tones;
  const tone = pick(availableTones, seed, 4);
  const positions = buildFretboard(config.fretEnd).filter((position) => position.pitchClass === tone.pitchClass);
  const role = chordToneDisplayLabel(tone.intervalLabel);
  return {
    id: `chord-tone-${chord.id}-${difficulty}-${seed}`,
    mode: "chord-tone",
    skill: `coach-chord-tone-${tone.intervalLabel}`,
    title: `Target the ${role} of ${chord.symbol}`,
    instruction: `Play ${chord.symbol}, then find and sustain its ${role} (${tone.name}) in at least two places through fret ${config.fretEnd}.`,
    setup: `${chord.roman} is ${chord.functionLabel.toLowerCase()} in ${context.tonicName} ${context.mode}. Hear how the selected chord tone colours that function.`,
    hint: tone.intervalLabel === "3" || tone.intervalLabel === "b3"
      ? "The third is the fastest way to hear major versus minor quality."
      : `Build from the chord root ${chord.rootName}, then use the ${role} interval shape.`,
    answer: `${tone.name} is chord tone ${role}. Positions: ${positionList(positions)}.`,
    explanation: `${tone.name} is measured from the chord root ${chord.rootName}, while its key role is measured separately from ${context.tonicName}.`,
    whyItMatters: "Landing on a chosen chord tone turns scale playing into harmony-aware phrasing.",
    fretStart: 0,
    fretEnd: config.fretEnd,
    targetPitch: tone.pitchClass,
    chord,
    audioTarget: tone.pitchClass
  };
}

function triadShape(chord: Chord, difficulty: CoachDifficulty, seed: number): CoachPrompt {
  const config = DIFFICULTY[difficulty];
  const inRange = triadShapes(chord).filter((shape) => shape.maxFret <= config.fretEnd);
  const shapes = inRange.length ? inRange : triadShapes(chord);
  const shape = pick(shapes, seed, 5);
  const strings = [...shape.positions]
    .sort((a, b) => a.string - b.string)
    .map((position) => position.string + 1)
    .join("-");
  return {
    id: `triad-shape-${chord.id}-${difficulty}-${seed}`,
    mode: "triad-shape",
    skill: `coach-triad-${chord.quality}`,
    title: `Play a ${chord.symbol} triad`,
    instruction: `Find a ${chord.symbol} triad on strings ${strings}. Play it as a block chord, then arpeggiate from the lowest sounding string.`,
    setup: `Aim for a compact ${shape.inversionLabel.toLowerCase()} voicing between frets ${shape.minFret} and ${shape.maxFret}.`,
    hint: `The chord tones are ${chord.tones.slice(0, 3).map((tone) => `${chordToneDisplayLabel(tone.intervalLabel)} (${tone.name})`).join(", ")}.`,
    answer: `Fret pattern ${shape.fretPattern}. This is ${shape.inversionLabel.toLowerCase()}, with chord ${chordToneDisplayLabel(shape.bassIntervalLabel)} in the bass.`,
    explanation: "The same three chord tones can be reordered. The bass note changes the inversion, not the chord identity.",
    whyItMatters: "Compact triads make voice leading, inversions, and playing with other musicians much clearer.",
    fretStart: Math.max(0, shape.minFret - 1),
    fretEnd: Math.min(STANDARD_GUITAR.fretCount, Math.max(shape.maxFret + 1, shape.minFret + 4)),
    targetPitch: chord.root,
    shape,
    chord,
    audioTarget: chord.root
  };
}

export function createCoachPrompt(
  context: TonalContext,
  scale: readonly ScaleTone[],
  chord: Chord,
  mode: CoachMode,
  difficulty: CoachDifficulty,
  seed = Date.now()
): CoachPrompt {
  const resolvedMode = mode === "mixed" ? pick(MODE_ORDER, seed, 0) : mode;
  if (resolvedMode === "note-hunt") return noteHunt(context, scale, difficulty, seed);
  if (resolvedMode === "interval-move") return intervalMove(context, scale, difficulty, seed);
  if (resolvedMode === "chord-tone") return chordTone(context, chord, difficulty, seed);
  return triadShape(chord, difficulty, seed);
}
