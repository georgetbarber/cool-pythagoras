import { chordPitchClasses, fallbackName, normalize } from "../domain/music";
import type { Chord, FretPosition, PitchClass, StringPolicy, Voicing } from "../domain/types";

export const GUITAR = {
  openMidi: [64, 59, 55, 50, 45, 40] as const,
  stringLabels: ["E", "B", "G", "D", "A", "E"] as const,
  fretCount: 15
};

export function buildFretboard(): FretPosition[] {
  return GUITAR.openMidi.flatMap((midi, string) =>
    Array.from({ length: GUITAR.fretCount + 1 }, (_, fret) => ({
      string,
      fret,
      midi: midi + fret,
      pitchClass: normalize(midi + fret)
    }))
  );
}

export function coordinate(position: Pick<FretPosition, "string" | "fret">): string {
  return `${position.string}:${position.fret}`;
}

function combinations<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  return items.flatMap((item, index) =>
    combinations(items.slice(index + 1), size - 1).map((rest) => [item, ...rest])
  );
}

function cartesian<T>(groups: readonly T[][], index = 0, chosen: T[] = []): T[][] {
  if (index === groups.length) return [chosen];
  return groups[index].flatMap((item) => cartesian(groups, index + 1, [...chosen, item]));
}

function physicalSpan(positions: readonly FretPosition[]): number {
  const fretted = positions.filter((position) => position.fret > 0).map((position) => position.fret);
  if (!fretted.length) return 0;
  const openWithHighFrets = positions.some((position) => position.fret === 0) && Math.max(...fretted) > 4;
  if (openWithHighFrets) return Math.max(...fretted);
  return Math.max(...fretted) - Math.min(...fretted);
}

function scoreVoicing(positions: readonly FretPosition[], chord: Chord, omitted: readonly PitchClass[]): number {
  const span = physicalSpan(positions);
  const bass = [...positions].sort((a, b) => a.midi - b.midi)[0];
  const fretted = positions.filter((position) => position.fret > 0).map((position) => position.fret);
  const centre = fretted.reduce((sum, fret) => sum + fret, 0) / Math.max(1, fretted.length);
  const duplicates = positions.length - new Set(positions.map((position) => position.pitchClass)).size;
  const remoteOpenPenalty = positions.some((position) => position.fret === 0) && positions.some((position) => position.fret > 5) ? 80 : 0;
  return span * 10 + omitted.length * 30 + duplicates * 3 + (bass.pitchClass === chord.root.pitchClass ? 0 : 4) + centre * 0.15 + remoteOpenPenalty;
}

export function stringCountFor(chord: Chord, policy: StringPolicy): number {
  if (policy !== "auto") return policy;
  return Math.min(6, Math.max(3, chord.tones.length));
}

export function generateVoicings(
  chord: Chord,
  policy: StringPolicy = "auto",
  options: { minFret?: number; maxFret?: number; limit?: number; allowOmissions?: boolean } = {}
): Voicing[] {
  const required = chordPitchClasses(chord);
  const stringCount = stringCountFor(chord, policy);
  const minFret = options.minFret ?? 0;
  const maxFret = options.maxFret ?? GUITAR.fretCount;
  const allowOmissions = options.allowOmissions ?? stringCount < required.length;
  const board = buildFretboard();
  const stringSets = combinations([0, 1, 2, 3, 4, 5], stringCount);
  const results: Voicing[] = [];

  for (const strings of stringSets) {
    const groups = strings.map((string) =>
      board.filter((position) =>
        position.string === string &&
        position.fret >= minFret &&
        position.fret <= maxFret &&
        required.includes(position.pitchClass)
      )
    );
    if (groups.some((group) => group.length === 0)) continue;
    for (const positions of cartesian(groups)) {
      const represented = new Set(positions.map((position) => position.pitchClass));
      const omitted = required.filter((pc) => !represented.has(pc));
      if (omitted.length && !allowOmissions) continue;
      if (omitted.length > Math.max(0, required.length - stringCount)) continue;
      const span = physicalSpan(positions);
      if (span > 5) continue;
      const sorted = [...positions].sort((a, b) => b.string - a.string);
      const bass = [...positions].sort((a, b) => a.midi - b.midi)[0];
      const inversion = required.indexOf(bass.pitchClass);
      const frets = sorted.map((position) => position.fret);
      results.push({
        id: `${chord.id}-${sorted.map(coordinate).join("-")}`,
        chordId: chord.id,
        positions: sorted,
        omittedPitchClasses: omitted,
        inversion: Math.max(0, inversion),
        bassLabel: fallbackName(bass.pitchClass),
        minFret: Math.min(...frets),
        maxFret: Math.max(...frets),
        physicalSpan: span,
        score: scoreVoicing(sorted, chord, omitted)
      });
    }
  }
  return results.sort((a, b) => a.score - b.score).slice(0, options.limit ?? 20);
}

export function focusedWindow(voicing: Voicing | null): { start: number; end: number; strings: number[] } {
  if (!voicing) return { start: 0, end: 5, strings: [0, 1, 2, 3, 4, 5] };
  const fretted = voicing.positions.filter((position) => position.fret > 0).map((position) => position.fret);
  const start = fretted.length ? Math.max(0, Math.min(...fretted) - 1) : 0;
  const end = Math.min(GUITAR.fretCount, Math.max(start + 4, ...(fretted.length ? fretted : [4])) + 1);
  return {
    start,
    end,
    strings: [...new Set(voicing.positions.map((position) => position.string))].sort((a, b) => a - b)
  };
}

