import { describe, expect, it } from "vitest";
import { pitch } from "../domain/music";
import { buildProgressionChords, progressionById, PROGRESSIONS } from "./progressions";

const context = { tonic: pitch("C"), mode: "major" as const };

describe("progression library", () => {
  it("contains substantial style coverage", () => {
    expect(PROGRESSIONS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(PROGRESSIONS.map((progression) => progression.category))).toEqual(
      new Set(["Foundations", "Pop & rock", "Blues", "Jazz", "Minor", "Modal", "Chromatic"])
    );
  });

  it("builds the full 12-bar blues with dominant-seventh colours", () => {
    const chords = buildProgressionChords(context, progressionById("twelve-bar"));
    expect(chords).toHaveLength(12);
    expect(chords.map((chord) => chord.romanNumeral).slice(8)).toEqual(["V7", "IV7", "I7", "V7"]);
    expect(chords.every((chord) => chord.quality === "dominant7")).toBe(true);
  });

  it("builds jazz and backdoor chromatic harmony correctly", () => {
    const rhythm = buildProgressionChords(context, progressionById("three-six-two-five"));
    expect(rhythm.map((chord) => chord.symbol)).toEqual(["Em7", "A7", "Dm7", "G7"]);
    const backdoor = buildProgressionChords(context, progressionById("backdoor"));
    expect(backdoor.map((chord) => chord.symbol)).toEqual(["Fm7", "Bb7", "Cmaj7"]);
  });
});

