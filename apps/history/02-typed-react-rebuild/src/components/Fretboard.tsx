import { noteName } from "../domain/theory";
import type {
  FretPosition,
  PitchClass,
  Tuning
} from "../domain/types";
import { FRET_COUNT, pitchClassFromMidi } from "../fretboard/model";

interface FretboardProps {
  tuning: Tuning;
  activePositions?: readonly FretPosition[];
  activePitchClasses?: readonly PitchClass[];
  rootPc?: PitchClass;
  scalePitchClasses?: readonly PitchClass[];
  intervalLabels?: ReadonlyMap<PitchClass, string>;
  selectedCoordinates?: ReadonlySet<string>;
  revealAllActivePitchClasses?: boolean;
  onCellClick?: (position: FretPosition) => void;
}

export function coordinate(position: Pick<FretPosition, "string" | "fret">): string {
  return `${position.string}:${position.fret}`;
}

export function Fretboard({
  tuning,
  activePositions = [],
  activePitchClasses = [],
  rootPc,
  scalePitchClasses = [],
  intervalLabels = new Map(),
  selectedCoordinates = new Set(),
  revealAllActivePitchClasses = false,
  onCellClick
}: FretboardProps) {
  const activeCoordinates = new Set(activePositions.map(coordinate));

  return (
    <div className="fretboard-scroll" aria-label={`${tuning.name} fretboard`}>
      <div className="fretboard">
        <div className="fret-row fret-numbers">
          <span />
          {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => (
            <span key={fret}>{fret}</span>
          ))}
        </div>
        {tuning.openMidi.map((openMidi, string) => (
          <div className="fret-row string-row" key={`${tuning.id}-${string}`}>
            <strong className="string-name">{tuning.labels[string]}</strong>
            {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
              const midi = openMidi + fret;
              const pitchClass = pitchClassFromMidi(midi);
              const position = { string, fret, midi, pitchClass };
              const isExactActive = activeCoordinates.has(coordinate(position));
              const isPitchActive =
                revealAllActivePitchClasses && activePitchClasses.includes(pitchClass);
              const isActive = isExactActive || isPitchActive;
              const isScale =
                !isActive && scalePitchClasses.includes(pitchClass);
              const isSelected = selectedCoordinates.has(coordinate(position));
              const label = isActive
                ? intervalLabels.get(pitchClass) ?? noteName(pitchClass)
                : isSelected
                  ? noteName(pitchClass)
                  : isScale
                    ? noteName(pitchClass)
                    : "";

              return (
                <button
                  type="button"
                  className={[
                    "fret-cell",
                    isActive ? "is-active" : "",
                    isActive && pitchClass === rootPc ? "is-root" : "",
                    isScale ? "is-scale" : "",
                    isSelected ? "is-selected" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={fret}
                  onClick={() => onCellClick?.(position)}
                  aria-label={`String ${6 - string}, fret ${fret}, ${noteName(pitchClass)}`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
