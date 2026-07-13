import type { Dispatch } from "react";
import type { AppAction, AppState } from "../application/store";
import type { Chord, ScaleTone } from "../core/music/types";

export interface AppModel {
  scale: ScaleTone[];
  chords: Chord[];
  activeChord: Chord;
}

export interface FeatureProps {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  model: AppModel;
}
