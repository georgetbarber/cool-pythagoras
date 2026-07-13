import { useEffect, useMemo, useRef, useState } from "react";
import { startVoicingProgression, stopAudio } from "../audio/engine";
import { ContextNotice } from "../components/ContextNotice";
import { ChordInspector } from "../components/ChordInspector";
import { Fretboard } from "../components/Fretboard";
import { PerformanceCoach } from "../components/PerformanceCoach";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { PROGRESSIONS } from "../content/catalog";
import { progressionById, progressionChords, progressionContext } from "../content/progressions";
import { buildScale, chordToneDisplayLabel } from "../core/music/theory";
import { connectChordShapes } from "../core/instrument/guitar";
import type { FeatureProps } from "./types";

export function PlayAlong({ state, dispatch }: FeatureProps) {
  const [bpm, setBpm] = useState(70);
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [inspectedStep, setInspectedStep] = useState(0);
  const stopRef = useRef<() => void>(() => undefined);
  const definition = progressionById(state.progressionId);
  const localContext = progressionContext(state.context, definition);
  const scale = useMemo(() => buildScale(localContext), [localContext]);
  const chords = useMemo(() => progressionChords(state.context, definition), [state.context, definition]);
  const shapes = useMemo(() => connectChordShapes(chords), [chords]);
  const voicings = useMemo(() => chords.map((chord, index) =>
    shapes[index]?.positions.map((position) => position.midi) ??
    chord.tones.map((tone, toneIndex) => 48 + tone.pitchClass + (toneIndex > 1 ? 12 : 0))
  ), [chords, shapes]);
  const displayStep = activeStep >= 0 ? activeStep : inspectedStep;
  const activeChord = chords[Math.max(0, displayStep)] ?? chords[0];
  const shape = shapes[Math.max(0, displayStep)] ?? shapes[0] ?? null;

  useEffect(() => () => {
    stopRef.current();
    stopAudio();
  }, []);
  useEffect(() => {
    stopRef.current();
    stopAudio();
    setActiveStep(-1);
    setInspectedStep(0);
    setPlaying(false);
  }, [state.progressionId, state.context]);

  const start = () => {
    stopRef.current();
    setPlaying(true);
    stopRef.current = startVoicingProgression(
      voicings,
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
      <ContextNotice state={state} dispatch={dispatch} mode={definition.mode} />
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
            <article className={[
              activeStep === index ? "is-active" : "",
              activeStep < 0 && inspectedStep === index ? "is-selected" : ""
            ].filter(Boolean).join(" ")} key={chord.id}>
              <button className="timeline-main" onClick={() => setInspectedStep(index)}>
                <small>Bar {index + 1}</small>
                <strong>{chord.roman}</strong>
                <span>{chord.symbol}</span>
                <p>{chord.functionLabel}</p>
              </button>
            </article>
          ))}
        </div>
        <div className="current-target">
          <div>
            <div className="section-label">Current target</div>
            <h2>{activeChord.roman} · {activeChord.symbol}</h2>
            <p>
              Land on {activeChord.rootName}, or play the highlighted {shape?.inversionLabel.toLowerCase() ?? "compact voicing"}.
              The backing audio uses this displayed shape.
            </p>
          </div>
          <div className="target-tones">
            {activeChord.tones.map((tone) => <span key={tone.intervalLabel}><b>Chord {chordToneDisplayLabel(tone.intervalLabel)}</b>{tone.name}</span>)}
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
        {shape && (
          <div className="play-shape-caption">
            <strong>{shape.inversionLabel}</strong>
            <span>Pattern {shape.fretPattern}</span>
            <small>Movement is minimised from the previous displayed chord.</small>
          </div>
        )}
        {!shape && (
          <p className="play-shape-caption">
            No compact guitar shape was found for this step, so playback uses a clearly labelled close-position fallback.
          </p>
        )}
      </section>
      <ChordInspector chord={activeChord} context={localContext} shape={shape} />
      <PerformanceCoach
        targetMidi={shape?.positions.find((position) => position.pitchClass === activeChord.root)?.midi ?? 48 + activeChord.root}
        targetName={activeChord.rootName}
        bpm={bpm}
      />
    </div>
  );
}
