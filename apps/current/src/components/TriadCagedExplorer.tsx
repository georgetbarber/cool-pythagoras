import { useMemo, useState } from "react";
import { playVoicing } from "../audio/engine";
import { cagedMajorPositions, triadShapes } from "../core/instrument/guitar";
import type { GuitarShape } from "../core/instrument/guitar";
import type { FeatureProps } from "../features/types";
import { Fretboard } from "./Fretboard";

export function TriadCagedExplorer({ state, model }: FeatureProps) {
  const [system, setSystem] = useState<"triads" | "caged">("triads");
  const [selected, setSelected] = useState(0);
  const triads = useMemo(() => triadShapes(model.activeChord), [model.activeChord]);
  const caged = useMemo(() => cagedMajorPositions(model.activeChord.root), [model.activeChord.root]);
  const options = system === "triads" ? triads : caged;
  const safeIndex = Math.min(selected, Math.max(0, options.length - 1));
  const option = options[safeIndex] ?? null;
  const shape: GuitarShape | null = option ? {
    id: system === "triads" ? (option as GuitarShape).id : `caged-${(option as (typeof caged)[number]).form}-${option.minFret}`,
    positions: option.positions,
    span: option.maxFret - option.minFret,
    rootInBass: option.positions.some((position) =>
      position.midi === Math.min(...option.positions.map((item) => item.midi)) &&
      position.pitchClass === model.activeChord.root
    ),
    bassPitchClass: [...option.positions].sort((a, b) => a.midi - b.midi)[0].pitchClass,
    bassIntervalLabel: system === "triads" ? (option as GuitarShape).bassIntervalLabel : "shape",
    inversionLabel: system === "triads"
      ? (option as GuitarShape).inversionLabel
      : `${(option as (typeof caged)[number]).form} form`,
    minFret: option.minFret,
    maxFret: option.maxFret,
    openStrings: option.positions.filter((position) => position.fret === 0).length,
    fretPattern: option.fretPattern
  } : null;

  return (
    <section className="panel position-system">
      <div className="panel-heading">
        <div>
          <div className="section-label">Position systems</div>
          <h2>{system === "triads" ? `${model.activeChord.symbol} triads and inversions` : `${model.activeChord.rootName} major CAGED map`}</h2>
          <p>
            {system === "triads"
              ? "Follow the active chord quality across three-string sets. Compare bass note, inversion, and hand movement."
              : "CAGED shows five overlapping major-chord forms around the same root. Use it as geography, not five unrelated shapes."}
          </p>
        </div>
        <div className="system-toggle">
          <button className={system === "triads" ? "is-active" : ""} onClick={() => {
            setSystem("triads");
            setSelected(0);
          }}>Triads</button>
          <button className={system === "caged" ? "is-active" : ""} onClick={() => {
            setSystem("caged");
            setSelected(0);
          }}>CAGED</button>
        </div>
      </div>
      {shape && (
        <Fretboard
          scale={model.scale}
          chord={system === "triads" ? model.activeChord : undefined}
          shape={shape}
          selectedPitch={model.activeChord.root}
          labelMode={state.labelMode}
          visible="all"
          fretStart={Math.max(0, shape.minFret - 1)}
          fretEnd={Math.min(15, Math.max(shape.maxFret + 1, shape.minFret + 4))}
        />
      )}
      <div className="position-options">
        {options.map((item, index) => (
          <button className={safeIndex === index ? "is-active" : ""} onClick={() => setSelected(index)} key={`${system}-${index}-${item.fretPattern}`}>
            <strong>
              {system === "triads"
                ? (item as GuitarShape).inversionLabel
                : `${(item as (typeof caged)[number]).form} form`}
            </strong>
            <span>{item.fretPattern}</span>
            <small>frets {item.minFret}-{item.maxFret}</small>
          </button>
        ))}
      </div>
      <button
        className="button secondary"
        disabled={!shape}
        onClick={() => shape && playVoicing(shape.positions.map((position) => position.midi))}
      >
        Hear this position
      </button>
    </section>
  );
}
