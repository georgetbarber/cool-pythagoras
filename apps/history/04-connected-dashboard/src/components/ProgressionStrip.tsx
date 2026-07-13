import { playChord, stopAudio } from "../audio/engine";
import { PROGRESSIONS } from "../content/progressions";
import type { FeatureProps } from "../features/types";

export function ProgressionStrip({ state, dispatch, model }: FeatureProps) {
  const play = () => {
    stopAudio();
    model.progressionAnalysis.steps.forEach((step, index) => {
      if (step.voicing) playChord(step.voicing.positions.map((position) => position.midi), index * 1.3);
    });
  };
  return (
    <section className="panel progression-strip">
      <div className="progression-intro">
        <div className="panel-kicker">Functional movement</div>
        <select value={state.progressionId} onChange={(event) => dispatch({ type: "setProgression", id: event.target.value })}>
          {PROGRESSIONS.map((progression) => <option value={progression.id} key={progression.id}>{progression.category} · {progression.name}</option>)}
        </select>
        <p>{model.progression.description}</p>
      </div>
      <div className="progression-steps">
        {model.progressionAnalysis.steps.map((step, index) => (
          <button
            className={state.progressionStep === index ? "is-active" : ""}
            onClick={() => {
              dispatch({ type: "selectProgressionStep", index, degree: step.chord.degree });
              dispatch({ type: "focusExternalChord", chord: step.chord });
            }}
            key={`${step.chord.id}-${index}`}
          >
            <span>{step.chord.romanNumeral}</span>
            <strong>{step.chord.symbol}</strong>
            <small>{step.chord.functionLabel}</small>
            {index > 0 && (
              <div className="movement-chips">
                {model.progressionAnalysis.movements[index - 1]?.map((movement, voice) => (
                  <i className={movement.direction} key={voice}>
                    {movement.direction === "held" ? "hold" : `${movement.direction === "up" ? "↑" : "↓"}${Math.abs(movement.semitones)}`}
                  </i>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="progression-play">
        <strong>{model.progressionAnalysis.totalMovement}</strong>
        <span>total semitones</span>
        <button className="button secondary" onClick={play}>Play sequence</button>
      </div>
    </section>
  );
}
