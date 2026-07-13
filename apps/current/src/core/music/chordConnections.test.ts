import { describe, expect, it } from "vitest";
import { buildFretboard, generateShapes } from "../instrument/guitar";
import {
  analyzeDiscoveredProgression,
  suggestChordConnections
} from "./chordConnections";
import { identifyChord } from "./chordDiscovery";
import { buildChords, createContext } from "./theory";

function shape(frets: readonly (number | null)[]) {
  const board = buildFretboard();
  return frets.flatMap((fret, string) =>
    fret === null ? [] : board.filter((position) => position.string === string && position.fret === fret)
  );
}

function candidateForChord(index: number) {
  const context = createContext("C", "major");
  const chord = buildChords(context)[index];
  const voicing = generateShapes(chord)[0];
  return identifyChord(voicing.positions, context).candidates.find((candidate) =>
    candidate.root === chord.root && candidate.quality === chord.quality
  )!;
}

describe("V7 chord connections", () => {
  it("suggests diatonic movement and optional modal colour from tonic", () => {
    const context = createContext("C", "major");
    const candidate = identifyChord(shape([0, 1, 0, 2, 3, null]), context).candidates[0];
    const suggestions = suggestChordConnections(candidate, context);
    expect(suggestions.map((item) => item.chord.symbol)).toEqual(
      expect.arrayContaining(["F", "Am", "G", "Bb"])
    );
    expect(suggestions.find((item) => item.chord.symbol === "Bb")?.category).toBe("modal-rock");
  });

  it("prioritises tonic resolution after the dominant", () => {
    const context = createContext("C", "major");
    const candidate = candidateForChord(4);
    const suggestions = suggestChordConnections(candidate, context);
    expect(suggestions[0]).toMatchObject({
      label: "Resolve home",
      chord: { symbol: "C", roman: "I" }
    });
  });

  it("analyses a clear diatonic progression and its V-I return", () => {
    const context = createContext("C", "major");
    const candidates = [0, 3, 4, 0].map(candidateForChord);
    const analysis = analyzeDiscoveredProgression(candidates, context);
    expect(analysis.confidence).toBe("clear");
    expect(analysis.romanSequence).toBe("I → IV → V → I");
    expect(analysis.summary).toContain("V-I resolution");
  });

  it("labels borrowed/modal movement without claiming it is diatonic", () => {
    const context = createContext("C", "major");
    const c = identifyChord(shape([0, 1, 0, 2, 3, null]), context).candidates[0];
    const bb = identifyChord(shape([1, 3, 3, 3, 1, null]), context).candidates
      .find((candidate) => candidate.symbol === "Bb")!;
    const analysis = analyzeDiscoveredProgression([c, bb, c], context);
    expect(analysis.confidence).toBe("mixed");
    expect(analysis.romanSequence).toBe("I → bVII → I");
    expect(analysis.summary).toContain("borrowed");
  });

  it("suggests the borrowed V7 from a natural-minor tonic", () => {
    const context = createContext("A", "minor");
    const tonic = buildChords(context)[0];
    const voicing = generateShapes(tonic)[0];
    const candidate = identifyChord(voicing.positions, context).candidates.find((item) =>
      item.root === tonic.root && item.quality === tonic.quality
    )!;
    expect(suggestChordConnections(candidate, context).some((item) =>
      item.chord.root === 4 && item.chord.quality === "dominant7"
    )).toBe(true);
  });
});
