import { buildChord, buildChords, createContext } from "../core/music/theory";
import type { Chord, ProgressionDefinition, TonalContext } from "../core/music/types";
import { PROGRESSIONS } from "./catalog";

export function progressionById(id: string): ProgressionDefinition {
  return PROGRESSIONS.find((progression) => progression.id === id) ?? PROGRESSIONS[0];
}

export function progressionContext(context: TonalContext, progression: ProgressionDefinition): TonalContext {
  return createContext(context.tonicName, progression.mode);
}

export function progressionChords(context: TonalContext, progression: ProgressionDefinition): Chord[] {
  const localContext = progressionContext(context, progression);
  const diatonic = buildChords(localContext, progression.genre === "Jazz");
  return progression.degrees.map((degree, index) => {
    const quality = progression.qualities?.[index];
    if (!quality) return { ...diatonic[degree - 1], id: `${progression.id}-${index}-${diatonic[degree - 1].id}` };
    return {
      ...buildChord(localContext, degree, quality),
      id: `${progression.id}-${index}-${degree}-${quality}`
    };
  });
}
