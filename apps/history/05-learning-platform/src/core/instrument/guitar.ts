import { normalize } from "../music/theory";
import type { Chord, PitchClass } from "../music/types";

export interface FretPosition {
  string: number;
  fret: number;
  midi: number;
  pitchClass: PitchClass;
}

export interface GuitarShape {
  id: string;
  positions: readonly FretPosition[];
  span: number;
  rootInBass: boolean;
}

export const STANDARD_GUITAR = {
  name: "Standard tuning",
  openMidi: [64, 59, 55, 50, 45, 40] as const,
  stringLabels: ["E", "B", "G", "D", "A", "E"] as const,
  fretCount: 15
};

export function buildFretboard(fretCount = STANDARD_GUITAR.fretCount): FretPosition[] {
  return STANDARD_GUITAR.openMidi.flatMap((midi, string) =>
    Array.from({ length: fretCount + 1 }, (_, fret) => ({
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

export function positionsForPitch(pitchClass: PitchClass, fretCount = STANDARD_GUITAR.fretCount): FretPosition[] {
  return buildFretboard(fretCount).filter((position) => position.pitchClass === pitchClass);
}

export function intervalPositions(root: FretPosition, semitones: number): FretPosition[] {
  return buildFretboard().filter((position) =>
    coordinate(position) !== coordinate(root) &&
    normalize(position.midi - root.midi) === normalize(semitones)
  );
}

function combinations<T>(groups: readonly T[][], index = 0, selected: T[] = []): T[][] {
  if (index === groups.length) return [selected];
  return groups[index].flatMap((item) => combinations(groups, index + 1, [...selected, item]));
}

export function generateShapes(chord: Chord, stringCount = Math.min(4, chord.tones.length), limit = 8): GuitarShape[] {
  const board = buildFretboard();
  const pitchClasses = chord.tones.map((tone) => tone.pitchClass);
  const stringSets = Array.from({ length: 7 - stringCount }, (_, start) =>
    Array.from({ length: stringCount }, (_, offset) => start + offset)
  );
  const shapes: GuitarShape[] = [];

  for (const strings of stringSets) {
    const candidates = strings.map((string) =>
      board.filter((position) => position.string === string && pitchClasses.includes(position.pitchClass))
    );
    for (const positions of combinations(candidates)) {
      const represented = new Set(positions.map((position) => position.pitchClass));
      if (!pitchClasses.every((pitchClass) => represented.has(pitchClass))) continue;
      const fretted = positions.filter((position) => position.fret > 0).map((position) => position.fret);
      const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
      if (span > 4) continue;
      const bass = [...positions].sort((a, b) => a.midi - b.midi)[0];
      shapes.push({
        id: positions.map(coordinate).join("-"),
        positions,
        span,
        rootInBass: bass.pitchClass === chord.root
      });
    }
  }

  return shapes
    .sort((a, b) => Number(b.rootInBass) - Number(a.rootInBass) || a.span - b.span ||
      Math.min(...a.positions.map((position) => position.fret)) -
      Math.min(...b.positions.map((position) => position.fret)))
    .slice(0, limit);
}
