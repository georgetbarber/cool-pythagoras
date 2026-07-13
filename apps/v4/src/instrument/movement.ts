import type { Chord, FretPosition, ProgressionAnalysis, VoiceMovement, Voicing } from "../domain/types";
import { generateVoicings } from "./guitar";

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [Array.from(items)];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest])
  );
}

export function movementBetween(from: Voicing, to: Voicing): { voices: VoiceMovement[]; cost: number } {
  const source = [...from.positions].sort((a, b) => a.midi - b.midi);
  const target = [...to.positions].sort((a, b) => a.midi - b.midi);
  const count = Math.min(source.length, target.length);
  const targetPermutations = permutations(target).map((candidate) => candidate.slice(0, count));
  const best = targetPermutations
    .map((candidate) => {
      const voices = source.slice(0, count).map((position, index) => {
        const destination = candidate[index];
        const semitones = destination.midi - position.midi;
        return {
          from: position,
          to: destination,
          semitones,
          direction: semitones === 0 ? "held" as const : semitones > 0 ? "up" as const : "down" as const
        };
      });
      return { voices, cost: voices.reduce((sum, voice) => sum + Math.abs(voice.semitones), 0) };
    })
    .sort((a, b) => a.cost - b.cost)[0];
  return best ?? { voices: [], cost: 0 };
}

export function connectProgression(chords: readonly Chord[]): ProgressionAnalysis {
  if (!chords.length) return { steps: [], movements: [], totalMovement: 0 };
  const candidates = chords.map((chord) => generateVoicings(chord, "auto", { limit: 10 }));
  if (candidates.some((group) => group.length === 0)) {
    return { steps: chords.map((chord) => ({ chord, voicing: null })), movements: [], totalMovement: 0 };
  }

  const costs: number[][] = candidates.map((group) => group.map(() => Number.POSITIVE_INFINITY));
  const previous: number[][] = candidates.map((group) => group.map(() => -1));
  candidates[0].forEach((voicing, index) => { costs[0][index] = voicing.score * 0.03; });

  for (let step = 1; step < candidates.length; step += 1) {
    candidates[step].forEach((current, currentIndex) => {
      candidates[step - 1].forEach((prior, priorIndex) => {
        const movement = movementBetween(prior, current);
        const cost = costs[step - 1][priorIndex] + movement.cost + current.score * 0.03;
        if (cost < costs[step][currentIndex]) {
          costs[step][currentIndex] = cost;
          previous[step][currentIndex] = priorIndex;
        }
      });
    });
  }

  let cursor = costs.at(-1)!.reduce((best, cost, index, all) => cost < all[best] ? index : best, 0);
  const chosen = new Array<Voicing>(chords.length);
  for (let step = chords.length - 1; step >= 0; step -= 1) {
    chosen[step] = candidates[step][cursor];
    cursor = previous[step][cursor];
  }
  const movements = chosen.slice(1).map((voicing, index) => movementBetween(chosen[index], voicing));
  return {
    steps: chords.map((chord, index) => ({ chord, voicing: chosen[index] })),
    movements: movements.map((movement) => movement.voices),
    totalMovement: movements.reduce((sum, movement) => sum + movement.cost, 0)
  };
}

