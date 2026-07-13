import { fallbackPitchName } from "../domain/music";
import type {
  Chord,
  FretPosition,
  LabelMode,
  PitchClass,
  ScaleTone,
  Voicing
} from "../domain/types";
import {
  buildFretboard,
  coordinate,
  STANDARD_GUITAR
} from "../guitar/model";

interface FretboardProps {
  scale: readonly ScaleTone[];
  chord: Chord | null;
  voicing?: Voicing | null;
  selectedPitchClass: PitchClass;
  labelMode: LabelMode;
  showScale: boolean;
  showChord: boolean;
  showRoots: boolean;
  onSelect: (pitchClass: PitchClass) => void;
}

const FRET_MARKERS = new Set([3, 5, 7, 9, 12, 15]);

export function Fretboard({
  scale,
  chord,
  voicing,
  selectedPitchClass,
  labelMode,
  showScale,
  showChord,
  showRoots,
  onSelect
}: FretboardProps) {
  const scaleByPc = new Map(scale.map((tone) => [tone.pitch.pitchClass, tone]));
  const chordByPc = new Map(
    chord?.tones.map((tone) => [tone.pitch.pitchClass, tone]) ?? []
  );
  const voicingCoordinates = new Set(
    voicing?.positions.map((position) => coordinate(position)) ?? []
  );
  const positions = buildFretboard();

  const labelFor = (position: FretPosition): string => {
    const scaleTone = scaleByPc.get(position.pitchClass);
    const chordTone = chordByPc.get(position.pitchClass);
    if (labelMode === "interval" && chordTone) return chordTone.intervalLabel;
    if (labelMode === "degree" && scaleTone) return scaleTone.degreeLabel;
    return (
      scaleTone?.pitch.name ??
      chordTone?.pitch.name ??
      fallbackPitchName(position.pitchClass)
    );
  };

  return (
    <div className="fretboard-wrap">
      <div className="fretboard" role="grid" aria-label="Standard-tuned guitar fretboard">
        <div className="fretboard-row fretboard-header" role="row">
          <span />
          {Array.from({ length: STANDARD_GUITAR.fretCount + 1 }, (_, fret) => (
            <span className={FRET_MARKERS.has(fret) ? "has-marker" : ""} key={fret}>
              {fret}
            </span>
          ))}
        </div>
        {STANDARD_GUITAR.openMidi.map((_, string) => (
          <div className="fretboard-row string-row" role="row" key={string}>
            <span className="string-label">
              <strong>{string + 1}</strong>
              {STANDARD_GUITAR.stringLabels[string]}
            </span>
            {positions
              .filter((position) => position.string === string)
              .map((position) => {
                const scaleTone = scaleByPc.get(position.pitchClass);
                const chordTone = chordByPc.get(position.pitchClass);
                const isScale = showScale && Boolean(scaleTone);
                const isChord = showChord && Boolean(chordTone);
                const isVoicing = voicingCoordinates.has(coordinate(position));
                const isRoot =
                  showRoots && position.pitchClass === scale[0].pitch.pitchClass;
                const isSelected = position.pitchClass === selectedPitchClass;
                const visible = isScale || isChord || isVoicing || isRoot || isSelected;
                return (
                  <button
                    type="button"
                    role="gridcell"
                    className={[
                      "fret",
                      visible ? "is-visible" : "",
                      isScale ? "is-scale" : "",
                      isChord ? "is-chord" : "",
                      isVoicing ? "is-voicing" : "",
                      isRoot ? "is-tonic" : "",
                      isSelected ? "is-selected" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={position.fret}
                    onClick={() => onSelect(position.pitchClass)}
                    aria-label={`String ${string + 1}, fret ${position.fret}, ${labelFor(position)}`}
                  >
                    {visible && <span>{labelFor(position)}</span>}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
