import { fallbackName, INTERVALS, normalize } from "../domain/music";
import type { FretPosition } from "../domain/types";
import {
  intervalProfile,
  positionsAtInterval,
  stringPairRules,
  transposedRoots
} from "../instrument/intervals";
import { buildFretboard } from "../instrument/guitar";
import { Fretboard } from "./Fretboard";
import type { FeatureProps } from "../features/types";

export function IntervalLab({ state, dispatch, model }: FeatureProps) {
  const root =
    buildFretboard().find(
      (position) =>
        position.string === state.intervalRoot?.string &&
        position.fret === state.intervalRoot?.fret
    ) ??
    buildFretboard().find(
      (position) => position.pitchClass === state.context.tonic.pitchClass && position.string === 5
    )!;
  const profile = intervalProfile(state.selectedInterval);
  const destinations = positionsAtInterval(root, state.selectedInterval);
  const pairRules = stringPairRules(state.selectedInterval);
  const transpositions = transposedRoots(state.context.tonic.pitchClass, state.selectedInterval);

  const chooseRoot = (position: FretPosition) => {
    dispatch({ type: "setIntervalRoot", ...position });
  };

  return (
    <div className="interval-lab">
      <section className="panel interval-control-panel">
        <div>
          <div className="panel-kicker">Interval focus</div>
          <h2>{profile.label} · {profile.name}</h2>
          <p>{profile.colour}. It {profile.tendency}.</p>
        </div>
        <div className="interval-picker">
          {INTERVALS.map((interval) => (
            <button
              className={state.selectedInterval === interval.semitones ? "is-active" : ""}
              onClick={() => dispatch({ type: "setSelectedInterval", semitones: interval.semitones })}
              key={interval.semitones}
            >
              <strong>{interval.label}</strong>
              <small>{interval.name}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel interval-fretboard-panel">
        <div className="panel-heading">
          <div>
            <div className="panel-kicker">Interval geometry</div>
            <h2>Root {fallbackName(root.pitchClass)} at string {root.string + 1}, fret {root.fret}</h2>
            <p>
              Every marker is labelled relative to this physical root. Select a new
              root anywhere; gold markers show every {profile.name}.
            </p>
          </div>
          <div className="interval-count">
            <strong>{destinations.length}</strong>
            <span>visible destinations</span>
          </div>
        </div>
        <Fretboard
          scale={model.scale}
          chord={model.activeChord}
          voicing={null}
          selectedPitchClass={root.pitchClass}
          selectedPosition={{ string: root.string, fret: root.fret }}
          labelMode="degree"
          layers={{ scale: false, chord: false, tonic: false, voicing: false, selection: false }}
          relationshipRoot={root.pitchClass}
          showChromaticIntervals
          highlightInterval={state.selectedInterval}
          onPosition={chooseRoot}
        />
      </section>

      <div className="interval-analysis-grid">
        <section className="panel string-rules">
          <div className="panel-kicker">Across adjacent strings</div>
          <h2>The same sound changes shape.</h2>
          <div>
            {pairRules.map((rule, index) => (
              <article className={rule.crossesTuningBoundary ? "is-boundary" : ""} key={`${rule.pair}-${index}`}>
                <strong>{rule.pair}</strong>
                <span>{rule.movement}</span>
                <small>{rule.crossesTuningBoundary ? "G–B tuning shift: move one extra fret" : "perfect-fourth string spacing"}</small>
              </article>
            ))}
          </div>
        </section>
        <section className="panel transposition-table">
          <div className="panel-kicker">Same relationship, every key</div>
          <h2>{profile.label} never changes.</h2>
          <div>
            {transpositions.map((item) => (
              <span key={item.root}>
                <strong>{fallbackName(item.root, state.context.tonic.accidental < 0)}</strong>
                <i>→</i>
                <b>{fallbackName(item.target, state.context.tonic.accidental < 0)}</b>
              </span>
            ))}
          </div>
        </section>
        <section className="panel interval-connections">
          <div className="panel-kicker">Relationship family</div>
          <h2>Intervals combine and invert.</h2>
          <div>
            <p><span>Inversion</span><strong>{INTERVALS[normalize(12 - state.selectedInterval)].label}</strong></p>
            <p><span>Octave equivalent</span><strong>{profile.label} + 8ve</strong></p>
            <p><span>Consonance</span><strong>{profile.consonance}</strong></p>
            <p><span>Two stacked</span><strong>{INTERVALS[normalize(state.selectedInterval * 2)].label}</strong></p>
          </div>
        </section>
      </div>
    </div>
  );
}

