import { chordPitchClasses, normalizePitchClass } from "../domain/music";
import type {
  Chord,
  FretPosition,
  PitchClass,
  Voicing
} from "../domain/types";

export interface Instrument {
  id: string;
  name: string;
  openMidi: readonly number[];
  stringLabels: readonly string[];
  fretCount: number;
}

export interface VoicingOptions {
  stringCount?: number;
  minFret?: number;
  maxFret?: number;
  maxSpan?: number;
  limit?: number;
}

export const STANDARD_GUITAR: Instrument = {
  id: "guitar-standard",
  name: "Guitar · Standard tuning",
  openMidi: [64, 59, 55, 50, 45, 40],
  stringLabels: ["E", "B", "G", "D", "A", "E"],
  fretCount: 15
};

export function buildFretboard(
  instrument: Instrument = STANDARD_GUITAR
): FretPosition[] {
  return instrument.openMidi.flatMap((openMidi, string) =>
    Array.from({ length: instrument.fretCount + 1 }, (_, fret) => ({
      string,
      fret,
      midi: openMidi + fret,
      pitchClass: normalizePitchClass(openMidi + fret)
    }))
  );
}

export function positionsForPitchClass(
  pitchClass: PitchClass,
  instrument: Instrument = STANDARD_GUITAR
): FretPosition[] {
  return buildFretboard(instrument).filter(
    (position) => position.pitchClass === pitchClass
  );
}

function cartesian<T>(groups: readonly T[][], index = 0, selected: T[] = []): T[][] {
  if (index === groups.length) return [selected];
  return groups[index].flatMap((item) =>
    cartesian(groups, index + 1, [...selected, item])
  );
}

function voicingScore(
  positions: readonly FretPosition[],
  chord: Chord,
  minFret: number
): number {
  const playedFrets = positions.map((position) => position.fret).filter(Boolean);
  const span = playedFrets.length
    ? Math.max(...playedFrets) - Math.min(...playedFrets)
    : 0;
  const pitchClasses = positions.map((position) => position.pitchClass);
  const duplicates = positions.length - new Set(pitchClasses).size;
  const bass = [...positions].sort((a, b) => a.midi - b.midi)[0];
  const openStrings = positions.filter((position) => position.fret === 0).length;
  const centre =
    playedFrets.reduce((total, fret) => total + fret, 0) /
    Math.max(1, playedFrets.length);
  return (
    span * 9 +
    duplicates * 2 +
    (bass.pitchClass === chord.root.pitchClass ? 0 : 3) +
    Math.abs(centre - minFret) * 0.2 -
    openStrings * 0.3
  );
}

export function generateVoicings(
  chord: Chord,
  options: VoicingOptions = {},
  instrument: Instrument = STANDARD_GUITAR
): Voicing[] {
  const required = chordPitchClasses(chord);
  const defaultCount = chord.tones.length <= 3 ? 3 : 4;
  const stringCount = options.stringCount ?? defaultCount;
  const minFret = options.minFret ?? 0;
  const maxFret = options.maxFret ?? instrument.fretCount;
  const maxSpan = options.maxSpan ?? 4;
  const limit = options.limit ?? 24;
  const fretboard = buildFretboard(instrument);
  const strings = [5, 4, 3, 2, 1, 0];
  const stringSets = Array.from(
    { length: strings.length - stringCount + 1 },
    (_, index) => strings.slice(index, index + stringCount)
  );
  const results: Voicing[] = [];

  for (const stringSet of stringSets) {
    const groups = stringSet.map((string) =>
      fretboard.filter(
        (position) =>
          position.string === string &&
          position.fret >= minFret &&
          position.fret <= maxFret &&
          required.includes(position.pitchClass)
      )
    );
    if (groups.some((group) => group.length === 0)) continue;

    for (const positions of cartesian(groups)) {
      const represented = new Set(positions.map((position) => position.pitchClass));
      if (!required.every((pitchClass) => represented.has(pitchClass))) continue;
      const playedFrets = positions.map((position) => position.fret).filter(Boolean);
      const fretSpan = playedFrets.length
        ? Math.max(...playedFrets) - Math.min(...playedFrets)
        : 0;
      if (fretSpan > maxSpan) continue;
      const bass = [...positions].sort((a, b) => a.midi - b.midi)[0];
      const inversion = required.indexOf(bass.pitchClass);
      const sorted = [...positions].sort((a, b) => b.string - a.string);
      results.push({
        id: `${chord.id}-${sorted.map((position) => `${position.string}:${position.fret}`).join("-")}`,
        chordId: chord.id,
        positions: sorted,
        inversion: inversion < 0 ? 0 : inversion,
        fretSpan,
        minFret: playedFrets.length ? Math.min(...playedFrets) : 0,
        score: voicingScore(sorted, chord, minFret)
      });
    }
  }

  return results.sort((left, right) => left.score - right.score).slice(0, limit);
}

export function rootAnchors(
  root: PitchClass,
  instrument: Instrument = STANDARD_GUITAR
): FretPosition[] {
  return positionsForPitchClass(root, instrument).filter(
    (position) => [5, 4, 3].includes(position.string)
  );
}

export function coordinate(position: Pick<FretPosition, "string" | "fret">): string {
  return `${position.string}:${position.fret}`;
}
