import type {
  CagedShape,
  ChordDefinition,
  FretPosition,
  PitchClass,
  Tuning,
  Voicing,
  VoicingMode
} from "../domain/types";
import { buildFretboard } from "./model";

interface VoicingOptions {
  mode: VoicingMode;
  cagedShape: CagedShape;
  maxFret?: number;
}

function requiredPitchClasses(chord: ChordDefinition, mode: VoicingMode): PitchClass[] {
  const pitchClasses = chord.intervals.map(
    (interval) => ((chord.rootPc + interval) % 12) as PitchClass
  );
  if (mode === "triad") return pitchClasses.slice(0, 3);
  if (pitchClasses.length <= 4) return pitchClasses;

  const priorities = [0, 1, 3, pitchClasses.length - 1];
  return [
    ...new Set(
      priorities
        .map((index) => pitchClasses[index])
        .filter((value): value is PitchClass => value !== undefined)
    )
  ];
}

function shapeTargetFret(
  shape: CagedShape,
  rootPc: PitchClass,
  tuning: Tuning
): number | null {
  if (shape === "off") return null;
  const anchorString: Record<Exclude<CagedShape, "off">, number> = {
    C: 4,
    A: 4,
    G: 5,
    E: 5,
    D: 3
  };
  const shapeOffset: Record<Exclude<CagedShape, "off">, number> = {
    C: 3,
    A: 0,
    G: 3,
    E: 0,
    D: 0
  };
  const string = anchorString[shape];
  const openPc = tuning.openMidi[string] % 12;
  const rootFret = (rootPc - openPc + 12) % 12;
  return Math.min(12, Math.max(1, rootFret - shapeOffset[shape] + 2));
}

function combinations<T>(groups: readonly T[][], index = 0, current: T[] = []): T[][] {
  if (index === groups.length) return [current];
  return groups[index].flatMap((item) =>
    combinations(groups, index + 1, [...current, item])
  );
}

function scoreVoicing(
  positions: readonly FretPosition[],
  chord: ChordDefinition,
  targetFret: number | null
): number {
  const frets = positions.map((position) => position.fret).filter((fret) => fret > 0);
  const span = frets.length ? Math.max(...frets) - Math.min(...frets) : 0;
  const center = frets.length
    ? frets.reduce((total, fret) => total + fret, 0) / frets.length
    : 0;
  const lowest = [...positions].sort((a, b) => a.midi - b.midi)[0];
  const duplicatePenalty =
    positions.length - new Set(positions.map((position) => position.pitchClass)).size;
  return (
    span * 8 +
    duplicatePenalty * 2 +
    (lowest?.pitchClass === chord.rootPc ? 0 : 5) +
    (targetFret === null ? center * 0.1 : Math.abs(center - targetFret))
  );
}

export function solveVoicing(
  chord: ChordDefinition,
  tuning: Tuning,
  options: VoicingOptions
): Voicing | null {
  const required = requiredPitchClasses(chord, options.mode);
  const targetStringCount =
    options.mode === "triad" ? 3 : options.mode === "full" ? 6 : 4;
  const targetFret = shapeTargetFret(options.cagedShape, chord.rootPc, tuning);
  const fretboard = buildFretboard(tuning, options.maxFret ?? 15);
  const allStrings = [5, 4, 3, 2, 1, 0];
  const stringSets =
    targetStringCount === 6
      ? [allStrings]
      : Array.from(
          { length: allStrings.length - targetStringCount + 1 },
          (_, index) => allStrings.slice(index, index + targetStringCount)
        );

  const candidates: Voicing[] = [];
  for (const strings of stringSets) {
    const groups = strings.map((string) =>
      fretboard.filter(
        (position) =>
          position.string === string &&
          required.includes(position.pitchClass) &&
          (targetFret === null || Math.abs(position.fret - targetFret) <= 4)
      )
    );
    if (groups.some((group) => group.length === 0)) continue;

    for (const positions of combinations(groups)) {
      const represented = new Set(positions.map((position) => position.pitchClass));
      if (!required.every((pitchClass) => represented.has(pitchClass))) continue;
      const frets = positions.map((position) => position.fret).filter((fret) => fret > 0);
      const span = frets.length ? Math.max(...frets) - Math.min(...frets) : 0;
      const maxSpan = options.mode === "full" ? 5 : 4;
      if (span > maxSpan) continue;
      candidates.push({
        positions: [...positions].sort((a, b) => b.string - a.string),
        omittedPitchClasses: chord.intervals
          .map((interval) => ((chord.rootPc + interval) % 12) as PitchClass)
          .filter((pitchClass) => !represented.has(pitchClass)),
        fretSpan: span,
        score: scoreVoicing(positions, chord, targetFret)
      });
    }
  }

  return candidates.sort((a, b) => a.score - b.score)[0] ?? null;
}
