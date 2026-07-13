import { useMemo, useState } from "react";
import { playChord, stopAudio } from "../audio/engine";
import { HelpButton } from "../components/HelpButton";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { HELP, PROGRESSIONS } from "../content/catalog";
import { progressionById, progressionChords, progressionContext } from "../content/progressions";
import type { FeatureProps } from "./types";

export function Progressions({ state, dispatch }: FeatureProps) {
  const [genre, setGenre] = useState("All");
  const [query, setQuery] = useState("");
  const definition = progressionById(state.progressionId);
  const localContext = progressionContext(state.context, definition);
  const chords = useMemo(
    () => progressionChords(state.context, definition),
    [state.context, definition]
  );
  const visible = PROGRESSIONS.filter((progression) =>
    (genre === "All" || progression.genre === genre) &&
    `${progression.name} ${progression.formula} ${progression.learningFocus}`.toLowerCase().includes(query.toLowerCase())
  );
  const play = () => {
    stopAudio();
    chords.forEach((chord, index) => playChord(chord.tones.map((tone) => tone.pitchClass), index * 1.1));
  };
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Progression library"
        title="Learn movement, not just chord sequences."
        description="Each form states its tonal reference, Roman-numeral pattern, functional purpose, and style-specific learning goal."
        action={<HelpButton {...HELP.romanNumerals} />}
      />
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
            <article key={chord.id}>
              <small>Step {index + 1}</small>
              <strong>{chord.roman}</strong>
              <span>{chord.symbol}</span>
              <p>{chord.functionLabel}</p>
              <button onClick={() => playChord(chord.tones.map((tone) => tone.pitchClass))}>Hear</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
