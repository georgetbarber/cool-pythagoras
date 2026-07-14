import { useState } from "react";
import { V8StoreProvider, useV8Store } from "../v8/store";
import { playMidi } from "../audio/engine";
import { CloudSyncProvider, useCloudSync } from "../v8/cloud";
import type { RouteId } from "../v8/types";
import { ActivityPlayer } from "../v8/components/ActivityPlayer";
import { SettingsPanel } from "../v8/components/SettingsPanel";
import { Today } from "../v8/features/Today";
import { Path } from "../v8/features/Path";
import { Practice } from "../v8/features/Practice";
import { Create } from "../v8/features/Create";
import { Explore } from "../v8/features/Explore";

const NAV: Array<{ id: RouteId; label: string; symbol: string; purpose: string }> = [
  { id: "today", label: "Today", symbol: "●", purpose: "One clear next action" },
  { id: "path", label: "Path", symbol: "↗", purpose: "Connected development" },
  { id: "practice", label: "Practice", symbol: "◎", purpose: "Strengthen a weak link" },
  { id: "create", label: "Create", symbol: "✦", purpose: "Turn choices into music" },
  { id: "explore", label: "Explore", symbol: "⌁", purpose: "Follow relationships" }
];

export function App() {
  return <V8StoreProvider><CloudSyncProvider><V8Application /></CloudSyncProvider></V8StoreProvider>;
}

function V8Application() {
  const { state, dispatch, navigate, hydrated } = useV8Store();
  const cloud = useCloudSync();
  const [settingsOpen, setSettingsOpen] = useState(false);
  if (!hydrated) return <div className="loading-screen"><span>GA</span><p>Loading your learning path…</p></div>;
  if (!state.settings.diagnosticComplete) return <Diagnostic />;
  return (
    <div className="v8-shell">
      <a className="skip-link" href="#main-content">Skip to learning content</a>
      <aside className="primary-sidebar">
        <button className="v8-brand" onClick={() => navigate("today")} aria-label="Guitar Academy, go to Today"><span>GA</span><div><strong>Guitar Academy</strong><small>Musical freedom · V8</small></div></button>
        <nav aria-label="Primary learning navigation">
          {NAV.map((item) => <button className={state.route === item.id ? "is-active" : ""} aria-current={state.route === item.id ? "page" : undefined} onClick={() => navigate(item.id)} key={item.id}><i>{item.symbol}</i><div><strong>{item.label}</strong><small>{item.purpose}</small></div></button>)}
        </nav>
        <div className="sidebar-context"><span>Current reference</span><strong>{state.settings.tonicName} {state.settings.mode}</strong><small>{state.settings.instrument} · {state.settings.dailyMinutes} min sessions</small></div>
        <button className="settings-button" onClick={() => setSettingsOpen(true)}><span>⚙</span><div><strong>Settings and sync</strong><small>{cloud.user ? cloud.status : "Private backup and devices"}</small></div></button>
      </aside>
      <main id="main-content" tabIndex={-1}>
        {state.route === "today" && <Today />}
        {state.route === "path" && <Path />}
        {state.route === "practice" && <Practice />}
        {state.route === "create" && <Create />}
        {state.route === "explore" && <Explore />}
      </main>
      <nav className="mobile-nav" aria-label="Mobile learning navigation">{NAV.map((item) => <button className={state.route === item.id ? "is-active" : ""} onClick={() => navigate(item.id)} key={item.id}><i>{item.symbol}</i><span>{item.label}</span></button>)}</nav>
      <button className="mobile-settings-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings and data">⚙</button>
      {state.activeActivityId && <div className="activity-overlay"><ActivityPlayer activityId={state.activeActivityId} onClose={() => dispatch({ type: "openActivity", activityId: "" })} /></div>}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

function Diagnostic() {
  const { state, dispatch } = useV8Store();
  const cloud = useCloudSync();
  const [step, setStep] = useState(0);
  const [baseline, setBaseline] = useState<"repair" | "some" | "secure">("repair");
  const [soundChecked, setSoundChecked] = useState(false);
  const testTone = () => { playMidi(60, 0, 0.5); playMidi(64, 0.35, 0.5); playMidi(67, 0.7, 0.7); setSoundChecked(true); };
  const panels = [
    <section key="welcome"><span className="eyebrow">A clean V8 beginning</span><h1>Build freedom from sound, time and relationships.</h1><p>This path will not make you memorise the guitar as disconnected facts. It will ask you to hear, predict, play, vary, create and transfer what you learn.</p><div className="diagnostic-promise"><span>48 connected units</span><span>25-minute sessions</span><span>Offline and synchronised</span></div><div className="diagnostic-soundcheck"><div><strong>First, a quick sound check</strong><span>{soundChecked ? "Heard three rising notes? Your audio is ready." : "This app teaches largely by ear. Tap to play a short test — make sure your volume is up."}</span></div><button className={soundChecked ? "secondary-action" : "primary-action"} onClick={testTone}>{soundChecked ? "Play again" : "Play a test tone"}</button></div>{cloud.configured && <div className="diagnostic-sync"><span>Already use Guitar Academy on another device?</span>{cloud.user ? <strong>{cloud.status === "synced" ? "Your learning history is connected." : cloud.message}</strong> : <button className="secondary-action" onClick={() => void cloud.signIn()}>Sign in with Google instead</button>}</div>}</section>,
    <section key="instrument"><span className="eyebrow">Your physical context</span><h1>Which guitar are you holding most often?</h1><p>The core path is shared. Technique branches change where electric and acoustic instruments genuinely differ.</p><div className="diagnostic-choices"><button className={state.settings.instrument === "electric" ? "is-active" : ""} onClick={() => dispatch({ type: "updateSettings", settings: { instrument: "electric" } })}><strong>Electric</strong><span>Muting, pick control, bends and gain-aware touch</span></button><button className={state.settings.instrument === "acoustic" ? "is-active" : ""} onClick={() => dispatch({ type: "updateSettings", settings: { instrument: "acoustic" } })}><strong>Acoustic</strong><span>Balance, projection, strumming and fingerstyle touch</span></button></div></section>,
    <section key="baseline"><span className="eyebrow">Where would you like to start?</span><h1>Pick a starting point — you can move any time.</h1><p>This isn't a test and nothing is marked mastered without you doing it. New to guitar or unsure? Choose the first option — it starts at the very beginning. You can always open a later unit from Path.</p><div className="diagnostic-choices three">{[["repair", "Start from the beginning", "New, returning, or unsure. Begin with one clean note, timing and the basic fretboard — nothing assumed."], ["some", "Skip the basics", "Confident with clean notes and steady time. Start at pulse and subdivision."], ["secure", "Jump ahead", "Solid foundations already. Start at fretboard relationships, melody and harmony."]].map(([id, title, text]) => <button className={baseline === id ? "is-active" : ""} onClick={() => setBaseline(id as typeof baseline)} key={id}><strong>{title}</strong><span>{text}</span></button>)}</div></section>
  ];
  return <main className="diagnostic"><div className="diagnostic-mark">GA <span>Guitar Academy V8</span></div><div className="diagnostic-card">{panels[step]}<footer><div>{panels.map((_, index) => <i className={index <= step ? "is-active" : ""} key={index} />)}</div>{step > 0 && <button className="text-action" onClick={() => setStep(step - 1)}>Back</button>}<button className="primary-action" onClick={() => step < panels.length - 1 ? setStep(step + 1) : dispatch({ type: "updateSettings", settings: { diagnosticComplete: true, startingBaseline: baseline } })}>{step < panels.length - 1 ? "Continue" : "Start your path"}</button></footer></div></main>;
}
