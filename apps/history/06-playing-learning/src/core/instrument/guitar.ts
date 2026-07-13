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
  bassPitchClass: PitchClass;
  bassIntervalLabel: string;
  inversionLabel: string;
  minFret: number;
  maxFret: number;
  openStrings: number;
  fretPattern: string;
}

export interface CagedPosition {
  form: "C" | "A" | "G" | "E" | "D";
  positions: readonly FretPosition[];
  rootPositions: readonly FretPosition[];
  minFret: number;
  maxFret: number;
  fretPattern: string;
}

export const STANDARD_GUITAR = {
  name: "Standard tuning",
  openMidi: [64, 59, 55, 50, 45, 40] as const,
  stringLabels: ["E", "B", "G", "D", "A", "E"] as const,
  fretCount: 15
};

const CAGED_MAJOR: readonly {
  form: CagedPosition["form"];
  root: PitchClass;
  frets: readonly (number | null)[];
}[] = [
  { form: "C", root: 0, frets: [0, 1, 0, 2, 3, null] },
  { form: "A", root: 9, frets: [0, 2, 2, 2, 0, null] },
  { form: "G", root: 7, frets: [3, 0, 0, 0, 2, 3] },
  { form: "E", root: 4, frets: [0, 0, 1, 2, 2, 0] },
  { form: "D", root: 2, frets: [2, 3, 2, 0, null, null] }
];

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

export function cagedMajorPositions(root: PitchClass): CagedPosition[] {
  const board = buildFretboard();
  return CAGED_MAJOR.flatMap((template) => {
    const baseShift = normalize(root - template.root);
    return [baseShift, baseShift + 12].flatMap((shift) => {
      const frets = template.frets.map((fret) => fret === null ? null : fret + shift);
      if (frets.some((fret) => fret !== null && fret > STANDARD_GUITAR.fretCount)) return [];
      const positions = frets.flatMap((fret, string) =>
        fret === null
          ? []
          : board.filter((position) => position.string === string && position.fret === fret)
      );
      const expected = new Set([root, normalize(root + 4), normalize(root + 7)]);
      if (!positions.every((position) => expected.has(position.pitchClass))) return [];
      const usedFrets = positions.map((position) => position.fret);
      return [{
        form: template.form,
        positions,
        rootPositions: positions.filter((position) => position.pitchClass === root),
        minFret: Math.min(...usedFrets),
        maxFret: Math.max(...usedFrets),
        fretPattern: frets.map((fret) => fret === null ? "x" : fret).join(" - ")
      } satisfies CagedPosition];
    });
  }).sort((a, b) => a.minFret - b.minFret || a.form.localeCompare(b.form));
}

function combinations<T>(groups: readonly T[][], index = 0, selected: T[] = []): T[][] {
  if (index === groups.length) return [selected];
  return groups[index].flatMap((item) => combinations(groups, index + 1, [...selected, item]));
}

function physicalSpan(positions: readonly FretPosition[]): number {
  const fretted = positions.filter((position) => position.fret > 0).map((position) => position.fret);
  if (!fretted.length) return 0;
  const highest = Math.max(...fretted);
  if (positions.some((position) => position.fret === 0) && highest > 4) return highest;
  return highest - Math.min(...fretted);
}

function inversionLabel(intervalLabel: string): string {
  if (intervalLabel === "1") return "Root position";
  if (["b3", "3"].includes(intervalLabel)) return "First inversion";
  if (["b5", "5"].includes(intervalLabel)) return "Second inversion";
  if (["b7", "7"].includes(intervalLabel)) return "Third inversion";
  return `${intervalLabel} in bass`;
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
      const span = physicalSpan(positions);
      if (span > 4) continue;
      const bass = [...positions].sort((a, b) => a.midi - b.midi)[0];
      const bassTone = chord.tones.find((tone) => tone.pitchClass === bass.pitchClass)!;
      const frets = positions.map((position) => position.fret);
      shapes.push({
        id: positions.map(coordinate).join("-"),
        positions: [...positions].sort((a, b) => b.string - a.string),
        span,
        rootInBass: bass.pitchClass === chord.root,
        bassPitchClass: bass.pitchClass,
        bassIntervalLabel: bassTone.intervalLabel,
        inversionLabel: inversionLabel(bassTone.intervalLabel),
        minFret: Math.min(...frets),
        maxFret: Math.max(...frets),
        openStrings: positions.filter((position) => position.fret === 0).length,
        fretPattern: [...positions]
          .sort((a, b) => b.string - a.string)
          .map((position) => position.fret)
          .join(" - ")
      });
    }
  }

  return shapes
    .sort((a, b) => Number(b.rootInBass) - Number(a.rootInBass) || a.span - b.span ||
      Math.min(...a.positions.map((position) => position.fret)) -
      Math.min(...b.positions.map((position) => position.fret)))
    .slice(0, limit);
}

export function triadShapes(chord: Chord, limit = 24): GuitarShape[] {
  const triad = { ...chord, tones: chord.tones.slice(0, 3) };
  const shapes = generateShapes(triad, 3, limit * 2);
  const seen = new Set<string>();
  return shapes.filter((shape) => {
    const stringSet = shape.positions.map((position) => position.string).sort((a, b) => a - b).join("-");
    const key = `${stringSet}:${shape.inversionLabel}:${shape.minFret}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

export function shapeMovement(from: GuitarShape, to: GuitarShape): number {
  const source = [...from.positions].sort((a, b) => a.midi - b.midi);
  const target = [...to.positions].sort((a, b) => a.midi - b.midi);
  const count = Math.min(source.length, target.length);
  return source.slice(0, count).reduce(
    (total, position, index) => total + Math.abs(position.midi - target[index].midi),
    0
  );
}

export function connectChordShapes(chords: readonly Chord[]): GuitarShape[] {
  if (!chords.length) return [];
  const groups = chords.map((chord) => generateShapes(chord, Math.min(4, chord.tones.length), 12));
  if (groups.some((group) => group.length === 0)) return [];
  const selected = [groups[0][0]];
  for (let index = 1; index < groups.length; index += 1) {
    const prior = selected[index - 1];
    selected.push(
      [...groups[index]].sort((a, b) =>
        shapeMovement(prior, a) - shapeMovement(prior, b) ||
        Number(b.rootInBass) - Number(a.rootInBass) ||
        a.span - b.span
      )[0]
    );
  }
  return selected;
}
