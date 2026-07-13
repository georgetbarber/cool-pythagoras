import { useMemo, useState } from "react";
import { buildBorrowedChords, buildDiatonicChords, buildScale, buildSecondaryDominants, MODES } from "../domain/music";
import type { ModeId } from "../domain/types";
import { playChord, playRelationship, playResolution, stopAudio } from "../audio/engine";
import { Fretboard } from "../components/Fretboard";
import { FocusedShape } from "../components/FocusedShape";
import { Inspector } from "../components/Inspector";
import { ProgressionStrip } from "../components/ProgressionStrip";
import { generateVoicings } from "../instrument/guitar";
import { IntervalLab } from "../components/IntervalLab";
import { PROGRESSIONS } from "../content/progressions";
import type { FeatureProps } from "./types";

const CONCEPTS = [
  ["Hear home", "Recognise the tonic as a point of rest.", "essential"],
  ["Map roots and octaves", "Find one identity across strings and registers.", "essential"],
  ["See scale degrees", "Name pitches by relationship rather than letter alone.", "essential"],
  ["Build chord quality", "Hear how thirds and sevenths change a root.", "essential"],
  ["Follow function", "Distinguish home, departure, preparation, and tension.", "essential"],
  ["Connect inversions", "Treat one chord as a family of interval shapes.", "expanded"],
  ["Track tendency tones", "See and hear individual voices seeking resolution.", "expanded"],
  ["Tonicize a goal", "Understand a dominant relative to its temporary target.", "advanced"],
  ["Borrow colour", "Change collection while preserving the tonal centre.", "advanced"]
] as const;

export function LearnWorkspace(props: FeatureProps) {
  const allowed = props.state.depth === "essential" ? ["essential"] : props.state.depth === "expanded" ? ["essential", "expanded"] : ["essential", "expanded", "advanced"];
  return (
    <WorkspaceHero eyebrow="Guided pathway" title="Learn relationships in a useful order." text="Each concept links hearing, theory, physical geography, and movement instead of treating them as separate facts.">
      <div className="concept-grid">
        {CONCEPTS.filter((concept) => allowed.includes(concept[2])).map((concept, index) => (
          <button className="panel concept-card" onClick={() => props.dispatch({ type: "setWorkspace", workspace: index < 2 ? "explore" : index < 6 ? "fretboard" : "progressions" })} key={concept[0]}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><small>{concept[2]}</small><h3>{concept[0]}</h3><p>{concept[1]}</p></div>
          </button>
        ))}
      </div>
    </WorkspaceHero>
  );
}

export function ExploreWorkspace(props: FeatureProps) {
  const connectedChords = props.model.chords.filter((chord) =>
    chord.tones.some((tone) => tone.pitch.pitchClass === props.state.selectedPitchClass)
  );
  return (
    <WorkspaceHero eyebrow="Context explorer" title="One pitch, several meanings." text={MODES[props.state.context.mode].character}>
      <div className="relationship-map">
        <section className="panel relationship-map-canvas">
          <div className="relationship-centre">
            <span>{props.model.relationship.pitch.name}</span>
            <strong>{props.model.relationship.tonicIntervalLabel}</strong>
            <small>relative to {props.state.context.tonic.name}</small>
          </div>
          <div className="relationship-spokes">
            <button onClick={() => props.dispatch({ type: "setWorkspace", workspace: "fretboard" })}>
              <span>Fretboard</span><strong>{props.state.selectedPosition ? `S${props.state.selectedPosition.string + 1} · fret ${props.state.selectedPosition.fret}` : "all positions"}</strong>
            </button>
            <button onClick={() => props.dispatch({ type: "setWorkspace", workspace: "harmony" })}>
              <span>Active chord</span><strong>{props.model.relationship.chordTone ? `C${props.model.relationship.chordTone.intervalLabel}` : "non-chord"} in {props.model.activeChord.symbol}</strong>
            </button>
            <button onClick={() => playRelationship(props.state.context.tonic.pitchClass, props.state.selectedPitchClass)}>
              <span>Sound</span><strong>{props.model.relationship.tonicIntervalName}</strong>
            </button>
            <button onClick={() => props.dispatch({ type: "setWorkspace", workspace: "practice" })}>
              <span>Tendency</span><strong>{props.model.relationship.tendency}</strong>
            </button>
          </div>
        </section>
        <section className="panel connected-chords">
          <div className="panel-kicker">Appears inside</div>
          <h2>{connectedChords.length} diatonic chords</h2>
          {connectedChords.map((chord) => (
            <button onClick={() => props.dispatch({ type: "focusChord", degree: chord.degree })} key={chord.id}>
              <span>{chord.romanNumeral}</span><strong>{chord.symbol}</strong>
              <small>{chord.tones.find((tone) => tone.pitch.pitchClass === props.state.selectedPitchClass)?.intervalLabel} · {chord.functionLabel}</small>
            </button>
          ))}
        </section>
        <Inspector {...props} />
      </div>
    </WorkspaceHero>
  );
}

export function FretboardWorkspace(props: FeatureProps) {
  return (
    <WorkspaceHero eyebrow="Interval geometry laboratory" title="The sound stays constant while the shape moves." text="Choose a physical root, trace one interval across every string pair, then transpose the relationship without changing its meaning.">
      <IntervalLab {...props} />
      <FocusedShape {...props} />
    </WorkspaceHero>
  );
}

export function HarmonyWorkspace(props: FeatureProps) {
  return (
    <WorkspaceHero eyebrow="Harmony laboratory" title="Chords emerge from a tonal collection." text="Every symbol is connected to a degree, a function, a tone structure, and a playable realization.">
      <div className="harmony-cards">
        {props.model.chords.map((chord) => (
          <button className={`panel harmony-card ${chord.degree === props.model.activeChord.degree ? "is-active" : ""}`} onClick={() => props.dispatch({ type: "focusChord", degree: chord.degree })} key={chord.id}>
            <span>{chord.romanNumeral}</span><strong>{chord.symbol}</strong><small>{chord.functionLabel}</small>
            <div>{chord.tones.map((tone) => <i key={tone.intervalLabel}><b>C{tone.intervalLabel}</b>{tone.pitch.name}</i>)}</div>
            <p>{chord.explanation}</p>
          </button>
        ))}
      </div>
    </WorkspaceHero>
  );
}

export function ProgressionsWorkspace(props: FeatureProps) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(PROGRESSIONS.map((progression) => progression.category))];
  const visible = PROGRESSIONS.filter(
    (progression) =>
      (category === "All" || progression.category === category) &&
      `${progression.name} ${progression.formula} ${progression.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );
  return (
    <WorkspaceHero eyebrow="Progression library" title="Learn the forms that organise real music." text="Compare foundational cadences, blues forms, jazz turnarounds, modal vamps, minor loops, and chromatic routes through the same tonal and fretboard model.">
      <section className="panel progression-browser">
        <div className="progression-filters">
          <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="jazz, blues, cadence..." /></label>
          <div>{categories.map((item) => <button className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
        </div>
        <div className="progression-library-grid">
          {visible.map((progression) => (
            <button
              className={props.state.progressionId === progression.id ? "is-active" : ""}
              onClick={() => props.dispatch({ type: "setProgression", id: progression.id })}
              key={progression.id}
            >
              <span>{progression.category}</span>
              <h3>{progression.name}</h3>
              <strong>{progression.formula}</strong>
              <p>{progression.description}</p>
              <small>{progression.learningFocus}</small>
            </button>
          ))}
        </div>
      </section>
      <ProgressionStrip {...props} />
      <div className="movement-detail">
        {props.model.progressionAnalysis.steps.map((step, index) => (
          <article className="panel" key={`${step.chord.id}-${index}`}>
            <span>{step.chord.romanNumeral}</span><h3>{step.chord.symbol}</h3>
            <p>{step.chord.functionLabel}</p>
            {index > 0 && props.model.progressionAnalysis.movements[index - 1]?.map((movement, voice) => (
              <div className="voice-row" key={voice}>
                <strong>Voice {voice + 1}</strong>
                <span>S{movement.from.string + 1}/f{movement.from.fret}</span>
                <i>{movement.direction === "held" ? "held" : `${movement.direction} ${Math.abs(movement.semitones)}`}</i>
                <span>S{movement.to.string + 1}/f{movement.to.fret}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </WorkspaceHero>
  );
}

export function EarWorkspace(props: FeatureProps) {
  const [index, setIndex] = useState(4);
  const [revealed, setRevealed] = useState(false);
  const target = props.model.scale[index];
  return (
    <WorkspaceHero eyebrow="Contextual ear" title="Hear a relationship, not an isolated note." text="The tonic sounds before and after every target so the question retains a musical reference.">
      <section className="panel ear-practice">
        <div className="ear-nodes"><span>{props.state.context.tonic.name}</span><i /><span>{revealed ? target.degreeLabel : "?"}</span></div>
        <h2>{revealed ? `${target.pitch.name} is degree ${target.degreeLabel}` : "What is the target relative to home?"}</h2>
        <p>{revealed ? `${target.intervalName}; ${target.interval} semitones from the tonic.` : "Listen for stability, distance, colour, and likely direction."}</p>
        <div>
          <button className="button primary" onClick={() => playRelationship(props.state.context.tonic.pitchClass, target.pitch.pitchClass)}>Play prompt</button>
          <button className="button secondary" onClick={() => revealed ? (setIndex((index + 3) % 7), setRevealed(false)) : setRevealed(true)}>{revealed ? "Next" : "Reveal"}</button>
        </div>
      </section>
    </WorkspaceHero>
  );
}

export function PracticeWorkspace(props: FeatureProps) {
  const [targetIndex, setTargetIndex] = useState(1);
  const [feedback, setFeedback] = useState("Listen, then identify the scale degree.");
  const target = props.model.scale[targetIndex];
  const answer = (index: number) => {
    const correct = index === targetIndex;
    const answeredTarget = target;
    props.dispatch({
      type: "recordAttempt",
      attempt: {
        id: `${Date.now()}-${Math.random()}`,
        skill: "scale-degree-hearing",
        context: `${props.state.context.tonic.name}-${props.state.context.mode}-${answeredTarget.degreeLabel}`,
        correct,
        answeredAt: new Date().toISOString()
      }
    });
    if (correct) {
      setFeedback(`Correct: ${answeredTarget.pitch.name} is degree ${answeredTarget.degreeLabel} relative to ${props.state.context.tonic.name}.`);
      setTargetIndex((targetIndex + 2 + Math.floor(Math.random() * 4)) % 7);
    } else {
      setFeedback(`${props.model.scale[index].degreeLabel} would be ${props.model.scale[index].pitch.name}. Re-anchor to ${props.state.context.tonic.name}.`);
    }
  };
  const recent = props.state.attempts.filter((attempt) => attempt.skill === "scale-degree-hearing").slice(-10);
  const accuracy = recent.length ? Math.round(recent.filter((attempt) => attempt.correct).length / recent.length * 100) : 0;
  return (
    <WorkspaceHero eyebrow="Adaptive retrieval" title="Turn relationships into usable recall." text="Attempts persist with their tonal context, giving later sessions evidence to schedule weaker relationships.">
      <section className="panel ear-practice">
        <div className="practice-score"><strong>{accuracy}%</strong><span>recent accuracy</span><small>{recent.length} recorded attempts</small></div>
        <button className="listen-disc" onClick={() => playRelationship(props.state.context.tonic.pitchClass, target.pitch.pitchClass)}>▶<small>Hear prompt</small></button>
        <h2>Which scale degree did you hear?</h2>
        <div className="answer-grid">{props.model.scale.map((tone, index) => <button onClick={() => answer(index)} key={tone.degree}>{tone.degreeLabel}</button>)}</div>
        <p aria-live="polite" className="feedback">{feedback}</p>
      </section>
    </WorkspaceHero>
  );
}

export function AdvancedWorkspace(props: FeatureProps) {
  const modes: ModeId[] = ["major", "dorian", "phrygian", "lydian", "mixolydian", "minor", "locrian", "harmonic-minor"];
  const borrowed = buildBorrowedChords(props.state.context);
  const secondary = buildSecondaryDominants(props.state.context);
  const hear = (chord: ReturnType<typeof buildDiatonicChords>[number]) => {
    const voicing = generateVoicings(chord, "auto", { limit: 1 })[0];
    if (voicing) playChord(voicing.positions.map((position) => position.midi));
  };
  return (
    <WorkspaceHero eyebrow="Advanced relationships" title="Keep the centre. Change the context." text="Parallel comparison, borrowed colour, and temporary tonicization all retain an explicit reference.">
      <div className="parallel-grid">
        {modes.map((mode) => {
          const context = { ...props.state.context, mode };
          const scale = buildScale(context);
          return <article className="panel mode-card" key={mode}><small>parallel</small><h3>{MODES[mode].name}</h3><div>{scale.map((tone) => <span key={tone.degree}><b>D{tone.degreeLabel}</b>{tone.pitch.name}</span>)}</div></article>;
        })}
      </div>
      <ChromaticSection title="Borrowed colour" chords={borrowed} hear={hear} />
      <ChromaticSection title="Secondary dominants" chords={secondary} hear={hear} />
    </WorkspaceHero>
  );
}

function ChromaticSection({ title, chords, hear }: { title: string; chords: ReturnType<typeof buildDiatonicChords>; hear: (chord: ReturnType<typeof buildDiatonicChords>[number]) => void }) {
  return <section className="chromatic-section"><h2>{title}</h2><div>{chords.map((chord) => <button className="panel" onClick={() => hear(chord)} key={chord.id}><span>{chord.romanNumeral}</span><strong>{chord.symbol}</strong><small>{chord.functionLabel}</small><p>{chord.explanation}</p></button>)}</div></section>;
}

function WorkspaceHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children: React.ReactNode }) {
  return <div className="workspace-stack"><header className="workspace-hero"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></header>{children}</div>;
}
