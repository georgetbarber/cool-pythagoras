import type {
  Chord,
  FretPosition,
  ProgressionAnalysis,
  VoiceMovement,
  Voicing
} from "../domain/types";
import { generateVoicings } from "../guitar/model";

function nearestMovement(
  from: FretPosition,
  candidates: readonly FretPosition[]
): VoiceMovement {
  const target = [...candidates].sort(
    (left, right) => Math.abs(left.midi - from.midi) - Math.abs(right.midi - from.midi)
  )[0];
  const semitones = target.midi - from.midi;
  return {
    from,
    to: target,
    semitones,
    direction: semitones === 0 ? "held" : semitones > 0 ? "up" : "down"
  };
}

export function movementBetween(
  from: Voicing,
  to: Voicing
): { voices: VoiceMovement[]; cost: number } {
  const voices = from.positions.map((position) =>
    nearestMovement(position, to.positions)
  );
  const cost = voices.reduce((total, movement) => total + Math.abs(movement.semitones), 0);
  return { voices, cost };
}

export function connectProgression(chords: readonly Chord[]): ProgressionAnalysis {
  if (chords.length === 0) return { steps: [], movements: [], totalMovement: 0 };
  const candidates = chords.map((chord) =>
    generateVoicings(chord, { limit: 12, maxSpan: 4 })
  );
  const first = candidates[0][0] ?? null;
  const selected: Array<Voicing | null> = [first];
  let totalMovement = 0;
  const movements: VoiceMovement[][] = [];

  for (let index = 1; index < chords.length; index += 1) {
    const previous = selected[index - 1];
    if (!previous || candidates[index].length === 0) {
      selected.push(candidates[index][0] ?? null);
      movements.push([]);
      continue;
    }
    const ranked = candidates[index]
      .map((voicing) => ({
        voicing,
        movement: movementBetween(previous, voicing)
      }))
      .sort(
        (left, right) =>
          left.movement.cost + left.voicing.score * 0.08 -
          (right.movement.cost + right.voicing.score * 0.08)
      );
    const best = ranked[0];
    selected.push(best.voicing);
    movements.push(best.movement.voices);
    totalMovement += best.movement.cost;
  }

  return {
    steps: chords.map((chord, index) => ({ chord, voicing: selected[index] })),
    movements,
    totalMovement
  };
}
