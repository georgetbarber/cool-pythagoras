import { useMemo, useRef, useState } from "react";
import { startProgression, stopAudio } from "../audio/engine";
import { Fretboard } from "../components/Fretboard";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { PROGRESSIONS } from "../content/catalog";
import { progressionById, progressionChords, progressionContext } from "../content/progressions";
import { buildScale } from "../core/music/theory";
import { generateShapes } from "../core/instrument/guitar";
import type { FeatureProps } from "./types";

export function PlayAlong({ state, dispatch }: FeatureProps) {
  const [bpm, setBpm] = useState(70);
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<() => void>(() => undefined);
  const definition = progressionById(state.progressionId);
  const localContext = progressionContext(state.context, definition);
  const scale = useMemo(() => buildScale(localContext), [localContext]);
  const chords = useMemo(() => progressionChords(state.context, definition), [state.context, definition]);
  const activeChord = chords[Math.max(0, activeStep)] ?? chords[0];
  const shape = generateShapes(activeChord)[0] ?? null;

  const start = () => {
    stopRef.current();
    setPlaying(true);
    stopRef.current = startProgression(
      chords.map((chord) => chord.tones.map((tone) => tone.pitchClass)),
      bpm,
      (index) => {
        setActiveStep(index);
        if (index < 0) setPlaying(false);
      }
    );
  };
  const stop = () => {
    stopRef.current();
    stopAudio();
    setActiveStep(-1);
    setPlaying(false);
  };

  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Play-along studio"
        title="Put harmonic understanding on a timeline."
        description="Choose a style, set a manageable tempo, follow the active function, and play either chord shapes or single-note targets."
      />
      <section className="panel play-controls">
        <label>
          Progression
          <select value={state.progressionId} onChange={(event) => dispatch({ type: "setProgression", id: event.target.value })}>
            {PROGRESSIONS.map((progression) => <option value={progression.id} key={progression.id}>{progression.genre} · {progression.name}</option>)}
          </select>
        </label>
        <label>
          Tempo
          <input type="range" min="45" max="140" value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
          <strong>{bpm} BPM</strong>
        </label>
        <div className="play-buttons">
          <button className="button primary" disabled={playing} onClick={start}>Start one chorus</button>
          <button className="button secondary" disabled={!playing} onClick={stop}>Stop</button>
        </div>
      </section>
      <section className="panel play-stage">
        <div className="stage-reference">
          <small>Tonal reference</small>
          <strong>{localContext.tonicName} {localContext.mode}</strong>
          <span>{definition.formula}</span>
        </div>
        <div className="play-timeline">
          {chords.map((chord, index) => (
            <article className={activeStep === index ? "is-active" : ""} key={chord.id}>
              <small>Bar {index + 1}</small>
              <strong>{chord.roman}</strong>
              <span>{chord.symbol}</span>
              <p>{chord.functionLabel}</p>
            </article>
          ))}
        </div>
        <div className="current-target">
          <div>
            <div className="section-label">Current target</div>
            <h2>{activeChord.roman} · {activeChord.symbol}</h2>
            <p>Land on {activeChord.rootName}, or play the highlighted compact shape.</p>
          </div>
          <div className="target-tones">
            {activeChord.tones.map((tone) => <span key={tone.intervalLabel}><b>C{tone.intervalLabel}</b>{tone.name}</span>)}
          </div>
        </div>
        <Fretboard
          scale={scale}
          chord={activeChord}
          shape={shape}
          selectedPitch={activeChord.root}
          labelMode={state.labelMode}
          visible="scale"
        />
      </section>
    </div>
  );
}
