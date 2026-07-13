import { MODES } from "../core/music/theory";
import type { ModeId } from "../core/music/types";
import type { FeatureProps } from "../features/types";

export function ContextNotice({
  state,
  dispatch,
  mode
}: Pick<FeatureProps, "state" | "dispatch"> & { mode: ModeId }) {
  if (mode === state.context.mode) return null;
  return (
    <aside className="context-notice">
      <div>
        <strong>This form uses {MODES[mode].name}.</strong>
        <span>
          The tonic stays {state.context.tonicName}, but this page temporarily uses a different collection from the dashboard.
        </span>
      </div>
      <button
        onClick={() => dispatch({
          type: "setContext",
          tonicName: state.context.tonicName,
          mode
        })}
      >
        Use {MODES[mode].name} everywhere
      </button>
    </aside>
  );
}
