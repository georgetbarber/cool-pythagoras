import { useEffect, useRef, useState } from "react";
import { assessPitch, assessRhythm, detectPitch, isOnset, signalRms } from "../audio/analysis";
import type { RhythmAssessment } from "../audio/analysis";
import { playMidi, startCountIn, stopAudio } from "../audio/engine";
import { openMicrophone, startTakeRecording } from "../audio/microphone";
import type { MicrophoneSession, TakeRecorder } from "../audio/microphone";

export function PerformanceCoach({
  targetMidi,
  targetName,
  bpm
}: {
  targetMidi: number;
  targetName: string;
  bpm: number;
}) {
  const sessionRef = useRef<MicrophoneSession | null>(null);
  const recorderRef = useRef<TakeRecorder | null>(null);
  const takeUrlRef = useRef<string | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousRmsRef = useRef(0);
  const lastOnsetRef = useRef(0);
  const rhythmRef = useRef<{ expected: number[]; onsets: number[] } | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [status, setStatus] = useState("Microphone analysis is optional and stays in this browser.");
  const [rhythm, setRhythm] = useState<RhythmAssessment | null>(null);
  const [recording, setRecording] = useState(false);
  const [takeUrl, setTakeUrl] = useState<string | null>(null);

  const stopSession = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
    sessionRef.current?.close();
    sessionRef.current = null;
    setMicrophoneReady(false);
  };

  useEffect(() => () => {
    stopAudio();
    stopSession();
    if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
  }, []);

  const monitor = (session: MicrophoneSession) => {
    session.analyser.getFloatTimeDomainData(session.samples);
    const rms = signalRms(session.samples);
    const detected = detectPitch(session.samples, session.audioContext.sampleRate);
    setFrequency(detected);
    const now = performance.now();
    if (
      rhythmRef.current &&
      isOnset(previousRmsRef.current, rms) &&
      now - lastOnsetRef.current > 120
    ) {
      rhythmRef.current.onsets.push(now);
      lastOnsetRef.current = now;
    }
    previousRmsRef.current = rms;
    frameRef.current = requestAnimationFrame(() => monitor(session));
  };

  const enableMicrophone = async (): Promise<MicrophoneSession | null> => {
    if (sessionRef.current) return sessionRef.current;
    try {
      const session = await openMicrophone();
      sessionRef.current = session;
      setMicrophoneReady(true);
      setStatus("Microphone ready. Play one clear note or short, separated strums.");
      monitor(session);
      return session;
    } catch (error) {
      setStatus(error instanceof Error
        ? `Microphone unavailable: ${error.message}`
        : "Microphone permission was not granted.");
      return null;
    }
  };

  const pitch = frequency ? assessPitch(frequency, targetMidi) : null;
  const startRhythm = async () => {
    const session = await enableMicrophone();
    if (!session) return;
    setRhythm(null);
    setStatus("Listen to four count-in clicks. Then play four silent, evenly spaced beats.");
    const beatMs = 60000 / bpm;
    startCountIn(bpm, 4, () => {
      const start = performance.now() + 150;
      const expected = Array.from({ length: 4 }, (_, index) => start + index * beatMs);
      rhythmRef.current = { expected, onsets: [] };
      setStatus("Now: play four even attacks from the internal pulse.");
      finishTimerRef.current = window.setTimeout(() => {
        if (!rhythmRef.current) return;
        const result = assessRhythm(rhythmRef.current.onsets, rhythmRef.current.expected);
        setRhythm(result);
        rhythmRef.current = null;
        setStatus(`${result.hits}/${result.expected} attacks matched. Mean timing distance: ${result.meanOffsetMs ?? "no match"} ms.`);
      }, beatMs * 4 + 350);
    });
  };

  const startRecording = async () => {
    const session = await enableMicrophone();
    if (!session) return;
    try {
      recorderRef.current = startTakeRecording(session.stream);
      setRecording(true);
      setStatus("Recording your guitar locally. Play the shape or progression, then stop.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Recording could not start.");
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    const blob = await recorder.stop();
    recorderRef.current = null;
    setRecording(false);
    if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
    const url = URL.createObjectURL(blob);
    takeUrlRef.current = url;
    setTakeUrl(url);
    setStatus("Recorded take ready. Compare your sound and timing with the displayed relationship.");
  };

  return (
    <section className="panel performance-coach">
      <div className="panel-heading">
        <div>
          <div className="section-label">Play, listen, adjust</div>
          <h2>Microphone and rhythm feedback</h2>
          <p>Monophonic pitch feedback works best with one clean note. Rhythm feedback listens for four separated attacks after a count-in.</p>
        </div>
        <button className="button secondary" onClick={() => playMidi(targetMidi)}>Hear {targetName}</button>
      </div>
      <div className="coach-grid">
        <article>
          <small>Pitch target</small>
          <strong>{targetName}</strong>
          {pitch
            ? <span className={`pitch-${pitch.verdict}`}>{Math.abs(pitch.cents)} cents · {pitch.direction}</span>
            : <span>Play one note and let it ring.</span>}
        </article>
        <article>
          <small>Four-beat timing</small>
          <strong>{rhythm ? `${rhythm.accuracy}%` : `${bpm} BPM`}</strong>
          <span>{rhythm ? rhythm.verdict : "Count in, then four silent-pulse attacks"}</span>
        </article>
        <article>
          <small>Recorded guitar take</small>
          <strong>{takeUrl ? "Ready" : recording ? "Recording" : "Not recorded"}</strong>
          <span>Audio remains local and is discarded when the page closes.</span>
        </article>
      </div>
      <div className="coach-actions">
        {!microphoneReady && <button className="button primary" onClick={enableMicrophone}>Enable microphone</button>}
        <button className="button secondary" disabled={!microphoneReady} onClick={startRhythm}>Start rhythm check</button>
        {!recording
          ? <button className="button secondary" disabled={!microphoneReady} onClick={startRecording}>Record guitar take</button>
          : <button className="button primary" onClick={stopRecording}>Stop recording</button>}
        {microphoneReady && <button className="text-button" disabled={recording} onClick={stopSession}>Turn microphone off</button>}
      </div>
      {takeUrl && <audio className="take-player" controls src={takeUrl}>Recorded guitar take</audio>}
      <p className="feedback" aria-live="polite">{status}</p>
      <p className="privacy-note">No microphone audio is uploaded, saved to an account, or analysed outside this device.</p>
    </section>
  );
}
