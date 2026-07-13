import { MODES, ROOTS } from "../core/music/theory";
import type { ModeId } from "../core/music/types";
import { HELP } from "../content/catalog";
import { HelpButton } from "./HelpButton";
import type { FeatureProps } from "../features/types";

export function ContextBar({ state, dispatch }: FeatureProps) {
  return (
    <header className="context-bar">
      <div className="context-statement">
        <span className="context-dot" />
        <div>
          <small>Everything is relative to</small>
          <strong>{state.context.tonicName} {MODES[state.context.mode].name}</strong>
        </div>
        <HelpButton {...HELP.tonalCentre} />
      </div>
      <div className="context-controls">
        <label>
          Tonal centre
          <select
            value={state.context.tonicName}
            onChange={(event) => dispatch({
              type: "setContext",
              tonicName: event.target.value,
              mode: state.context.mode
            })}
          >
            {ROOTS.map(([name]) => <option value={name} key={name}>{name}</option>)}
          </select>
        </label>
        <label>
          Tonal system
          <select
            value={state.context.mode}
            onChange={(event) => dispatch({
              type: "setContext",
              tonicName: state.context.tonicName,
              mode: event.target.value as ModeId
            })}
          >
            {(Object.keys(MODES) as ModeId[]).map((mode) => (
              <option value={mode} key={mode}>{MODES[mode].name}</option>
            ))}
          </select>
        </label>
        <label>
          Fretboard labels
          <select
            value={state.labelMode}
            onChange={(event) => dispatch({
              type: "setLabelMode",
              mode: event.target.value as "relationships" | "notes"
            })}
          >
            <option value="relationships">Relationships</option>
            <option value="notes">Note names</option>
          </select>
        </label>
      </div>
    </header>
  );
}
