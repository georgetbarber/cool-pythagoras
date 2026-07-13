import { fallbackName, intervalLabel, normalize } from "../domain/music";
import type {
  Chord,
  FretPosition,
  LabelMode,
  PitchClass,
  ScaleTone,
  Voicing
} from "../domain/types";
import { buildFretboard, coordinate, GUITAR } from "../instrument/guitar";
import type { LayerState } from "../application/store";

interface FretboardProps {
  scale: readonly ScaleTone[];
  chord: Chord;
  voicing: Voicing | null;
  selectedPitchClass: PitchClass;
  selectedPosition: { string: number; fret: number } | null;
  labelMode: LabelMode;
  layers: LayerState;
  strings?: readonly number[];
  fretStart?: number;
  fretEnd?: number;
  focused?: boolean;
  relationshipRoot?: PitchClass;
  showChromaticIntervals?: boolean;
  highlightInterval?: number;
  onPosition: (position: FretPosition) => void;
}

const MARKERS = new Set([3, 5, 7, 9, 12, 15]);

export interface FretboardLabel {
  primary: string;
  secondary: string;
  degreeRole: string | null;
  chordRole: string | null;
  intervalRole: string | null;
}

export function formatFretboardLabel({
  note,
  scaleDegree,
  chordInterval,
  labelMode,
  chordSymbol,
  tonicName,
  relationshipInterval,
  semitones
}: {
  note: string;
  scaleDegree: string | null;
  chordInterval: string | null;
  labelMode: LabelMode;
  chordSymbol: string;
  tonicName: string;
  relationshipInterval?: string;
  semitones?: number;
}): FretboardLabel {
  if (relationshipInterval !== undefined) {
    return {
      primary: `I${relationshipInterval}`,
      secondary: `${note} · ${semitones ?? 0} st from selected root`,
      degreeRole: null,
      chordRole: null,
      intervalRole: `I${relationshipInterval}`
    };
  }
  const degreeRole = scaleDegree ? `D${scaleDegree}` : null;
  const chordRole = chordInterval ? `C${chordInterval}` : null;
  if (labelMode === "degree") {
    return {
      primary: degreeRole ?? "Chr",
      secondary: degreeRole ? `degree of ${tonicName}` : `outside ${tonicName} scale`,
      degreeRole,
      chordRole: null,
      intervalRole: null
    };
  }
  if (labelMode === "chord") {
    return {
      primary: chordRole ?? "–",
      secondary: chordRole ? `tone of ${chordSymbol}` : `not in ${chordSymbol}`,
      degreeRole: null,
      chordRole,
      intervalRole: null
    };
  }
  if (labelMode === "note") {
    return {
      primary: note,
      secondary: "",
      degreeRole: null,
      chordRole: null,
      intervalRole: null
    };
  }
  return {
    primary: [degreeRole, chordRole].filter(Boolean).join(" · ") || note,
    secondary:
      degreeRole && chordRole
        ? `${note} · degree of ${tonicName} · tone of ${chordSymbol}`
        : degreeRole
          ? `${note} · degree of ${tonicName}`
          : chordRole
            ? `${note} · tone of ${chordSymbol}`
            : note,
    degreeRole,
    chordRole,
    intervalRole: null
  };
}

export function Fretboard({
  scale,
  chord,
  voicing,
  selectedPitchClass,
  selectedPosition,
  labelMode,
  layers,
  strings = [0, 1, 2, 3, 4, 5],
  fretStart = 0,
  fretEnd = GUITAR.fretCount,
  focused = false,
  relationshipRoot,
  showChromaticIntervals = false,
  highlightInterval,
  onPosition
}: FretboardProps) {
  const scaleMap = new Map(scale.map((tone) => [tone.pitch.pitchClass, tone]));
  const chordMap = new Map(chord.tones.map((tone) => [tone.pitch.pitchClass, tone]));
  const voicingSet = new Set(voicing?.positions.map(coordinate) ?? []);
  const frets = Array.from({ length: fretEnd - fretStart + 1 }, (_, index) => fretStart + index);
  const board = buildFretboard();

  const labels = (position: FretPosition) => {
    const scaleTone = scaleMap.get(position.pitchClass);
    const chordTone = chordMap.get(position.pitchClass);
    const note = scaleTone?.pitch.name ?? chordTone?.pitch.name ?? fallbackName(position.pitchClass);
    if (relationshipRoot !== undefined) {
      const semitones = normalize(position.pitchClass - relationshipRoot);
      return formatFretboardLabel({
        note,
        scaleDegree: scaleTone?.degreeLabel ?? null,
        chordInterval: chordTone?.intervalLabel ?? null,
        labelMode,
        chordSymbol: chord.symbol,
        tonicName: scale[0].pitch.name,
        relationshipInterval: intervalLabel(semitones),
        semitones
      });
    }
    return formatFretboardLabel({
      note,
      scaleDegree: scaleTone?.degreeLabel ?? null,
      chordInterval: chordTone?.intervalLabel ?? null,
      labelMode,
      chordSymbol: chord.symbol,
      tonicName: scale[0].pitch.name
    });
  };

  return (
    <div className={`fretboard-scroll ${focused ? "is-focused" : ""}`}>
      {labelMode !== "note" && (
        <div className="fretboard-label-key" aria-label="Fretboard label key">
          {relationshipRoot !== undefined ? (
            <span><b>I</b> interval from selected physical root</span>
          ) : (
            <>
              {(labelMode === "degree" || labelMode === "combined") && <span><b>D</b> degree relative to {scale[0].pitch.name}</span>}
              {(labelMode === "chord" || labelMode === "combined") && <span><b>C</b> chord tone relative to {chord.root.name}</span>}
            </>
          )}
        </div>
      )}
      <div
        className="fretboard"
        role="grid"
        aria-label={focused ? `Focused ${chord.symbol} shape` : "Six-string guitar overview"}
        style={{ "--fret-count": frets.length } as React.CSSProperties}
      >
        <div className="fretboard-row fretboard-header" role="row">
          <span />
          {frets.map((fret) => (
            <span className={MARKERS.has(fret) ? "has-marker" : ""} key={fret}>{fret}</span>
          ))}
        </div>
        {strings.map((string) => (
          <div className="fretboard-row string-row" role="row" key={string}>
            <span className="string-label">
              <strong>{string + 1}</strong>
              {GUITAR.stringLabels[string]}
            </span>
            {board
              .filter((position) => position.string === string && position.fret >= fretStart && position.fret <= fretEnd)
              .map((position) => {
                const scaleTone = scaleMap.get(position.pitchClass);
                const chordTone = chordMap.get(position.pitchClass);
                const isVoicing = layers.voicing && voicingSet.has(coordinate(position));
                const isChord = layers.chord && Boolean(chordTone);
                const isScale = layers.scale && Boolean(scaleTone);
                const isTonic = layers.tonic && position.pitchClass === scale[0].pitch.pitchClass;
                const isPitch = layers.selection && position.pitchClass === selectedPitchClass;
                const isPosition = selectedPosition?.string === string && selectedPosition.fret === position.fret;
                const relativeInterval =
                  relationshipRoot === undefined
                    ? null
                    : normalize(position.pitchClass - relationshipRoot);
                const isIntervalRoot = relativeInterval === 0 && isPosition;
                const isIntervalTarget =
                  highlightInterval !== undefined &&
                  relativeInterval === normalize(highlightInterval) &&
                  !isPosition;
                const visible =
                  showChromaticIntervals ||
                  isScale ||
                  isChord ||
                  isVoicing ||
                  isTonic ||
                  isPitch;
                const label = labels(position);
                return (
                  <button
                    type="button"
                    role="gridcell"
                    aria-pressed={isPosition}
                    aria-label={`String ${string + 1}, fret ${position.fret}: ${label.primary} ${label.secondary}`}
                    className={[
                      "fret",
                      visible ? "is-visible" : "",
                      isScale ? "is-scale" : "",
                      isChord ? "is-chord" : "",
                      isVoicing ? "is-voicing" : "",
                      isTonic ? "is-tonic" : "",
                      isPitch ? "is-pitch" : "",
                      isPosition ? "is-position" : "",
                      isIntervalRoot ? "is-interval-root" : "",
                      isIntervalTarget ? "is-interval-target" : "",
                      focused && !isVoicing ? "is-context" : ""
                    ].filter(Boolean).join(" ")}
                    key={position.fret}
                    onClick={() => onPosition(position)}
                  >
                    {visible && (
                      <span className={`fret-label ${label.degreeRole && label.chordRole ? "has-two-roles" : ""}`}>
                        <strong>
                          {label.degreeRole && label.chordRole ? (
                            <>
                              <b className="degree-role">{label.degreeRole}</b>
                              <b className="chord-role">{label.chordRole}</b>
                            </>
                          ) : (
                            label.primary
                          )}
                        </strong>
                        {label.secondary && <small>{label.secondary}</small>}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
