import { INTERVALS, intervalLabel, intervalName, normalize } from "../domain/music";
import type { FretPosition, PitchClass } from "../domain/types";
import { buildFretboard, GUITAR } from "./guitar";

export interface IntervalVector {
  fromString: number;
  toString: number;
  fretDelta: number;
  semitones: number;
  label: string;
}

export function intervalBetween(from: FretPosition, to: FretPosition): number {
  return normalize(to.midi - from.midi);
}

export function positionsAtInterval(
  root: FretPosition,
  semitones: number,
  maxFret = GUITAR.fretCount
): FretPosition[] {
  return buildFretboard().filter(
    (position) =>
      position.fret <= maxFret &&
      !(position.string === root.string && position.fret === root.fret) &&
      normalize(position.midi - root.midi) === normalize(semitones)
  );
}

export function vectorsForInterval(semitones: number): IntervalVector[] {
  const vectors: IntervalVector[] = [];
  for (let fromString = 5; fromString >= 1; fromString -= 1) {
    const rootMidi = GUITAR.openMidi[fromString] + 7;
    for (let toString = fromString - 1; toString >= 0; toString -= 1) {
      const baseDelta = GUITAR.openMidi[toString] - GUITAR.openMidi[fromString];
      for (let fretDelta = -5; fretDelta <= 7; fretDelta += 1) {
        if (normalize(baseDelta + fretDelta) === normalize(semitones)) {
          vectors.push({
            fromString,
            toString,
            fretDelta,
            semitones,
            label: `${fretDelta >= 0 ? "+" : ""}${fretDelta} frets`
          });
          break;
        }
      }
    }
  }
  return vectors;
}

export function stringPairRules(semitones: number): Array<{
  pair: string;
  movement: string;
  crossesTuningBoundary: boolean;
}> {
  return vectorsForInterval(semitones)
    .filter((vector) => vector.fromString - vector.toString === 1)
    .map((vector) => ({
      pair: `${GUITAR.stringLabels[vector.fromString]}→${GUITAR.stringLabels[vector.toString]}`,
      movement: vector.label,
      crossesTuningBoundary: vector.fromString === 2 && vector.toString === 1
    }));
}

export function transposedRoots(root: PitchClass, interval: number): Array<{
  root: PitchClass;
  target: PitchClass;
  intervalLabel: string;
  intervalName: string;
}> {
  return Array.from({ length: 12 }, (_, transposition) => ({
    root: normalize(root + transposition),
    target: normalize(root + transposition + interval),
    intervalLabel: intervalLabel(interval),
    intervalName: intervalName(interval)
  }));
}

export function intervalProfile(semitones: number) {
  return INTERVALS[normalize(semitones)];
}
