import { buildScale, normalize } from "./theory";
import type { PitchClass, TonalContext } from "./types";

export type ChromaticRelationship = "diatonic" | "chromatic-neighbour" | "chromatic-approach" | "outside-reference";

export interface ChromaticAnalysis {
  relationship: ChromaticRelationship;
  label: string;
  explanation: string;
  possibleTargets: PitchClass[];
}

export function analyzeChromaticPitch(context: TonalContext, pitch: PitchClass, nextPitch?: PitchClass): ChromaticAnalysis {
  const scale = buildScale(context);
  if (scale.some((tone) => tone.pitchClass === pitch)) {
    return { relationship: "diatonic", label: "Inside the active collection", explanation: "This pitch belongs to the current reference collection; its effect still depends on rhythm, register and harmony.", possibleTargets: [] };
  }
  const neighbours = scale.filter((tone) => [1, 11].includes(normalize(tone.pitchClass - pitch))).map((tone) => tone.pitchClass);
  const approaches = nextPitch !== undefined && neighbours.includes(nextPitch);
  return {
    relationship: approaches ? "chromatic-approach" : neighbours.length ? "chromatic-neighbour" : "outside-reference",
    label: approaches ? "Chromatic approach" : neighbours.length ? "Chromatic neighbour" : "Outside the active reference",
    explanation: approaches
      ? "The pitch sits a semitone from the following scale tone, so its motion can make the target more vivid. Outside does not mean wrong."
      : neighbours.length
        ? "This pitch is a semitone beside one or more scale tones. It can decorate, delay or redirect them depending on what follows. Outside does not mean wrong."
        : "The pitch is not in the active collection and has no single forced meaning. Hear its destination before choosing a label.",
    possibleTargets: neighbours
  };
}
