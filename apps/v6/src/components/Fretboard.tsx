import { buildFretboard, coordinate, STANDARD_GUITAR } from "../core/instrument/guitar";
import type { FretPosition, GuitarShape } from "../core/instrument/guitar";
import { intervalLabel, noteName, normalize } from "../core/music/theory";
import type { Chord, PitchClass, ScaleTone } from "../core/music/types";

interface FretboardProps {
  scale: readonly ScaleTone[];
  chord?: Chord;
  shape?: GuitarShape | null;
  selectedPitch?: PitchClass;
  selectedPosition?: { string: number; fret: number } | null;
  relationshipRoot?: PitchClass;
  targetInterval?: number;
  labelMode?: "relationships" | "notes";
  visible?: "scale" | "chord" | "all";
  fretStart?: number;
  fretEnd?: number;
  onPosition?: (position: FretPosition) => void;
}

const MARKERS = new Set([3, 5, 7, 9, 12, 15]);

export function Fretboard({
  scale,
  chord,
  shape,
  selectedPitch,
  selectedPosition,
  relationshipRoot,
  targetInterval,
  labelMode = "relationships",
  visible = "scale",
  fretStart = 0,
  fretEnd = STANDARD_GUITAR.fretCount,
  onPosition
}: FretboardProps) {
  const scaleMap = new Map(scale.map((tone) => [tone.pitchClass, tone]));
  const chordMap = new Map(chord?.tones.map((tone) => [tone.pitchClass, tone]) ?? []);
  const shapeSet = new Set(shape?.positions.map(coordinate) ?? []);
  const frets = Array.from({ length: fretEnd - fretStart + 1 }, (_, index) => fretStart + index);

  return (
    <div className="fretboard-scroll">
      <div className="fretboard-key">
        {relationshipRoot !== undefined
          ? <span><b>I</b> interval from selected root</span>
          : <>
              <span><b>D</b> scale degree from tonic</span>
              {chord && <span><b>C</b> chord tone from chord root</span>}
            </>}
      </div>
      <div
        className="fretboard"
        role="grid"
        aria-label={`${STANDARD_GUITAR.name} fretboard`}
        style={{ "--fret-count": frets.length } as React.CSSProperties}
      >
        <div className="fretboard-row fretboard-header" role="row">
          <span />
          {frets.map((fret) => (
            <span className={MARKERS.has(fret) ? "has-marker" : ""} key={fret}>{fret}</span>
          ))}
        </div>
        {STANDARD_GUITAR.openMidi.map((_, string) => (
          <div className="fretboard-row string-row" role="row" key={string}>
            <span className="string-label"><b>{string + 1}</b>{STANDARD_GUITAR.stringLabels[string]}</span>
            {buildFretboard()
              .filter((position) =>
                position.string === string &&
                position.fret >= fretStart &&
                position.fret <= fretEnd
              )
              .map((position) => {
                const scaleTone = scaleMap.get(position.pitchClass);
                const chordTone = chordMap.get(position.pitchClass);
                const interval = relationshipRoot === undefined
                  ? null
                  : normalize(position.pitchClass - relationshipRoot);
                const isRoot = interval === 0 &&
                  selectedPosition?.string === string &&
                  selectedPosition?.fret === position.fret;
                const isTarget = targetInterval !== undefined && interval === normalize(targetInterval) && !isRoot;
                const inShape = shapeSet.has(coordinate(position));
                const isSelectedPosition = selectedPosition?.string === string && selectedPosition.fret === position.fret;
                const isSelectedPitch = selectedPitch === position.pitchClass;
                const shouldShow = visible === "all" ||
                  (visible === "chord" ? Boolean(chordTone) : Boolean(scaleTone)) ||
                  inShape || isSelectedPitch || isRoot || isTarget;
                const absoluteName = scaleTone?.name ?? chordTone?.name ?? noteName(position.pitchClass);
                const primary = relationshipRoot !== undefined
                  ? `I${intervalLabel(interval ?? 0)}`
                  : labelMode === "notes"
                    ? absoluteName
                    : [
                        scaleTone ? `D${scaleTone.degreeLabel}` : null,
                        chordTone ? `C${chordTone.intervalLabel}` : null
                      ].filter(Boolean).join(" · ") || absoluteName;
                return (
                  <button
                    type="button"
                    role="gridcell"
                    aria-pressed={isSelectedPosition}
                    aria-label={`String ${string + 1}, fret ${position.fret}, ${absoluteName}, ${primary}`}
                    className={[
                      "fret",
                      shouldShow ? "is-visible" : "",
                      scaleTone ? "is-scale" : "",
                      chordTone ? "is-chord" : "",
                      inShape ? "is-shape" : "",
                      position.pitchClass === scale[0]?.pitchClass ? "is-tonic" : "",
                      isSelectedPitch ? "is-selected-pitch" : "",
                      isSelectedPosition ? "is-selected-position" : "",
                      isRoot ? "is-interval-root" : "",
                      isTarget ? "is-interval-target" : ""
                    ].filter(Boolean).join(" ")}
                    key={position.fret}
                    onClick={() => onPosition?.(position)}
                  >
                    {shouldShow && <span>{primary}</span>}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
