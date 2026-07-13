import type { FretPosition, PitchClass, Tuning } from "../domain/types";

export const FRET_COUNT = 15;

export function pitchClassFromMidi(midi: number): PitchClass {
  return ((midi % 12) + 12) % 12 as PitchClass;
}

export function buildFretboard(tuning: Tuning, fretCount = FRET_COUNT): FretPosition[] {
  return tuning.openMidi.flatMap((openMidi, string) =>
    Array.from({ length: fretCount + 1 }, (_, fret) => ({
      string,
      fret,
      midi: openMidi + fret,
      pitchClass: pitchClassFromMidi(openMidi + fret)
    }))
  );
}

export function positionsForPitchClasses(
  tuning: Tuning,
  pitchClasses: readonly PitchClass[],
  fretCount = FRET_COUNT
): FretPosition[] {
  return buildFretboard(tuning, fretCount).filter((position) =>
    pitchClasses.includes(position.pitchClass)
  );
}
