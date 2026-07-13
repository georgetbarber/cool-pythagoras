import { describe, expect, it } from "vitest";
import { appReducer, DEFAULT_STATE } from "./store";

describe("explicit application commands", () => {
  it("focuses a chord without changing the tonal centre", () => {
    const next = appReducer(DEFAULT_STATE, { type: "focusChord", degree: 5 });
    expect(next.context).toEqual(DEFAULT_STATE.context);
    expect(next.activeChordDegree).toBe(5);
    expect(next.activeVoicingIndex).toBe(0);
  });

  it("keeps physical position distinct from pitch focus", () => {
    const positioned = appReducer(DEFAULT_STATE, {
      type: "focusPosition",
      string: 2,
      fret: 5,
      pitchClass: 0
    });
    expect(positioned.selectedPitchClass).toBe(0);
    expect(positioned.selectedPosition).toEqual({ string: 2, fret: 5 });
    const pitchOnly = appReducer(positioned, { type: "focusPitch", pitchClass: 4 });
    expect(pitchOnly.selectedPosition).toBeNull();
  });
});

