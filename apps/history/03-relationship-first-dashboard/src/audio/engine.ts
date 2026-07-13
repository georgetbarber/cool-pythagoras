let audioContext: AudioContext | null = null;
let activeNodes: OscillatorNode[] = [];

function context(): AudioContext {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

export function stopAudio(): void {
  activeNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // A node may already have completed naturally.
    }
  });
  activeNodes = [];
}

export function playMidi(
  midi: number,
  delay = 0,
  duration = 1.1,
  gainAmount = 0.22
): void {
  const audio = context();
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), start);
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainAmount, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
  oscillator.onended = () => {
    activeNodes = activeNodes.filter((node) => node !== oscillator);
  };
  activeNodes.push(oscillator);
}

export function playChord(midis: readonly number[], delay = 0): void {
  [...midis]
    .sort((left, right) => left - right)
    .forEach((midi, index) => playMidi(midi, delay + index * 0.035, 1.5, 0.16));
}

export function playAgainstTonic(tonicPc: number, targetPc: number): void {
  stopAudio();
  const tonicMidi = 48 + ((tonicPc - 0 + 12) % 12);
  const targetMidi = tonicMidi + ((targetPc - tonicPc + 12) % 12);
  playMidi(tonicMidi, 0, 2.6, 0.12);
  playMidi(targetMidi, 0.55, 1.5, 0.24);
  playMidi(tonicMidi, 1.7, 1.2, 0.18);
}
