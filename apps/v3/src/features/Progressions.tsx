import { useMemo, useState } from "react";
import { playChord, stopAudio } from "../audio/engine";
import type { Chord } from "../domain/types";
import { connectProgression } from "../movement/voiceLeading";
import type { WorkspaceProps } from "./types";

const PROGRESSIONS = [
  {
    id: "departure-return",
    name: "Departure and return",
    formula: "I – IV – V – I",
    degrees: [1, 4, 5, 1],
    description: "Tonic stability moves through predominant tension to dominant resolution."
  },
  {
    id: "axis",
    name: "Common-tone loop",
    formula: "I – V – vi – IV",
    degrees: [1, 5, 6, 4],
    description: "A familiar loop whose smoothness comes from shared tones and stepwise voices."
  },
  {
    id: "two-five-one",
    name: "Directed cadence",
    formula: "ii – V – I",
    degrees: [2, 5, 1],
    description: "Predominant moves into dominant, then resolves into tonic."
  }
] as const;

export function Progressions({ state, chords }: WorkspaceProps) {
  const [progressionId, setProgressionId] = useState<string>(PROGRESSIONS[0].id);
  const selected =
    PROGRESSIONS.find((progression) => progression.id === progressionId) ??
    PROGRESSIONS[0];
  const progressionChords = selected.degrees.map(
    (degree) => chords[degree - 1]
  ) as Chord[];
  const actualFormula = progressionChords
    .map((chord) => chord.romanNumeral)
    .join(" – ");
  const analysis = useMemo(
    () => connectProgression(progressionChords),
    [progressionChords.map((chord) => chord.id).join("|")]
  );

  const playSequence = () => {
    stopAudio();
    analysis.steps.forEach((step, index) => {
      if (!step.voicing) return;
      playChord(
        step.voicing.positions.map((position) => position.midi),
        index * 1.25
      );
    });
  };

  return (
    <div className="workspace-stack">
      <section className="panel workspace-heading">
        <div>
          <p className="eyebrow">Progression laboratory</p>
          <h1>Harmony is movement, not a chord list.</h1>
          <p>
            Each sequence chooses connected guitar voicings and shows which voices
            stay, rise, or fall.
          </p>
        </div>
        <label>
          Progression
          <select
            value={progressionId}
            onChange={(event) => setProgressionId(event.target.value)}
          >
            {PROGRESSIONS.map((progression) => (
              <option value={progression.id} key={progression.id}>
                {progression.name}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="panel progression-summary">
        <div>
          <p className="eyebrow">{actualFormula}</p>
          <h2>{selected.name}</h2>
          <p>{selected.description}</p>
        </div>
        <div className="metric-pair">
          <div>
            <strong>{analysis.totalMovement}</strong>
            <span>semitones moved</span>
          </div>
          <button className="primary-button" onClick={playSequence}>
            Play connected sequence
          </button>
        </div>
      </section>
      <section className="progression-path">
        {analysis.steps.map((step, index) => (
          <article className="panel progression-step" key={`${step.chord.id}-${index}`}>
            <div className="step-heading">
              <span>{index + 1}</span>
              <div>
                <strong>{step.chord.romanNumeral}</strong>
                <small>{step.chord.symbol} · {step.chord.function}</small>
              </div>
            </div>
            <div className="mini-shape">
              {step.voicing?.positions.map((position) => (
                <span key={`${position.string}:${position.fret}`}>
                  <small>S{position.string + 1}</small>
                  <strong>{position.fret}</strong>
                </span>
              ))}
            </div>
            {index > 0 && (
              <div className="movement-row">
                {analysis.movements[index - 1]?.map((movement, voice) => (
                  <span className={`movement-${movement.direction}`} key={voice}>
                    {movement.direction === "held"
                      ? "hold"
                      : `${movement.direction} ${Math.abs(movement.semitones)}`}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
      {state.depth === "advanced" && (
        <section className="panel analysis-note">
          <p className="eyebrow">Advanced lens</p>
          <h2>Optimization is a musical choice</h2>
          <p>
            This path minimizes total pitch movement among nearby playable shapes.
            Register, melody, bass direction, style, and desired tension may justify
            a less economical alternative.
          </p>
        </section>
      )}
    </div>
  );
}
