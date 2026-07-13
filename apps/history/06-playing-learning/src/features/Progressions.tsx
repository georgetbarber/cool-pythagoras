import { useMemo, useState } from "react";
import { playChord, playVoicing, stopAudio } from "../audio/engine";
import { ContextNotice } from "../components/ContextNotice";
import { ChordInspector } from "../components/ChordInspector";
import { HelpButton } from "../components/HelpButton";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { HELP, PROGRESSIONS } from "../content/catalog";
import { progressionById, progressionChords, progressionContext } from "../content/progressions";
import { connectChordShapes } from "../core/instrument/guitar";
import type { FeatureProps } from "./types";

export function Progressions({ state, dispatch }: FeatureProps) {
  const [genre, setGenre] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedStep, setSelectedStep] = useState(0);
  const definition = progressionById(state.progressionId);
  const localContext = progressionContext(state.context, definition);
  const chords = useMemo(
    () => progressionChords(state.context, definition),
    [state.context, definition]
  );
  const shapes = useMemo(() => connectChordShapes(chords), [chords]);
  const visible = PROGRESSIONS.filter((progression) =>
    (genre === "All" || progression.genre === genre) &&
    `${progression.name} ${progression.formula} ${progression.learningFocus}`.toLowerCase().includes(query.toLowerCase())
  );
  const play = () => {
    stopAudio();
    chords.forEach((chord, index) => {
      const shape = shapes[index];
      if (shape) playVoicing(shape.positions.map((position) => position.midi), index * 1.1);
      else playChord(chord.tones.map((tone) => tone.pitchClass), index * 1.1);
    });
  };
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Progression library"
        title="Learn movement, not just chord sequences."
        description="Each form states its tonal reference, Roman-numeral pattern, functional purpose, and style-specific learning goal."
        action={<HelpButton {...HELP.romanNumerals} />}
      />
      <ContextNotice state={state} dispatch={dispatch} mode={definition.mode} />
      <section className="panel progression-browser">
        <div className="progression-filters">
          <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="blues, cadence, modal..." /></label>
          <div>
            {["All", ...new Set(PROGRESSIONS.map((progression) => progression.genre))].map((item) => (
              <button className={genre === item ? "is-active" : ""} onClick={() => setGenre(item)} key={item}>{item}</button>
            ))}
          </div>
        </div>
        <div className="progression-library">
          {visible.map((progression) => (
            <button
              className={progression.id === state.progressionId ? "is-active" : ""}
              onClick={() => dispatch({ type: "setProgression", id: progression.id })}
              key={progression.id}
            >
              <small>{progression.genre}</small>
              <strong>{progression.name}</strong>
              <span>{progression.formula}</span>
              <p>{progression.description}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="panel progression-focus">
        <div className="panel-heading">
          <div>
            <div className="section-label">Active form · relative to {localContext.tonicName} {localContext.mode}</div>
            <h2>{definition.name}</h2>
            <p>{definition.learningFocus}</p>
          </div>
          <button className="button primary" onClick={play}>Play progression</button>
        </div>
        <div className="progression-timeline">
          {chords.map((chord, index) => (
            <article className={selectedStep === index ? "is-selected" : ""} key={chord.id}>
              <button className="timeline-main" onClick={() => setSelectedStep(index)}>
                <small>Step {index + 1}</small>
                <strong>{chord.roman}</strong>
                <span>{chord.symbol}</span>
                <p>{chord.functionLabel}</p>
              </button>
              <button onClick={() => {
                const shape = shapes[index];
                if (shape) playVoicing(shape.positions.map((position) => position.midi));
                else playChord(chord.tones.map((tone) => tone.pitchClass));
              }}>Hear voicing</button>
            </article>
          ))}
        </div>
      </section>
      <ChordInspector
        chord={chords[Math.min(selectedStep, chords.length - 1)]}
        context={localContext}
        shape={shapes[Math.min(selectedStep, shapes.length - 1)]}
      />
    </div>
  );
}
