import { useEffect, useMemo, useState } from "react";
import { coordinate, Fretboard } from "../../components/Fretboard";
import { CHORD_FORMULAS } from "../../domain/constants";
import {
  buildDiatonicChords,
  createStandaloneChord,
  getChordPitchClasses,
  noteName
} from "../../domain/theory";
import type {
  CagedShape,
  ChordDefinition,
  ChordQuality,
  FretPosition,
  PitchClass
} from "../../domain/types";
import { buildFretboard } from "../../fretboard/model";
import { getTuning } from "../../fretboard/tunings";
import { solveVoicing } from "../../fretboard/voicing";
import { playChord, playMidi } from "../../services/audio";
import {
  orderPracticeIds,
  recordPracticeResult
} from "../../services/practice";
import type { DashboardState } from "../../state/dashboardState";

type PracticeTab = "retrieval" | "find-note" | "construction";

export function Practice({ state }: { state: DashboardState }) {
  const [tab, setTab] = useState<PracticeTab>("retrieval");
  return (
    <div className="feature-page">
      <section className="panel feature-header">
        <div>
          <p className="eyebrow">Deliberate practice</p>
          <h1>Practice Lab</h1>
          <p>Short exercises use the same theory and fretboard engines as Explorer.</p>
        </div>
        <div className="segmented-control" aria-label="Practice mode">
          {(
            [
              ["retrieval", "Chord retrieval"],
              ["find-note", "Find the note"],
              ["construction", "Chord construction"]
            ] as Array<[PracticeTab, string]>
          ).map(([id, label]) => (
            <button
              className={tab === id ? "is-active" : ""}
              key={id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      {tab === "retrieval" && <RetrievalGame state={state} />}
      {tab === "find-note" && <FindNoteGame state={state} />}
      {tab === "construction" && <ConstructionGame state={state} />}
    </div>
  );
}

function RetrievalGame({ state }: { state: DashboardState }) {
  const chords = useMemo(() => buildDiatonicChords(state.key), [state.key]);
  const [queue, setQueue] = useState<ChordDefinition[]>([]);
  const [current, setCurrent] = useState<ChordDefinition | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [shape, setShape] = useState<CagedShape>("E");
  const tuning = getTuning(state.tuningId);
  const voicing = current
    ? solveVoicing(current, tuning, {
        mode: "triad",
        cagedShape: shape
      })
    : null;

  const next = (nextQueue = queue) => {
    const [first, ...rest] = nextQueue;
    setCurrent(first ?? null);
    setQueue(rest);
    setRevealed(false);
    const shapes: CagedShape[] = ["C", "A", "G", "E", "D"];
    setShape(shapes[Math.floor(Math.random() * shapes.length)]);
  };

  const start = () => {
    const orderedIds = orderPracticeIds(chords.map((chord) => chord.id));
    next(
      orderedIds
        .map((id) => chords.find((chord) => chord.id === id))
        .filter((chord): chord is ChordDefinition => chord !== undefined)
    );
  };

  const grade = (rating: "again" | "hard" | "easy") => {
    if (!current) return;
    recordPracticeResult(current.id, rating);
    const nextQueue =
      rating === "again"
        ? [...queue.slice(0, 1), current, ...queue.slice(1)]
        : rating === "hard"
          ? [...queue, current]
          : queue;
    next(nextQueue);
  };

  return (
    <section className="panel game-panel">
      <div className="game-copy">
        <p className="eyebrow">Forced retrieval</p>
        <h2>
          {current
            ? `Play ${current.numeral} in ${state.key.tonic} ${state.key.mode}`
            : "Ready for a seven-chord audit?"}
        </h2>
        <p>
          {current
            ? `Constraint: use the ${shape} CAGED region before revealing the answer.`
            : "Attempt each shape physically before asking the dashboard to reveal it."}
        </p>
        {!current && (
          <button className="primary-button" onClick={start}>
            Start session
          </button>
        )}
        {current && !revealed && (
          <button className="primary-button" onClick={() => setRevealed(true)}>
            Reveal voicing
          </button>
        )}
        {current && revealed && (
          <div className="grade-row">
            <button onClick={() => grade("again")}>Again</button>
            <button onClick={() => grade("hard")}>Hard</button>
            <button onClick={() => grade("easy")}>Easy</button>
          </div>
        )}
      </div>
      <Fretboard
        tuning={tuning}
        activePositions={revealed ? voicing?.positions : []}
        activePitchClasses={
          current ? getChordPitchClasses(current.rootPc, current.quality) : []
        }
        rootPc={current?.rootPc}
      />
      {revealed && voicing && (
        <button
          className="secondary-button"
          onClick={() => playChord(voicing.positions.map((position) => position.midi))}
        >
          Hear answer
        </button>
      )}
    </section>
  );
}

function FindNoteGame({ state }: { state: DashboardState }) {
  const tuning = getTuning(state.tuningId);
  const fretboard = useMemo(() => buildFretboard(tuning), [tuning]);
  const [target, setTarget] = useState<PitchClass>(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [active, setActive] = useState(false);
  const targetPositions = fretboard.filter(
    (position) => position.pitchClass === target
  );

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setTime((value) => {
        if (value <= 1) {
          setActive(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const newTarget = () => {
    setTarget(Math.floor(Math.random() * 12) as PitchClass);
    setFound(new Set());
  };

  const start = () => {
    setScore(0);
    setTime(30);
    setActive(true);
    newTarget();
  };

  const handleClick = (position: FretPosition) => {
    if (!active) return;
    if (position.pitchClass !== target) {
      setScore((value) => Math.max(0, value - 5));
      return;
    }
    const id = coordinate(position);
    if (found.has(id)) return;
    const nextFound = new Set(found).add(id);
    setFound(nextFound);
    setScore((value) => value + 10);
    playMidi(position.midi, 0, 0.7);
    if (nextFound.size === targetPositions.length) {
      setScore((value) => value + 25);
      setTime((value) => value + 3);
      newTarget();
    }
  };

  return (
    <section className="panel game-panel">
      <div className="game-scoreboard">
        <div>
          <span>Target</span>
          <strong>{active ? noteName(target) : "-"}</strong>
        </div>
        <div>
          <span>Found</span>
          <strong>
            {found.size}/{active ? targetPositions.length : 0}
          </strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span>Time</span>
          <strong>{time}s</strong>
        </div>
      </div>
      <button className="primary-button" onClick={start}>
        {active ? "Restart drill" : time === 0 ? "Play again" : "Start 30-second drill"}
      </button>
      <Fretboard
        tuning={tuning}
        selectedCoordinates={found}
        onCellClick={handleClick}
      />
    </section>
  );
}

function ConstructionGame({ state }: { state: DashboardState }) {
  const tuning = getTuning(state.tuningId);
  const qualities: ChordQuality[] = [
    "Major",
    "Minor",
    "Diminished",
    "Augmented",
    "Dominant 7",
    "Major 7",
    "Minor 7"
  ];
  const [target, setTarget] = useState<ChordDefinition | null>(null);
  const [selected, setSelected] = useState<Map<string, FretPosition>>(new Map());
  const [result, setResult] = useState<string>("");

  const start = () => {
    const rootPc = Math.floor(Math.random() * 12) as PitchClass;
    const quality = qualities[Math.floor(Math.random() * qualities.length)];
    setTarget(createStandaloneChord(rootPc, noteName(rootPc), quality));
    setSelected(new Map());
    setResult("");
  };

  const toggle = (position: FretPosition) => {
    if (!target || result) return;
    const id = coordinate(position);
    const next = new Map(selected);
    if (next.has(id)) next.delete(id);
    else {
      next.set(id, position);
      playMidi(position.midi, 0, 0.6);
    }
    setSelected(next);
  };

  const submit = () => {
    if (!target) return;
    const expected = [...getChordPitchClasses(target.rootPc, target.quality)].sort();
    const actual = [...new Set([...selected.values()].map((position) => position.pitchClass))].sort();
    const correct =
      expected.length === actual.length &&
      expected.every((pitchClass, index) => pitchClass === actual[index]);
    setResult(
      correct
        ? "Correct. Every required pitch class is present."
        : `Not yet. Required pitch classes: ${expected.map((value) => noteName(value)).join(", ")}.`
    );
    if (correct) playChord([...selected.values()].map((position) => position.midi));
  };

  return (
    <section className="panel game-panel">
      <div className="game-copy">
        <p className="eyebrow">Chord construction</p>
        <h2>
          {target ? `Build ${target.rootName} ${target.quality}` : "Build a chord from memory"}
        </h2>
        <p>
          Select any physical occurrences you need. Octave duplicates are allowed, but
          the pitch-class set must be exact.
        </p>
        {!target || result ? (
          <button className="primary-button" onClick={start}>
            {target ? "Next chord" : "Start quiz"}
          </button>
        ) : (
          <button className="primary-button" onClick={submit}>
            Submit chord
          </button>
        )}
        {result && <p className="result-message">{result}</p>}
      </div>
      <Fretboard
        tuning={tuning}
        selectedCoordinates={new Set(selected.keys())}
        onCellClick={toggle}
      />
    </section>
  );
}
