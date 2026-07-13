let context: AudioContext | null = null;

function getContext(): AudioContext {
  context ??= new AudioContext();
  return context;
}

export function playMidi(midi: number, delay = 0, duration = 1.2): void {
  const audioContext = getContext();
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), start);
  filter.type = "lowpass";
  filter.frequency.value = 2200;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.38, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

export function playChord(midiNotes: readonly number[], delay = 0): void {
  [...midiNotes]
    .sort((a, b) => a - b)
    .forEach((midi, index) => playMidi(midi, delay + index * 0.045, 1.8));
}
