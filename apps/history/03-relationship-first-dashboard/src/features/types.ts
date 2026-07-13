import type { Chord, PitchAnalysis, ScaleTone, Voicing } from "../domain/types";
import type { AppAction, AppState } from "../state/store";

export interface WorkspaceProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  scale: readonly ScaleTone[];
  chords: readonly Chord[];
  activeChord: Chord;
  analysis: PitchAnalysis;
  voicings: readonly Voicing[];
  activeVoicing: Voicing | null;
}
