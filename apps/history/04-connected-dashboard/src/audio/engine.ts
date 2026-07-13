let audioContext: AudioContext | null = null;
let active: OscillatorNode[] = [];

function getContext(): AudioContext {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

export function stopAudio(): void {
  active.forEach((node) => {
    try { node.stop(); } catch { /* already stopped */ }
  });
  active = [];
}

export function playMidi(midi: number, delay = 0, duration = 1.1, amount = 0.18): void {
  const audio = getContext();
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), start);
  filter.type = "lowpass";
  filter.frequency.value = 2200;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(amount, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
  oscillator.onended = () => { active = active.filter((node) => node !== oscillator); };
  active.push(oscillator);
}

export function playChord(midis: readonly number[], delay = 0): void {
  [...midis].sort((a, b) => a - b).forEach((midi, index) => playMidi(midi, delay + index * 0.03, 1.45, 0.13));
}

export function playRelationship(tonicPc: number, targetPc: number): void {
  stopAudio();
  const tonic = 48 + ((tonicPc + 12) % 12);
  const target = tonic + ((targetPc - tonicPc + 12) % 12);
  playMidi(tonic, 0, 2.7, 0.1);
  playMidi(target, 0.65, 1.35, 0.22);
  playMidi(tonic, 1.85, 1.1, 0.17);
}

export function playResolution(from: readonly number[], to: readonly number[]): void {
  stopAudio();
  playChord(from, 0);
  playChord(to, 1.35);
}

