import { MODE_IDS, MODES, ROOT_NAMES } from "../domain/music";
import type { Depth, LabelMode, ModeId } from "../domain/types";
import type { AppCommand, AppState } from "../application/store";

export function ContextBar({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<AppCommand> }) {
  return (
    <header className="context-bar">
      <div className="context-identity">
        <span className="context-pulse" />
        <div>
          <small>Everything is relative to</small>
          <strong>{state.context.tonic.name} · {MODES[state.context.mode].name}</strong>
        </div>
      </div>
      <div className="context-controls">
        <label>
          Tonal centre
          <select
            value={state.context.tonic.name}
            onChange={(event) => dispatch({ type: "setTonalContext", tonic: event.target.value, mode: state.context.mode })}
          >
            {ROOT_NAMES.map((root) => <option value={root} key={root}>{root}</option>)}
          </select>
        </label>
        <label>
          System
          <select
            value={state.context.mode}
            onChange={(event) => dispatch({ type: "setTonalContext", tonic: state.context.tonic.name, mode: event.target.value as ModeId })}
          >
            {MODE_IDS.map((mode) => <option value={mode} key={mode}>{MODES[mode].name}</option>)}
          </select>
        </label>
        <label>
          Learning depth
          <select value={state.depth} onChange={(event) => dispatch({ type: "setDepth", depth: event.target.value as Depth })}>
            <option value="essential">Essential</option>
            <option value="expanded">Expanded</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Labels
          <select value={state.labelMode} onChange={(event) => dispatch({ type: "setLabelMode", mode: event.target.value as LabelMode })}>
            <option value="combined">Degree + chord role</option>
            <option value="degree">Tonal degrees (D)</option>
            <option value="chord">Chord tones (C)</option>
            <option value="note">Note names</option>
          </select>
        </label>
      </div>
    </header>
  );
}
