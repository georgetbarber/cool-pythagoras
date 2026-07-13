import { describe, expect, it } from "vitest";
import { buildDiatonicChords, pitch } from "../domain/music";
import { connectProgression } from "./voiceLeading";

describe("progression connection", () => {
  it("connects a I-IV-V-I progression with playable voicings", () => {
    const chords = buildDiatonicChords({ tonic: pitch("C"), mode: "major" });
    const result = connectProgression([chords[0], chords[3], chords[4], chords[0]]);
    expect(result.steps).toHaveLength(4);
    expect(result.steps.every((step) => step.voicing !== null)).toBe(true);
    expect(result.movements).toHaveLength(3);
    expect(result.totalMovement).toBeGreaterThanOrEqual(0);
  });
});
