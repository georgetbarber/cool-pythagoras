import { MODES, ROOT_OPTIONS } from "../domain/music";
import type { AppAction, AppState } from "../state/store";
import type { Depth, ModeId } from "../domain/types";

interface ContextBarProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export function ContextBar({ state, dispatch }: ContextBarProps) {
  return (
    <header className="context-bar">
      <div className="context-title">
        <span className="pulse-dot" />
        <div>
          <small>Tonal centre</small>
          <strong>
            {state.context.tonic.name} {MODES[state.context.mode].name}
          </strong>
        </div>
      </div>
      <div className="context-controls">
        <label>
          Root
          <select
            value={state.context.tonic.name}
            onChange={(event) =>
              dispatch({
                type: "setContext",
                tonic: event.target.value,
                mode: state.context.mode
              })
            }
          >
            {ROOT_OPTIONS.map((root) => (
              <option value={root.name} key={root.name}>
                {root.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          System
          <select
            value={state.context.mode}
            onChange={(event) =>
              dispatch({
                type: "setContext",
                tonic: state.context.tonic.name,
                mode: event.target.value as ModeId
              })
            }
          >
            {Object.values(MODES).map((mode) => (
              <option value={mode.id} key={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Depth
          <select
            value={state.depth}
            onChange={(event) =>
              dispatch({
                type: "patch",
                patch: { depth: event.target.value as Depth }
              })
            }
          >
            <option value="essential">Essential</option>
            <option value="expanded">Expanded</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>
    </header>
  );
}
