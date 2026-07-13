import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildChords, buildScale, createContext } from "../core/music/theory";
import { Fretboard } from "./Fretboard";

describe("V7 fretboard relationship labels", () => {
  it("uses explicit key and chord words instead of note-like initials", () => {
    const context = createContext("C", "major");
    const markup = renderToStaticMarkup(createElement(Fretboard, {
      scale: buildScale(context),
      chord: buildChords(context)[4],
      visible: "all",
      fretStart: 0,
      fretEnd: 1
    }));
    expect(markup).toContain("Key 7");
    expect(markup).toContain("Chord 3rd");
    expect(markup).toContain("degree from the tonal centre");
    expect(markup).not.toContain(">D7<");
    expect(markup).not.toContain(">C3<");
  });
});
