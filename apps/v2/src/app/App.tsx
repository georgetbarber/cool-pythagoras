import { useEffect, useMemo, useState } from "react";
import { ROOT_OPTIONS } from "../domain/constants";
import type { ModeId, ViewId } from "../domain/types";
import { Explorer } from "../features/explorer/Explorer";
import { Lessons } from "../features/lessons/Lessons";
import { Practice } from "../features/practice/Practice";
import { Systems } from "../features/systems/Systems";
import { SpeechService } from "../services/speech";
import { useDashboardState } from "../state/dashboardState";

const NAV_ITEMS: Array<{ id: ViewId; label: string; short: string }> = [
  { id: "explorer", label: "Explorer", short: "EX" },
  { id: "practice", label: "Practice Lab", short: "PR" },
  { id: "lessons", label: "Lesson Paths", short: "LE" },
  { id: "systems", label: "World Systems", short: "WS" }
];

export function App() {
  const { state, dispatch } = useDashboardState();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const speech = useMemo(
    () =>
      new SpeechService((command) => {
        if (command.type === "transpose" && command.payload) {
          const match = command.payload.match(
            /to\s+([a-g](?:\s*(?:sharp|flat)|[#b])?)\s*(major|minor|dorian|phrygian|lydian|mixolydian)?/
          );
          if (!match) return;
          const tonic = match[1]
            .replace(/\s*sharp/, "#")
            .replace(/\s*flat/, "b")
            .replace(/^./, (letter) => letter.toUpperCase());
          const root = ROOT_OPTIONS.find((option) => option.label === tonic);
          if (!root) return;
          dispatch({
            type: "setKey",
            key: {
              tonic: root.label,
              tonicPc: root.pc,
              mode: (match[2] as ModeId | undefined) ?? "major"
            }
          });
          setVoiceMessage(`Moved Explorer to ${root.label} ${match[2] ?? "major"}.`);
        }
      }),
    [dispatch]
  );

  useEffect(() => () => speech.stop(), [speech]);

  const toggleVoice = () => {
    if (!speech.supported) {
      setVoiceMessage("Speech recognition is not supported in this browser.");
      return;
    }
    if (voiceEnabled) speech.stop();
    else speech.start();
    setVoiceEnabled(!voiceEnabled);
    setVoiceMessage(
      voiceEnabled
        ? "Voice control stopped."
        : 'Voice control active. Try "Matrix transpose to E minor."'
    );
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">GA</span>
          <div>
            <strong>Guitar Academy</strong>
            <small>Dashboard v2</small>
          </div>
        </div>
        <nav aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button
              className={state.view === item.id ? "is-active" : ""}
              key={item.id}
              onClick={() => dispatch({ type: "patch", patch: { view: item.id } })}
            >
              <span>{item.short}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-actions">
          <button
            className="quick-routine"
            onClick={() =>
              dispatch({ type: "patch", patch: { view: "practice" } })
            }
          >
            Start quick routine
          </button>
          <button className="sidebar-utility" onClick={toggleVoice}>
            Voice: {voiceEnabled ? "on" : "off"}
          </button>
          <button
            className="sidebar-utility"
            onClick={() =>
              dispatch({
                type: "patch",
                patch: { theme: state.theme === "dark" ? "light" : "dark" }
              })
            }
          >
            Theme: {state.theme}
          </button>
          {voiceMessage && <small className="voice-message">{voiceMessage}</small>}
        </div>
      </aside>

      <main>
        {state.view === "explorer" && (
          <Explorer state={state} dispatch={dispatch} />
        )}
        {state.view === "practice" && <Practice state={state} />}
        {state.view === "lessons" && (
          <Lessons
            state={state}
            completeLesson={(lessonId) =>
              dispatch({ type: "completeLesson", lessonId })
            }
          />
        )}
        {state.view === "systems" && <Systems />}
      </main>
    </div>
  );
}
