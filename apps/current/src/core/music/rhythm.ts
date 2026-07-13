export type Subdivision = 1 | 2 | 3 | 4;
export type Metre = "4/4" | "3/4" | "6/8";

export interface RhythmEvent {
  beat: number;
  duration: number;
  rest?: boolean;
  accent?: boolean;
  tie?: boolean;
}

export interface RhythmPattern {
  metre: Metre;
  subdivision: Subdivision;
  bars: number;
  events: RhythmEvent[];
}

export function beatsPerBar(metre: Metre): number {
  return metre === "3/4" ? 3 : metre === "6/8" ? 6 : 4;
}

export function validateRhythm(pattern: RhythmPattern): string[] {
  const errors: string[] = [];
  const capacity = beatsPerBar(pattern.metre) * pattern.bars;
  for (const event of pattern.events) {
    if (event.beat < 0 || event.duration <= 0) errors.push("Rhythm events require a non-negative beat and positive duration.");
    if (event.beat + event.duration > capacity) errors.push("A rhythm event extends beyond the pattern.");
    const grid = 1 / pattern.subdivision;
    if (Math.abs(event.beat / grid - Math.round(event.beat / grid)) > 0.0001) errors.push("An event does not align with the selected subdivision.");
  }
  return [...new Set(errors)];
}

export function transformRhythm(pattern: RhythmPattern, operation: "augment" | "diminish" | "rotate"): RhythmPattern {
  const capacity = beatsPerBar(pattern.metre) * pattern.bars;
  if (operation === "rotate") {
    const shift = 1 / pattern.subdivision;
    return { ...pattern, events: pattern.events.map((event) => ({ ...event, beat: (event.beat + shift) % capacity })) };
  }
  const factor = operation === "augment" ? 2 : 0.5;
  return {
    ...pattern,
    bars: operation === "augment" ? pattern.bars * 2 : Math.max(1, Math.ceil(pattern.bars / 2)),
    events: pattern.events.map((event) => ({ ...event, beat: event.beat * factor, duration: event.duration * factor }))
  };
}

export function rhythmDescription(pattern: RhythmPattern): string {
  const sounded = pattern.events.filter((event) => !event.rest).length;
  const rests = pattern.events.filter((event) => event.rest).length;
  const accents = pattern.events.filter((event) => event.accent).length;
  return `${pattern.bars} bar${pattern.bars === 1 ? "" : "s"} of ${pattern.metre}; ${sounded} attacks, ${rests} rests and ${accents} accents on a ${pattern.subdivision}-part beat grid.`;
}
