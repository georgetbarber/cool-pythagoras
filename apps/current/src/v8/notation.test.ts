import { describe, expect, it } from "vitest";
import { classifyLine, labelLines, legendFor } from "./notation";

describe("micro-study notation classifier", () => {
  it("recognises real guitar tab and accent/count rows", () => {
    expect(classifyLine("E|--0---0---0---0--|")).toBe("tab");
    expect(classifyLine("B|--5-------5-------|")).toBe("tab");
    expect(classifyLine("    >       >")).toBe("accents");
    expect(classifyLine("Count 1 + 2 + 3 + 4 +")).toBe("count");
  });

  it("separates scale degrees, chords and note names", () => {
    expect(classifyLine("1 2 3 4 | 5 4 3 2 | 1")).toBe("degrees");
    expect(classifyLine("1-3-5 | 3-5-1 | 5-1-3")).toBe("degrees");
    expect(classifyLine("I | IV | V | I")).toBe("chords");
    expect(classifyLine("I7 | IV7 | I7 | V7")).toBe("chords");
    expect(classifyLine("Dorian: i IV")).toBe("chords");
    expect(classifyLine("E A D G B E")).toBe("notes");
    expect(classifyLine("C B A G")).toBe("notes");
  });

  it("leaves prose guidance unlabelled", () => {
    expect(classifyLine("home away colour home")).toBe("guide");
    expect(classifyLine("change time and touch")).toBe("guide");
    expect(classifyLine("stable → moving → tense → release")).toBe("guide");
  });

  it("builds an adaptive legend from only the notations present", () => {
    const tabWithAccents = labelLines(["E|--0---0---0---0--|", "    >       >"]);
    const legend = legendFor(tabWithAccents).join(" ");
    expect(legend).toContain("Tab");
    expect(legend).toContain("Accents");
    expect(legend).not.toContain("Roman numerals");

    const chords = legendFor(labelLines(["I | IV | V | I", "home expand tension return"])).join(" ");
    expect(chords).toContain("Roman numerals");
    expect(chords).not.toContain("each lettered row is a guitar string");
  });
});
