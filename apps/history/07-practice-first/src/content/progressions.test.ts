import { describe, expect, it } from "vitest";
import { createContext } from "../core/music/theory";
import { progressionById, progressionChords } from "./progressions";

describe("V7 progression content", () => {
  it("transposes custom progression chords with the tonal centre", () => {
    const progression = progressionById("jazz-two-five-one");
    expect(progressionChords(createContext("C"), progression).map((chord) => chord.symbol))
      .toEqual(["Dm7", "G7", "Cmaj7"]);
    expect(progressionChords(createContext("D"), progression).map((chord) => chord.symbol))
      .toEqual(["Em7", "A7", "Dmaj7"]);
  });

  it("builds all twelve bars of the blues form", () => {
    const chords = progressionChords(createContext("A"), progressionById("twelve-bar"));
    expect(chords).toHaveLength(12);
    expect(chords.slice(-4).map((chord) => chord.symbol)).toEqual(["E7", "D7", "A7", "E7"]);
  });
});
