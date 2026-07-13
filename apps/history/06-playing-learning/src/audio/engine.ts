let context: AudioContext | null = null;
let activeNodes: OscillatorNode[] = [];
let activeTimers: number[] = [];

function audioContext(): AudioContext {
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

export function stopAudio(): void {
  activeNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // The node has already completed.
    }
  });
  activeNodes = [];
  activeTimers.forEach((timer) => window.clearTimeout(timer));
  activeTimers = [];
}

export function playMidi(midi: number, delay = 0, duration = 0.8, volume = 0.14): void {
  const audio = audioContext();
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), start);
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
  oscillator.onended = () => {
    activeNodes = activeNodes.filter((node) => node !== oscillator);
  };
  activeNodes.push(oscillator);
}

export function playClick(delay = 0, accented = false): void {
  const audio = audioContext();
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(accented ? 1320 : 960, start);
  gain.gain.setValueAtTime(accented ? 0.13 : 0.085, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.06);
  activeNodes.push(oscillator);
  oscillator.onended = () => {
    activeNodes = activeNodes.filter((node) => node !== oscillator);
  };
}

export function startCountIn(bpm: number, beats: number, onComplete: () => void): () => void {
  stopAudio();
  const beatMs = 60000 / bpm;
  Array.from({ length: beats }, (_, index) => {
    const timer = window.setTimeout(() => playClick(0, index === 0), index * beatMs);
    activeTimers.push(timer);
  });
  activeTimers.push(window.setTimeout(onComplete, beats * beatMs));
  return stopAudio;
}

export function playPitchClass(pitchClass: number, delay = 0): void {
  playMidi(60 + ((pitchClass % 12) + 12) % 12, delay);
}

export function playRelationship(tonic: number, target: number): void {
  stopAudio();
  const tonicMidi = 48 + ((tonic % 12) + 12) % 12;
  const targetMidi = tonicMidi + ((target - tonic + 12) % 12);
  playMidi(tonicMidi, 0, 2.4, 0.1);
  playMidi(targetMidi, 0.65, 1.1, 0.2);
  playMidi(tonicMidi, 1.8, 0.9, 0.16);
}

export function playChord(pitchClasses: readonly number[], delay = 0, duration = 1.05): void {
  pitchClasses.forEach((pitchClass, index) => {
    playMidi(48 + ((pitchClass % 12) + 12) % 12 + (index > 1 ? 12 : 0), delay + index * 0.025, duration, 0.11);
  });
}

export function playVoicing(midis: readonly number[], delay = 0, duration = 1.15): void {
  [...midis]
    .sort((a, b) => a - b)
    .forEach((midi, index) => playMidi(midi, delay + index * 0.025, duration, 0.11));
}

export function playMelodicRelationship(tonic: number, target: number): void {
  stopAudio();
  const tonicMidi = 48 + ((tonic % 12) + 12) % 12;
  const targetMidi = tonicMidi + ((target - tonic + 12) % 12);
  playMidi(tonicMidi, 0, 0.72, 0.16);
  playMidi(targetMidi, 0.82, 0.9, 0.2);
}

export function playHarmonicRelationship(tonic: number, target: number): void {
  stopAudio();
  const tonicMidi = 48 + ((tonic % 12) + 12) % 12;
  const targetMidi = tonicMidi + ((target - tonic + 12) % 12);
  playMidi(tonicMidi, 0, 1.3, 0.12);
  playMidi(targetMidi, 0, 1.3, 0.18);
}

export function startProgression(
  chords: readonly (readonly number[])[],
  bpm: number,
  onStep?: (index: number) => void
): () => void {
  stopAudio();
  const beatMs = 60000 / bpm;
  chords.forEach((chord, index) => {
    const timer = window.setTimeout(() => {
      onStep?.(index);
      playChord(chord, 0, Math.max(0.45, beatMs * 0.0032));
    }, index * beatMs * 4);
    activeTimers.push(timer);
  });
  const ending = window.setTimeout(() => onStep?.(-1), chords.length * beatMs * 4);
  activeTimers.push(ending);
  return stopAudio;
}

export function startVoicingProgression(
  voicings: readonly (readonly number[])[],
  bpm: number,
  onStep?: (index: number) => void
): () => void {
  stopAudio();
  const barMs = (60000 / bpm) * 4;
  voicings.forEach((voicing, index) => {
    const timer = window.setTimeout(() => {
      onStep?.(index);
      playVoicing(voicing, 0, Math.max(0.55, barMs * 0.0008));
    }, index * barMs);
    activeTimers.push(timer);
  });
  activeTimers.push(window.setTimeout(() => onStep?.(-1), voicings.length * barMs));
  return stopAudio;
}
