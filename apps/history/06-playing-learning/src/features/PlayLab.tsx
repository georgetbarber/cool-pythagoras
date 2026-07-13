import { useEffect, useMemo, useState } from "react";
import { playVoicing, startVoicingProgression, stopAudio } from "../audio/engine";
import { PerformanceCoach } from "../components/PerformanceCoach";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { buildFretboard, STANDARD_GUITAR } from "../core/instrument/guitar";
import { experimentSuggestions, identifyChord } from "../core/music/chordDiscovery";
import type { ChordCandidate } from "../core/music/chordDiscovery";
import type { FretPosition } from "../core/instrument/guitar";
import type { FeatureProps } from "./types";

interface ProgressionItem {
  id: string;
  candidate: ChordCandidate;
  positions: readonly FretPosition[];
}

const FRETS = Array.from({ length: 13 }, (_, fret) => fret);

export function PlayLab({ state }: FeatureProps) {
  const [stringFrets, setStringFrets] = useState<(number | null)[]>([null, null, null, null, null, null]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [progression, setProgression] = useState<ProgressionItem[]>([]);
  const [activeProgression, setActiveProgression] = useState(-1);
  const board = useMemo(() => buildFretboard(), []);
  const positions = useMemo(() => stringFrets.flatMap((fret, string) =>
    fret === null ? [] : board.filter((position) => position.string === string && position.fret === fret)
  ), [board, stringFrets]);
  const discovery = useMemo(() => identifyChord(positions, state.context), [positions, state.context]);
  const safeCandidateIndex = Math.min(candidateIndex, Math.max(0, discovery.candidates.length - 1));
  const candidate = discovery.candidates[safeCandidateIndex] ?? null;
  const suggestions = candidate ? experimentSuggestions(candidate, positions) : [];
  const targetMidi = candidate
    ? positions.find((position) => position.pitchClass === candidate.root)?.midi ?? 48 + candidate.root
    : 48 + state.context.tonic;

  useEffect(() => {
    setCandidateIndex(0);
  }, [positions]);
  useEffect(() => () => stopAudio(), []);

  const setString = (string: number, fret: number | null) => {
    setStringFrets((current) => current.map((value, index) =>
      index === string ? (value === fret ? null : fret) : value
    ));
  };
  const loadExample = () => setStringFrets([0, 1, 0, 2, 3, null]);
  const addToProgression = () => {
    if (!candidate || !positions.length) return;
    setProgression((current) => [...current, {
      id: `${Date.now()}-${current.length}`,
      candidate,
      positions: [...positions]
    }]);
  };
  const move = (index: number, direction: -1 | 1) => {
    setProgression((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };
  const playProgression = () => {
    startVoicingProgression(
      progression.map((item) => item.positions.map((position) => position.midi)),
      72,
      setActiveProgression
    );
  };

  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Playing discovery lab"
        title="Play or build a shape, then understand what happened."
        description="Choose one fret or mute per string. The app names plausible chords, explains ambiguity, connects them to the tonal centre, and turns discoveries into a small progression."
        action={<button className="button secondary" onClick={loadExample}>Load open C example</button>}
      />
      <section className="panel shape-input">
        <div className="panel-heading">
          <div>
            <div className="section-label">Chord shape input</div>
            <h2>One sounding position per string</h2>
            <p>Choose X to mute a string, 0 for open, or a fret. Click an active fret again to mute it.</p>
          </div>
          <div className="shape-input-actions">
            <button className="button secondary" disabled={!positions.length} onClick={() => playVoicing(positions.map((position) => position.midi))}>Hear selected strings</button>
            <button className="text-button" onClick={() => setStringFrets([null, null, null, null, null, null])}>Clear shape</button>
          </div>
        </div>
        <div className="shape-input-board" aria-label="Chord shape input fretboard">
          {STANDARD_GUITAR.stringLabels.map((label, string) => (
            <div className="shape-input-row" key={`${label}-${string}`}>
              <strong>{string + 1} · {label}</strong>
              <button
                className={stringFrets[string] === null ? "is-active is-muted" : ""}
                aria-label={`Mute string ${string + 1}`}
                onClick={() => setString(string, null)}
              >
                X
              </button>
              {FRETS.map((fret) => (
                <button
                  className={stringFrets[string] === fret ? "is-active" : ""}
                  aria-label={`String ${string + 1}, fret ${fret}`}
                  data-testid={`shape-string-${string + 1}-fret-${fret}`}
                  onClick={() => setString(string, fret)}
                  key={fret}
                >
                  {fret}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="selected-note-strip">
          {discovery.notes.length
            ? discovery.notes.map((note, index) => <span key={`${note.midi}-${index}`}><b>{note.name}</b>MIDI {note.midi}</span>)
            : <p>Select at least two different pitches to begin.</p>}
        </div>
      </section>

      <section className="discovery-layout">
        <div className="panel discovery-result">
          <div className="section-label">Possible identities</div>
          <h2>{candidate ? candidate.symbol : "No supported chord yet"}</h2>
          <p>{discovery.summary}</p>
          <div className="candidate-list">
            {discovery.candidates.map((item, index) => (
              <button className={safeCandidateIndex === index ? "is-active" : ""} onClick={() => setCandidateIndex(index)} key={`${item.symbol}-${index}`}>
                <strong>{item.symbol}</strong>
                <span>{item.qualityLabel}</span>
                <small>{item.completeness} · {item.inversionLabel}</small>
              </button>
            ))}
          </div>
          <small className="limitation-note">{discovery.limitation}</small>
        </div>
        <div className="panel discovery-explanation">
          <div className="section-label">Why this name?</div>
          {candidate ? (
            <>
              <h2>{candidate.intervalLabels.join(" - ")} from {candidate.rootName}</h2>
              <p>{candidate.explanation}</p>
              <div className="discovery-facts">
                <span><small>Bass</small><strong>{candidate.inversionLabel}</strong></span>
                <span><small>In this context</small><strong>{candidate.context.roman} · {candidate.context.functionLabel}</strong></span>
                <span><small>Status</small><strong>{candidate.completeness}</strong></span>
              </div>
              <p>{candidate.context.explanation}</p>
              <button className="button primary" onClick={addToProgression}>Add this shape to progression</button>
            </>
          ) : <p>The app will show complete and plausible partial interpretations without pretending one name is certain.</p>}
        </div>
        <div className="panel experiment-panel">
          <div className="section-label">Small experiments</div>
          <h2>Change one relationship.</h2>
          {suggestions.map((suggestion) => <p key={suggestion}>{suggestion}</p>)}
        </div>
      </section>

      <section className="panel custom-progression">
        <div className="panel-heading">
          <div>
            <div className="section-label">Your progression</div>
            <h2>{progression.length ? progression.map((item) => item.candidate.symbol).join(" → ") : "Add discovered shapes"}</h2>
            <p>Each item keeps the exact guitar voicing you selected, not just an abstract chord name.</p>
          </div>
          <div className="shape-input-actions">
            <button className="button primary" disabled={!progression.length} onClick={playProgression}>Play at 72 BPM</button>
            <button className="button secondary" disabled={activeProgression < 0} onClick={() => {
              stopAudio();
              setActiveProgression(-1);
            }}>Stop</button>
            <button className="text-button" disabled={!progression.length} onClick={() => setProgression([])}>Clear</button>
          </div>
        </div>
        <div className="custom-progression-list">
          {progression.map((item, index) => (
            <article className={activeProgression === index ? "is-active" : ""} key={item.id}>
              <small>Step {index + 1}</small>
              <strong>{item.candidate.symbol}</strong>
              <span>{item.candidate.context.roman} · {item.candidate.context.relationship.replaceAll("-", " ")}</span>
              <p>{item.candidate.context.explanation}</p>
              <div>
                <button disabled={index === 0} onClick={() => move(index, -1)}>Earlier</button>
                <button disabled={index === progression.length - 1} onClick={() => move(index, 1)}>Later</button>
                <button onClick={() => setProgression((current) => current.filter((entry) => entry.id !== item.id))}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PerformanceCoach
        targetMidi={targetMidi}
        targetName={candidate?.rootName ?? state.context.tonicName}
        bpm={72}
      />
    </div>
  );
}
