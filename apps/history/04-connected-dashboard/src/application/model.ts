import { useMemo } from "react";
import { analyzeRelationship, buildDiatonicChords, buildScale } from "../domain/music";
import { buildProgressionChords, progressionById } from "../content/progressions";
import { generateVoicings } from "../instrument/guitar";
import { connectProgression } from "../instrument/movement";
import type { AppState } from "./store";

export function useAppModel(state: AppState) {
  const scale = useMemo(() => buildScale(state.context), [state.context]);
  const chords = useMemo(() => buildDiatonicChords(state.context, state.sevenths), [state.context, state.sevenths]);
  const activeChord =
    state.focusedChord ??
    chords.find((chord) => chord.degree === state.activeChordDegree) ??
    chords[0];
  const voicings = useMemo(
    () => generateVoicings(activeChord, state.stringPolicy, { limit: 16 }),
    [activeChord, state.stringPolicy]
  );
  const safeVoicingIndex = Math.min(state.activeVoicingIndex, Math.max(0, voicings.length - 1));
  const activeVoicing = voicings[safeVoicingIndex] ?? null;
  const relationship = useMemo(
    () => analyzeRelationship(state.context, state.selectedPitchClass, activeChord),
    [state.context, state.selectedPitchClass, activeChord]
  );
  const progression = progressionById(state.progressionId);
  const progressionChords = useMemo(
    () => buildProgressionChords(state.context, progression),
    [state.context, progression]
  );
  const progressionAnalysis = useMemo(
    () => connectProgression(progressionChords),
    [progressionChords.map((chord) => chord.id).join("|")]
  );
  return {
    scale,
    chords,
    activeChord,
    voicings,
    activeVoicing,
    safeVoicingIndex,
    relationship,
    progression,
    progressionAnalysis
  };
}
