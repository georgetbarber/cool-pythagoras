import { Fretboard } from "../components/Fretboard";
import { FocusedShape } from "../components/FocusedShape";
import { HarmonyRail } from "../components/HarmonyRail";
import { Inspector } from "../components/Inspector";
import { LayerControls } from "../components/LayerControls";
import { ProgressionStrip } from "../components/ProgressionStrip";
import {
  ChordNetworkPanel,
  IntervalMatrixPanel,
  ProgressionLibraryPanel,
  ScaleFormulaPanel
} from "../components/DashboardAnalysis";
import { playChord, playResolution } from "../audio/engine";
import type { FeatureProps } from "./types";

export function Dashboard(props: FeatureProps) {
  const { state, dispatch, model } = props;
  const tonic = model.chords[0];
  const tonicVoicing = model.progressionAnalysis.steps.at(-1)?.voicing;
  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div>
          <div className="eyebrow">Relationship dashboard</div>
          <h1>See the whole musical network.</h1>
          <p>
            The tonal centre stays fixed while notes, chords, shapes, sounds, and
            movements reveal different meanings around it.
          </p>
        </div>
        <div className="focus-summary">
          <span>Harmonic focus</span>
          <strong>{model.activeChord.romanNumeral} · {model.activeChord.symbol}</strong>
          <small>{model.activeChord.functionLabel}</small>
        </div>
      </section>

      <div className="dashboard-analysis-grid">
        <ScaleFormulaPanel {...props} />
        <IntervalMatrixPanel {...props} />
        <ChordNetworkPanel {...props} />
        <ProgressionLibraryPanel {...props} />
      </div>

      <div className="dashboard-main">
        <HarmonyRail {...props} />
        <section className="panel overview-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">Six-string overview</div>
              <h2>{model.activeChord.symbol} inside {state.context.tonic.name} {state.context.mode}</h2>
              <p>Click one physical position; matching pitches remain related across the neck.</p>
            </div>
            <LayerControls {...props} />
          </div>
          <Fretboard
            scale={model.scale}
            chord={model.activeChord}
            voicing={model.activeVoicing}
            selectedPitchClass={state.selectedPitchClass}
            selectedPosition={state.selectedPosition}
            labelMode={state.labelMode}
            layers={state.layers}
            onPosition={(position) => dispatch({ type: "focusPosition", ...position })}
          />
          <div className="degree-ribbon">
            {model.scale.map((tone) => (
              <button
                className={tone.pitch.pitchClass === state.selectedPitchClass ? "is-active" : ""}
                onClick={() => dispatch({ type: "focusPitch", pitchClass: tone.pitch.pitchClass })}
                key={tone.degree}
              >
                <strong>D{tone.degreeLabel}</strong>
                <span>{tone.pitch.name}</span>
                <small>{tone.intervalName}</small>
              </button>
            ))}
          </div>
        </section>
        <Inspector {...props} />
      </div>

      <ProgressionStrip {...props} />

      <div className="dashboard-lower">
        <FocusedShape {...props} />
        <section className="panel sound-panel">
          <div className="panel-kicker">Hear the relationship</div>
          <h2>Sound needs a reference.</h2>
          <p>Compare the focused harmony with its role and expected destination.</p>
          <div className="sound-actions">
            <button
              onClick={() => model.activeVoicing && playChord(model.activeVoicing.positions.map((position) => position.midi))}
              disabled={!model.activeVoicing}
            >
              <span>01</span><strong>Focused chord</strong><small>{model.activeChord.symbol}</small>
            </button>
            <button
              onClick={() => {
                if (!model.activeVoicing || !tonicVoicing) return;
                playResolution(
                  model.activeVoicing.positions.map((position) => position.midi),
                  tonicVoicing.positions.map((position) => position.midi)
                );
              }}
              disabled={!model.activeVoicing || !tonicVoicing}
            >
              <span>02</span><strong>Function in motion</strong><small>{model.activeChord.symbol} → {tonic.symbol}</small>
            </button>
          </div>
        </section>
        <section className="panel learning-panel">
          <div className="panel-kicker">Learning focus</div>
          <h2>{model.relationship.tendency}</h2>
          <p>
            You are viewing {model.relationship.pitch.name} as degree{" "}
            {model.relationship.scaleTone?.degreeLabel ?? "outside the scale"} and{" "}
            {model.relationship.chordTone?.intervalLabel ?? "a non-chord tone"} in {model.activeChord.symbol}.
          </p>
          <div className="mastery">
            <div><strong>{state.attempts.filter((attempt) => attempt.correct).length}</strong><span>correct</span></div>
            <div><strong>{state.attempts.length}</strong><span>attempts</span></div>
          </div>
          <button className="button secondary" onClick={() => dispatch({ type: "setWorkspace", workspace: "practice" })}>
            Practise this relationship
          </button>
        </section>
      </div>
    </div>
  );
}
