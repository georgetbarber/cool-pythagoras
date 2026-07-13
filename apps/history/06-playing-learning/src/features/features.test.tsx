import { createElement } from "react";
import type { Dispatch } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AppAction } from "../application/store";
import { DEFAULT_STATE } from "../application/store";
import { buildChords, buildScale } from "../core/music/theory";
import { Dashboard } from "./Dashboard";
import { Ear } from "./Ear";
import { Explore } from "./Explore";
import { FretboardLab } from "./FretboardLab";
import { Harmony } from "./Harmony";
import { Learn } from "./Learn";
import { PlayAlong } from "./PlayAlong";
import { PlayLab } from "./PlayLab";
import { Practice } from "./Practice";
import { Profile } from "./Profile";
import { Progressions } from "./Progressions";
import type { FeatureProps } from "./types";

const dispatch: Dispatch<AppAction> = () => undefined;
const chords = buildChords(DEFAULT_STATE.context);
const props: FeatureProps = {
  state: DEFAULT_STATE,
  dispatch,
  model: {
    scale: buildScale(DEFAULT_STATE.context),
    chords,
    activeChord: chords[0]
  }
};

const pages = [
  ["Dashboard", Dashboard],
  ["Learn", Learn],
  ["Explore", Explore],
  ["Fretboard", FretboardLab],
  ["Harmony", Harmony],
  ["Progressions", Progressions],
  ["Ear", Ear],
  ["Practice", Practice],
  ["Play Lab", PlayLab],
  ["Play Along", PlayAlong],
  ["My Path", Profile]
] as const;

describe("V6 feature pages", () => {
  it.each(pages)("%s renders its primary workspace", (name, Component) => {
    const markup = renderToStaticMarkup(createElement(Component, props));
    expect(markup.length, name).toBeGreaterThan(300);
    expect(markup).not.toContain("undefined");
  });

  it("renders a guided lesson action before allowing progression", () => {
    const state = {
      ...DEFAULT_STATE,
      learning: {
        ...DEFAULT_STATE.learning,
        currentLessonId: "tonal-home"
      }
    };
    const markup = renderToStaticMarkup(createElement(Learn, { ...props, state }));
    expect(markup).toContain("Keep constant");
    expect(markup).toContain("I completed the guided action");
  });
});
