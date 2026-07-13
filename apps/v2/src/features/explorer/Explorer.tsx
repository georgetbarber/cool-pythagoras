import { useMemo, useState } from "react";
import { Fretboard } from "../../components/Fretboard";
import {
  CHORD_FORMULAS,
  MODE_LABELS,
  PROGRESSIONS,
  ROOT_OPTIONS
} from "../../domain/constants";
import {
  buildChromaticChords,
  buildDiatonicChords,
  createStandaloneChord,
  extendChord,
  getChordPitchClasses,
  getPentatonicPitchClasses,
  getScalePitchClasses,
  noteName,
  relativeKey
} from "../../domain/theory";
import type {
  CagedShape,
  ChordDefinition,
  ChordQuality,
  ModeId,
  PitchClass,
  ProgressionTemplate,
  VoicingMode
} from "../../domain/types";
import { getTuning, TUNINGS } from "../../fretboard/tunings";
import { solveVoicing } from "../../fretboard/voicing";
import { playChord } from "../../services/audio";
import type { DashboardState } from "../../state/dashboardState";

interface ExplorerProps {
  state: DashboardState;
  dispatch: React.Dispatch<
    | { type: "patch"; patch: Partial<DashboardState> }
    | { type: "setKey"; key: DashboardState["key"] }
    | {
        type: "selectChord";
        rootPc: PitchClass;
        rootName: string;
        quality: ChordQuality;
      }
  >;
}

const QUALITY_OPTIONS = Object.keys(CHORD_FORMULAS) as ChordQuality[];
const CAGED_SHAPES: CagedShape[] = ["off", "C", "A", "G", "E", "D"];
const VOICING_MODES: Array<{ id: VoicingMode; label: string }> = [
  { id: "compact", label: "Compact 4-note" },
  { id: "triad", label: "Triad / 3 strings" },
  { id: "drop2", label: "Drop-2 range" },
  { id: "full", label: "Full 6-string" }
];

function ChordTable({
  title,
  chords,
  active,
  onSelect
}: {
  title: string;
  chords: readonly ChordDefinition[];
  active: ChordDefinition;
  onSelect: (chord: ChordDefinition) => void;
}) {
  const [sort, setSort] = useState<keyof ChordDefinition>("degree");
  const sorted = [...chords].sort((a, b) =>
    String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true })
  );

  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Harmonic inventory</p>
          <h2>{title}</h2>
        </div>
        <label className="compact-field">
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value as keyof ChordDefinition)}>
            <option value="degree">Degree</option>
            <option value="rootName">Root</option>
            <option value="quality">Quality</option>
            <option value="function">Function</option>
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Degree</th>
              <th>Chord</th>
              <th>Function</th>
              <th>Intervals</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((chord) => {
              const selected =
                chord.rootPc === active.rootPc && chord.quality === active.quality;
              return (
                <tr className={selected ? "selected-row" : ""} key={chord.id}>
                  <td className="numeral">{chord.numeral}</td>
                  <td>
                    <strong>{chord.rootName}</strong> {chord.quality}
                  </td>
                  <td>
                    <span className={`function-tag function-${chord.function.toLowerCase()}`}>
                      {chord.function}
                    </span>
                  </td>
                  <td>{chord.intervalNames.join(" ")}</td>
                  <td>
                    <button className="text-button" onClick={() => onSelect(chord)}>
                      Map
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Explorer({ state, dispatch }: ExplorerProps) {
  const diatonic = useMemo(
    () => buildDiatonicChords(state.key, state.seventhChords),
    [state.key, state.seventhChords]
  );
  const chromatic = useMemo(() => buildChromaticChords(state.key), [state.key]);
  const extended = useMemo(
    () => buildDiatonicChords(state.key, true).map(extendChord),
    [state.key]
  );
  const activeChord = useMemo(() => {
    const all = [...diatonic, ...chromatic, ...extended];
    return (
      all.find(
        (chord) =>
          chord.rootPc === state.activeRootPc &&
          chord.quality === state.activeQuality
      ) ??
      createStandaloneChord(
        state.activeRootPc,
        state.activeRootName,
        state.activeQuality
      )
    );
  }, [
    chromatic,
    diatonic,
    extended,
    state.activeQuality,
    state.activeRootName,
    state.activeRootPc
  ]);
  const tuning = getTuning(state.tuningId);
  const voicing = useMemo(
    () =>
      solveVoicing(activeChord, tuning, {
        mode: state.voicingMode,
        cagedShape: state.cagedShape
      }),
    [activeChord, tuning, state.voicingMode, state.cagedShape]
  );
  const chordPitchClasses = getChordPitchClasses(
    activeChord.rootPc,
    activeChord.quality
  );
  const scalePitchClasses = state.showScale
    ? state.pentatonicOnly
      ? getPentatonicPitchClasses(state.key)
      : getScalePitchClasses(state.key)
    : [];
  const intervalLabels = new Map(
    chordPitchClasses.map((pitchClass, index) => [
      pitchClass,
      activeChord.intervalNames[index]
    ])
  );
  const progressionOptions = PROGRESSIONS.filter((progression) =>
    progression.modes.includes(state.key.mode)
  );

  const selectChord = (chord: ChordDefinition) =>
    dispatch({
      type: "selectChord",
      rootPc: chord.rootPc,
      rootName: chord.rootName,
      quality: chord.quality
    });

  const progressionChord = (
    progression: ProgressionTemplate,
    degree: number,
    stepIndex: number
  ): ChordDefinition => {
    const baseChord = diatonic[degree];
    const qualityOverride = progression.qualityOverrides?.[stepIndex];
    if (qualityOverride) {
      const formula = CHORD_FORMULAS[qualityOverride];
      const numeral =
        progression.formula.split(" - ")[stepIndex] ?? baseChord.numeral;
      return {
        ...baseChord,
        id: `${baseChord.id}-${progression.id}-${stepIndex}`,
        numeral,
        quality: qualityOverride,
        intervals: formula.intervals,
        intervalNames: formula.names,
        rationale: `${progression.name} uses ${baseChord.rootName} ${qualityOverride} at this step.`
      };
    }

    if (
      !progression.harmonicDominant ||
      state.key.mode !== "minor" ||
      degree !== 4
    ) {
      return baseChord;
    }

    const quality: ChordQuality = state.seventhChords
      ? "Dominant 7"
      : "Major";
    const formula = CHORD_FORMULAS[quality];
    return {
      ...baseChord,
      id: `${baseChord.id}-harmonic-dominant`,
      numeral: state.seventhChords ? "V7" : "V",
      quality,
      intervals: formula.intervals,
      intervalNames: formula.names,
      rationale:
        "The raised seventh creates a major dominant with stronger pull back to the minor tonic."
    };
  };

  return (
    <div className="explorer-layout">
      <aside className="panel control-panel">
        <div>
          <p className="eyebrow">Current environment</p>
          <h2>Explorer controls</h2>
        </div>

        <div className="control-section">
          <h3>Key system</h3>
          <label>
            Tonic
            <select
              value={state.key.tonic}
              onChange={(event) => {
                const option = ROOT_OPTIONS.find(
                  (root) => root.label === event.target.value
                )!;
                dispatch({
                  type: "setKey",
                  key: { ...state.key, tonic: option.label, tonicPc: option.pc }
                });
              }}
            >
              {ROOT_OPTIONS.map((root) => (
                <option key={root.label}>{root.label}</option>
              ))}
            </select>
          </label>
          <label>
            Mode
            <select
              value={state.key.mode}
              onChange={(event) =>
                dispatch({
                  type: "setKey",
                  key: { ...state.key, mode: event.target.value as ModeId }
                })
              }
            >
              {(Object.entries(MODE_LABELS) as Array<[ModeId, string]>).map(
                ([id, label]) => (
                  <option value={id} key={id}>
                    {label}
                  </option>
                )
              )}
            </select>
          </label>
          <button
            className="secondary-button"
            disabled={state.key.mode !== "major" && state.key.mode !== "minor"}
            onClick={() => dispatch({ type: "setKey", key: relativeKey(state.key) })}
          >
            Flip relative key
          </button>
        </div>

        <div className="control-section">
          <h3>Harmony</h3>
          <Toggle
            label="Seventh chords"
            checked={state.seventhChords}
            onChange={(seventhChords) =>
              dispatch({ type: "patch", patch: { seventhChords } })
            }
          />
          <Toggle
            label="Extended harmony"
            checked={state.showExtended}
            onChange={(showExtended) =>
              dispatch({ type: "patch", patch: { showExtended } })
            }
          />
          <Toggle
            label="Chromatic options"
            checked={state.showChromatic}
            onChange={(showChromatic) =>
              dispatch({ type: "patch", patch: { showChromatic } })
            }
          />
        </div>

        <div className="control-section">
          <h3>Fretboard</h3>
          <label>
            Tuning
            <select
              value={state.tuningId}
              onChange={(event) =>
                dispatch({
                  type: "patch",
                  patch: { tuningId: event.target.value }
                })
              }
            >
              {TUNINGS.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Voicing
            <select
              value={state.voicingMode}
              onChange={(event) =>
                dispatch({
                  type: "patch",
                  patch: { voicingMode: event.target.value as VoicingMode }
                })
              }
            >
              {VOICING_MODES.map((mode) => (
                <option value={mode.id} key={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            CAGED position
            <select
              value={state.cagedShape}
              onChange={(event) =>
                dispatch({
                  type: "patch",
                  patch: { cagedShape: event.target.value as CagedShape }
                })
              }
            >
              {CAGED_SHAPES.map((shape) => (
                <option value={shape} key={shape}>
                  {shape === "off" ? "Automatic" : `${shape} position`}
                </option>
              ))}
            </select>
          </label>
          <Toggle
            label="Scale overlay"
            checked={state.showScale}
            onChange={(showScale) =>
              dispatch({ type: "patch", patch: { showScale } })
            }
          />
          <Toggle
            label="Pentatonic only"
            checked={state.pentatonicOnly}
            disabled={!state.showScale}
            onChange={(pentatonicOnly) =>
              dispatch({ type: "patch", patch: { pentatonicOnly } })
            }
          />
        </div>
      </aside>

      <div className="explorer-main">
        <section className="panel hero-panel">
          <div>
            <p className="eyebrow">Active voicing</p>
            <h1>
              {activeChord.rootName} {activeChord.quality}
            </h1>
            <p>{activeChord.rationale}</p>
          </div>
          <div className="hero-actions">
            <label className="compact-field">
              Manual root
              <select
                value={state.activeRootPc}
                onChange={(event) => {
                  const rootPc = Number(event.target.value) as PitchClass;
                  dispatch({
                    type: "selectChord",
                    rootPc,
                    rootName: noteName(rootPc),
                    quality: state.activeQuality
                  });
                }}
              >
                {Array.from({ length: 12 }, (_, value) => (
                  <option value={value} key={value}>
                    {noteName(value)}
                  </option>
                ))}
              </select>
            </label>
            <label className="compact-field">
              Quality
              <select
                value={state.activeQuality}
                onChange={(event) =>
                  dispatch({
                    type: "selectChord",
                    rootPc: state.activeRootPc,
                    rootName: state.activeRootName,
                    quality: event.target.value as ChordQuality
                  })
                }
              >
                {QUALITY_OPTIONS.map((quality) => (
                  <option key={quality}>{quality}</option>
                ))}
              </select>
            </label>
            <button
              className="primary-button"
              disabled={!voicing}
              onClick={() => voicing && playChord(voicing.positions.map((position) => position.midi))}
            >
              Play voicing
            </button>
          </div>
        </section>

        <section className="panel fretboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Exact geometry</p>
              <h2>The Matrix</h2>
            </div>
            <span className="status-pill">
              {voicing
                ? `${voicing.positions.length} strings / ${voicing.fretSpan} fret span`
                : "No playable result"}
            </span>
          </div>
          <Fretboard
            tuning={tuning}
            activePositions={voicing?.positions}
            activePitchClasses={chordPitchClasses}
            rootPc={activeChord.rootPc}
            scalePitchClasses={scalePitchClasses}
            intervalLabels={intervalLabels}
          />
          <div className="interval-strip">
            {activeChord.intervalNames.map((interval, index) => {
              const pitchClass = chordPitchClasses[index];
              const omitted = voicing?.omittedPitchClasses.includes(pitchClass);
              return (
                <div className={omitted ? "interval-card is-omitted" : "interval-card"} key={`${interval}-${index}`}>
                  <strong>{interval}</strong>
                  <span>{noteName(pitchClass, state.key.tonic.includes("b"))}</span>
                  {omitted && <small>omitted</small>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel progression-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Functional movement</p>
              <h2>Progressions for {MODE_LABELS[state.key.mode]}</h2>
            </div>
          </div>
          <div className="progression-grid">
            {progressionOptions.map((progression) => (
              <article className="progression-card" key={progression.id}>
                <div>
                  <h3>{progression.name}</h3>
                  <strong className="progression-formula">
                    {progression.formula}
                  </strong>
                  <p>{progression.description}</p>
                </div>
                <div className="progression-steps">
                  {progression.degrees.map((degree, index) => {
                    const chord = progressionChord(progression, degree, index);
                    const formulaStep =
                      progression.formula.split(" - ")[index] ?? chord.numeral;
                    return (
                      <button key={`${degree}-${index}`} onClick={() => selectChord(chord)}>
                        <strong>{formulaStep}</strong>
                        <span>{chord.rootName}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  className="secondary-button"
                  onClick={() => {
                    progression.degrees.forEach((degree, index) => {
                      const chord = progressionChord(progression, degree, index);
                      const result = solveVoicing(chord, tuning, {
                        mode: state.voicingMode,
                        cagedShape: state.cagedShape
                      });
                      if (result) {
                        playChord(
                          result.positions.map((position) => position.midi),
                          index * 1.15
                        );
                      }
                    });
                  }}
                >
                  Play sequence
                </button>
              </article>
            ))}
          </div>
        </section>

        <ChordTable
          title={`${state.key.tonic} ${MODE_LABELS[state.key.mode]} harmony`}
          chords={diatonic}
          active={activeChord}
          onSelect={selectChord}
        />
        {state.showExtended && (
          <ChordTable
            title="Extended colors"
            chords={extended}
            active={activeChord}
            onSelect={selectChord}
          />
        )}
        {state.showChromatic && (
          <ChordTable
            title="Borrowed and secondary harmony"
            chords={chromatic}
            active={activeChord}
            onSelect={selectChord}
          />
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  disabled = false,
  onChange
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={`toggle-control ${disabled ? "is-disabled" : ""}`}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
