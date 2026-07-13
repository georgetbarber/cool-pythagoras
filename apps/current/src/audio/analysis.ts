export interface PitchAssessment {
  detectedMidi: number;
  targetMidi: number;
  cents: number;
  verdict: "in-tune" | "close" | "adjust";
  direction: "raise" | "lower" | "hold";
}

export interface RhythmAssessment {
  hits: number;
  expected: number;
  meanOffsetMs: number | null;
  accuracy: number;
  verdict: "locked" | "steady" | "developing";
  offsets: readonly number[];
}

export function signalRms(samples: Float32Array): number {
  if (!samples.length) return 0;
  return Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
}

export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  minimumFrequency = 70,
  maximumFrequency = 1200
): number | null {
  const rms = signalRms(samples);
  if (rms < 0.012) return null;
  const minimumLag = Math.max(2, Math.floor(sampleRate / maximumFrequency));
  const maximumLag = Math.min(samples.length - 2, Math.ceil(sampleRate / minimumFrequency));
  let bestLag = -1;
  let bestCorrelation = 0;
  for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
    let correlation = 0;
    let energy = 0;
    for (let index = 0; index < samples.length - lag; index += 1) {
      correlation += samples[index] * samples[index + lag];
      energy += samples[index] * samples[index] + samples[index + lag] * samples[index + lag];
    }
    const normalized = energy ? (2 * correlation) / energy : 0;
    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }
  if (bestLag < 0 || bestCorrelation < 0.72) return null;
  return sampleRate / bestLag;
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

export function assessPitch(frequency: number, targetMidi: number): PitchAssessment {
  const detectedMidi = frequencyToMidi(frequency);
  const nearestTarget = targetMidi + Math.round((detectedMidi - targetMidi) / 12) * 12;
  const cents = Math.round((detectedMidi - nearestTarget) * 100);
  const absolute = Math.abs(cents);
  return {
    detectedMidi,
    targetMidi: nearestTarget,
    cents,
    verdict: absolute <= 15 ? "in-tune" : absolute <= 35 ? "close" : "adjust",
    direction: absolute <= 15 ? "hold" : cents < 0 ? "raise" : "lower"
  };
}

export function isOnset(previousRms: number, currentRms: number, threshold = 0.045): boolean {
  return currentRms >= threshold && currentRms > Math.max(previousRms * 1.65, previousRms + 0.018);
}

export function assessRhythm(
  onsetTimes: readonly number[],
  expectedTimes: readonly number[],
  toleranceMs = 220
): RhythmAssessment {
  const unused = [...onsetTimes];
  const offsets = expectedTimes.flatMap((expected) => {
    if (!unused.length) return [];
    let nearestIndex = 0;
    for (let index = 1; index < unused.length; index += 1) {
      if (Math.abs(unused[index] - expected) < Math.abs(unused[nearestIndex] - expected)) nearestIndex = index;
    }
    const onset = unused[nearestIndex];
    if (Math.abs(onset - expected) > toleranceMs) return [];
    unused.splice(nearestIndex, 1);
    return [Math.round(onset - expected)];
  });
  const meanOffsetMs = offsets.length
    ? Math.round(offsets.reduce((sum, offset) => sum + Math.abs(offset), 0) / offsets.length)
    : null;
  const hitRatio = expectedTimes.length ? offsets.length / expectedTimes.length : 0;
  const timingScore = meanOffsetMs === null ? 0 : Math.max(0, 1 - meanOffsetMs / toleranceMs);
  const accuracy = Math.round((hitRatio * 0.65 + timingScore * 0.35) * 100);
  return {
    hits: offsets.length,
    expected: expectedTimes.length,
    meanOffsetMs,
    accuracy,
    verdict: accuracy >= 85 ? "locked" : accuracy >= 65 ? "steady" : "developing",
    offsets
  };
}
