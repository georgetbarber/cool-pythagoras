import { useEffect, useMemo, useState } from "react";
import { playChord, playClick, playMidi, playRelationship, stopAudio } from "../../audio/engine";
import {
  FREE_PLAY_MODE_INFO,
  availableFreePlayModes,
  buildFreePlayPrompt,
  buildFreePlaySequence,
  freePlayAbilityLevel,
  type FreePlayFocus,
  type FreePlayMode,
  type FreePlayPrompt
} from "../freePlay";
import { useV8Store } from "../store";

const MODE_ICONS: Record<FreePlayMode, string> = { groove: "◉", riff: "⌁", degree: "◎", chord: "◇" };
const SESSION_LENGTH = 8;

function hearPrompt(prompt: FreePlayPrompt) {
  stopAudio();
  if (prompt.preview.kind === "chords") {
    prompt.preview.pitches.forEach((pitches, index) => playChord(pitches, index * 1.25, 1.05));
  } else if (prompt.preview.kind === "notes") {
    const step = 60 / prompt.preview.bpm / 2;
    prompt.preview.pitches.forEach((pitch, index) => { if (pitch >= 0) playMidi(60 + pitch, index * step, step * .76, .16); });
  } else if (prompt.preview.kind === "degree") {
    playRelationship(prompt.preview.tonic, prompt.preview.target);
  } else {
    const step = 60 / prompt.preview.bpm;
    [...prompt.preview.accents, ...prompt.preview.accents].forEach((accented, index) => playClick(index * step, accented));
  }
}

function PromptRelationship({ prompt }: { prompt: FreePlayPrompt }) {
  return (
    <div className={`play-relationship play-relationship-${prompt.mode}`} aria-label={`${prompt.mode} relationship`}>
      {prompt.displayTokens.map((token, index) => <span className={token === "·" ? "is-space" : ""} key={`${token}-${index}`}><i>{index > 0 ? "→" : ""}</i><strong>{token}</strong></span>)}
    </div>
  );
}

export function Play() {
  const { state, dispatch, navigate } = useV8Store();
  const availableModes = useMemo(() => availableFreePlayModes(state), [state]);
  const level = freePlayAbilityLevel(state);
  const [phase, setPhase] = useState<"choose" | "playing" | "complete">("choose");
  const [focus, setFocus] = useState<FreePlayFocus>("mix");
  const [sessionNumber, setSessionNumber] = useState(0);
  const [prompts, setPrompts] = useState<FreePlayPrompt[]>([]);
  const [position, setPosition] = useState(0);
  const [followed, setFollowed] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [physicalOpen, setPhysicalOpen] = useState(false);
  const [variationOpen, setVariationOpen] = useState(false);
  useEffect(() => () => stopAudio(), []);

  const start = (nextFocus: FreePlayFocus) => {
    const nextSession = sessionNumber + 1;
    stopAudio();
    setFocus(nextFocus);
    setSessionNumber(nextSession);
    setPrompts(buildFreePlaySequence(state, nextFocus, nextSession, SESSION_LENGTH));
    setPosition(0); setFollowed(0); setSkipped(0);
    setHintOpen(false); setPhysicalOpen(false); setVariationOpen(false);
    setPhase("playing");
  };

  const resetHandholds = () => { setHintOpen(false); setPhysicalOpen(false); setVariationOpen(false); };
  const advance = (played: boolean) => {
    stopAudio();
    if (played) setFollowed((value) => value + 1); else setSkipped((value) => value + 1);
    if (position >= prompts.length - 1) { setPhase("complete"); return; }
    setPosition((value) => value + 1);
    resetHandholds();
  };

  const switchCurrentMode = (mode: FreePlayMode) => {
    stopAudio();
    setPrompts((current) => current.map((prompt, index) => index === position ? buildFreePlayPrompt(state, mode, sessionNumber * SESSION_LENGTH + position + 37) : prompt));
    resetHandholds();
  };

  if (phase === "choose") return (
    <div className="play-page page-stack">
      <section className="play-hero">
        <div className="play-hero-copy">
          <span className="eyebrow">Free play · guided, never graded</span>
          <h1>Put the guitar in your hands.</h1>
          <p>One playable instruction at a time. No lesson to choose, no result to submit and no planning between prompts.</p>
          <div className="play-hero-actions"><button className="primary-action large" onClick={() => start("mix")}>Start a mixed flow</button><span>{SESSION_LENGTH} prompts · about 8 minutes · stop whenever you like</span></div>
        </div>
        <div className="play-orbit" aria-hidden="true"><span>hear</span><span>find</span><strong>play</strong><span>move</span><span>vary</span></div>
      </section>

      <section className="play-mode-section">
        <header><div><span className="eyebrow">Choose a flavour, or let the app mix them</span><h2>What feels inviting?</h2></div><span className="ability-badge">Prompts matched to ability step {level}</span></header>
        <div className="play-mode-grid">
          {(Object.keys(FREE_PLAY_MODE_INFO) as FreePlayMode[]).map((mode) => {
            const info = FREE_PLAY_MODE_INFO[mode];
            const ready = availableModes.includes(mode);
            return <article className={`play-mode-card mode-${mode} ${ready ? "is-ready" : "is-locked"}`} key={mode}><span className="mode-icon">{MODE_ICONS[mode]}</span><div><small>{ready ? "Ready now" : info.unlock}</small><h3>{info.label}</h3><p>{info.invitation}</p></div><button className={ready ? "secondary-action" : "text-action"} disabled={!ready} onClick={() => start(mode)}>{ready ? `Play ${info.label}` : "Build this relationship in Learn"}</button></article>;
          })}
        </div>
      </section>

      <section className="play-promise card">
        <div><span>01</span><strong>One action appears</strong><p>The key, tempo and difficulty come from your learning history.</p></div>
        <div><span>02</span><strong>Hear, play or reveal</strong><p>Use an audio guide or physical cue only when it helps.</p></div>
        <div><span>03</span><strong>Keep flowing</strong><p>Skip freely. These prompts create no score and never gate the Course map.</p></div>
      </section>
    </div>
  );

  if (phase === "complete") {
    const usedModes = [...new Set(prompts.slice(0, position + 1).map((prompt) => FREE_PLAY_MODE_INFO[prompt.mode].label))];
    return (
      <div className="play-page page-stack">
        <section className="play-complete">
          <span className="play-complete-mark">✦</span><span className="eyebrow">Flow complete · nothing was graded</span>
          <h1>You kept music moving.</h1>
          <p>You followed {followed} prompt{followed === 1 ? "" : "s"}{skipped ? ` and passed over ${skipped} that did not feel useful` : ""}. The useful evidence is the sound and physical knowledge you just experienced.</p>
          <div className="play-complete-modes">{usedModes.map((mode) => <span key={mode}>{mode}</span>)}</div>
          <div className="play-complete-actions"><button className="primary-action large" onClick={() => start("mix")}>Keep playing</button><button className="secondary-action" onClick={() => start(focus)}>Another {focus === "mix" ? "mixed" : FREE_PLAY_MODE_INFO[focus].label} set</button><button className="text-action" onClick={() => setPhase("choose")}>Choose a different flavour</button></div>
          <aside><div><strong>Did one fragment stick?</strong><span>Carry the spark into a sketch before explaining it.</span></div><button className="secondary-action" onClick={() => { dispatch({ type: "createSketch" }); navigate("create"); }}>Take an idea to Create</button></aside>
        </section>
      </div>
    );
  }

  const prompt = prompts[position];
  const tempo = prompt.preview.kind === "notes" || prompt.preview.kind === "groove" ? `${prompt.preview.bpm} BPM` : `${state.settings.tonicName} ${state.settings.mode}`;
  return (
    <div className="play-session">
      <header className="play-session-header">
        <button className="text-action" onClick={() => { stopAudio(); setPhase("choose"); }}>← Leave the flow</button>
        <div className="play-progress" aria-label={`Prompt ${position + 1} of ${prompts.length}`}><span>{position + 1} of {prompts.length}</span><div>{prompts.map((_, index) => <i className={index < position ? "is-complete" : index === position ? "is-current" : ""} key={index} />)}</div></div>
        <span className="play-session-context">{state.settings.tonicName} {state.settings.mode} · {state.settings.instrument}</span>
      </header>
      <div className="play-session-layout">
        <aside className="play-mode-rail">
          <span className="eyebrow">Change the next action</span>
          {(Object.keys(FREE_PLAY_MODE_INFO) as FreePlayMode[]).map((mode) => <button className={prompt.mode === mode ? "is-active" : ""} disabled={!availableModes.includes(mode)} onClick={() => switchCurrentMode(mode)} key={mode}><i>{MODE_ICONS[mode]}</i><span><strong>{FREE_PLAY_MODE_INFO[mode].label}</strong><small>{availableModes.includes(mode) ? "Ready at your level" : FREE_PLAY_MODE_INFO[mode].unlock}</small></span></button>)}
        </aside>
        <main className={`play-stage mode-${prompt.mode}`}>
          <div className="play-stage-top"><span>{FREE_PLAY_MODE_INFO[prompt.mode].label}</span><span>{tempo}{prompt.stretch ? " · gentle stretch" : ""}</span></div>
          <PromptRelationship prompt={prompt} />
          <div className="play-instruction"><span className="eyebrow">Your one instruction</span><h1>{prompt.title}</h1><p>{prompt.instruction}</p></div>
          <div className="play-listen-for"><span>Listen for</span><strong>{prompt.relationship}</strong></div>
          <div className="play-handholds">
            {hintOpen && <aside><span>Reveal the names</span><p>{prompt.hint}</p></aside>}
            {physicalOpen && <aside><span>Connect it to the hand</span><p>{prompt.physicalCue}</p></aside>}
            {variationOpen && <aside className="is-variation"><span>Make it yours</span><p>{prompt.variation}</p></aside>}
          </div>
          <div className="play-sound-actions"><button className="secondary-action" onClick={() => hearPrompt(prompt)}>▶ Hear the guide</button><button className={physicalOpen ? "is-active" : ""} onClick={() => setPhysicalOpen((value) => !value)}>Hand cue</button><button className={hintOpen ? "is-active" : ""} onClick={() => setHintOpen((value) => !value)}>Reveal names</button><button className={variationOpen ? "is-active" : ""} onClick={() => setVariationOpen((value) => !value)}>Make it mine</button></div>
        </main>
      </div>
      <footer className="play-session-footer"><button className="text-action" onClick={() => advance(false)}>Not this one — skip</button><span>There is no right response to submit. Play, listen, then move when ready.</span><button className="primary-action large" onClick={() => advance(true)}>Played it — keep flowing →</button></footer>
    </div>
  );
}
