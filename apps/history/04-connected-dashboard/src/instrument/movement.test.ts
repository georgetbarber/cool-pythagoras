import { describe, expect, it } from "vitest";
import { buildDiatonicChords, pitch } from "../domain/music";
import { generateVoicings } from "./guitar";
import { connectProgression, movementBetween } from "./movement";

describe("V4 voice leading", () => {
  it("assigns target voices one-to-one", () => {
    const chords = buildDiatonicChords({ tonic: pitch("C"), mode: "major" });
    const from = generateVoicings(chords[0], "auto", { limit: 1 })[0];
    const to = generateVoicings(chords[4], "auto", { limit: 1 })[0];
    const movement = movementBetween(from, to);
    expect(new Set(movement.voices.map((voice) => `${voice.to.string}:${voice.to.fret}`)).size)
      .toBe(movement.voices.length);
  });

  it("connects a complete progression", () => {
    const chords = buildDiatonicChords({ tonic: pitch("C"), mode: "major" });
    const result = connectProgression([chords[0], chords[3], chords[4], chords[0]]);
    expect(result.steps.every((step) => step.voicing)).toBe(true);
    expect(result.movements).toHaveLength(3);
  });
});

