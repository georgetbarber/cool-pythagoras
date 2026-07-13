import type { PitchClass } from "./types";

export function parsePrimeRow(input: string): PitchClass[] {
  const values = input
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (
    values.length !== 12 ||
    values.some((value) => !Number.isInteger(value) || value < 0 || value > 11) ||
    new Set(values).size !== 12
  ) {
    throw new Error("Enter each pitch class from 0 through 11 exactly once.");
  }
  return values as PitchClass[];
}

export function buildToneRowMatrix(row: readonly PitchClass[]): PitchClass[][] {
  if (row.length !== 12 || new Set(row).size !== 12) {
    throw new Error("A tone row must contain 12 unique pitch classes.");
  }
  const first = row[0];
  const inversion = row.map((value) => ((first - value + first + 12) % 12) as PitchClass);
  return inversion.map((start) => {
    const transposition = (start - first + 12) % 12;
    return row.map((value) => ((value + transposition) % 12) as PitchClass);
  });
}
