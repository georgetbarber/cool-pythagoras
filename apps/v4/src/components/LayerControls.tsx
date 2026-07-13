import type { FeatureProps } from "../features/types";

const LAYERS = [
  ["tonic", "Tonic"],
  ["scale", "Scale"],
  ["chord", "Chord"],
  ["voicing", "Shape"],
  ["selection", "Selection"]
] as const;

export function LayerControls({ state, dispatch }: FeatureProps) {
  return (
    <div className="layer-controls" aria-label="Fretboard layers">
      <span>Layers</span>
      {LAYERS.map(([layer, label]) => (
        <button
          className={state.layers[layer] ? "is-active" : ""}
          aria-pressed={state.layers[layer]}
          onClick={() => dispatch({ type: "toggleLayer", layer })}
          key={layer}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

