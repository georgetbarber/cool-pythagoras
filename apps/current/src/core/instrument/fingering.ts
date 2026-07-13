import type { FretPosition, GuitarShape } from "./guitar";

export interface FingerAssignment { string: number; fret: number; finger: 0 | 1 | 2 | 3 | 4 }
export interface Barre { finger: 1 | 2 | 3 | 4; fret: number; fromString: number; toString: number }
export interface FingeringAssessment {
  feasible: boolean;
  confidence: "high" | "medium" | "low";
  difficulty: number;
  assignments: FingerAssignment[];
  barres: Barre[];
  mutedStrings: number[];
  warnings: string[];
}

function uniqueFrets(positions: readonly FretPosition[]): number[] {
  return [...new Set(positions.filter((position) => position.fret > 0).map((position) => position.fret))].sort((a, b) => a - b);
}

export function assessFingering(shape: Pick<GuitarShape, "positions" | "span" | "openStrings">): FingeringAssessment {
  const fretted = shape.positions.filter((position) => position.fret > 0);
  const frets = uniqueFrets(shape.positions);
  const warnings: string[] = [];
  const assignments: FingerAssignment[] = [];
  const barres: Barre[] = [];
  if (shape.span > 4) warnings.push("The fretted span exceeds four frets.");
  if (frets.length > 4) warnings.push("The shape requires more distinct frets than available fretting fingers.");
  if (shape.openStrings && Math.max(0, ...frets) > 4) warnings.push("Open strings are combined with a high-position reach.");
  let nextFinger: 1 | 2 | 3 | 4 = 1;
  for (const fret of frets) {
    const atFret = fretted.filter((position) => position.fret === fret).sort((a, b) => a.string - b.string);
    const consecutive = atFret.every((position, index) => index === 0 || position.string === atFret[index - 1].string + 1);
    if (atFret.length > 1 && consecutive) {
      barres.push({ finger: nextFinger, fret, fromString: atFret[0].string, toString: atFret.at(-1)!.string });
      atFret.forEach((position) => assignments.push({ ...position, finger: nextFinger }));
    } else {
      for (const position of atFret) {
        assignments.push({ ...position, finger: nextFinger });
        if (nextFinger < 4) nextFinger = (nextFinger + 1) as 1 | 2 | 3 | 4;
        else if (position !== atFret.at(-1)) warnings.push("More independent finger placements are required than available fingers.");
      }
    }
    if (nextFinger < 4) nextFinger = (nextFinger + 1) as 1 | 2 | 3 | 4;
  }
  const usedStrings = new Set(shape.positions.map((position) => position.string));
  const mutedStrings = Array.from({ length: 6 }, (_, string) => string).filter((string) => !usedStrings.has(string));
  const difficulty = Math.min(10, Math.max(1, shape.span + fretted.length + barres.length * 2 + (warnings.length ? 2 : 0)));
  const feasible = warnings.length === 0;
  return { feasible, confidence: feasible ? (difficulty <= 5 ? "high" : "medium") : "low", difficulty, assignments, barres, mutedStrings, warnings };
}

export function transitionCost(from: FingeringAssessment, to: FingeringAssessment): number {
  const fingerMoves = to.assignments.reduce((sum, target) => {
    const source = from.assignments.find((item) => item.finger === target.finger);
    return sum + (source ? Math.abs(source.fret - target.fret) + Math.abs(source.string - target.string) : 2);
  }, 0);
  return fingerMoves + Math.abs(from.barres.length - to.barres.length) * 2 + Number(!to.feasible) * 20;
}
