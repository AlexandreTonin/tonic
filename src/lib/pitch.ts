const MIN_RMS = 0.01;
const MIN_FREQ = 30;
const MAX_FREQ = 1400;

export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
): number | null {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
  if (Math.sqrt(rms / size) < MIN_RMS) return null;

  const minLag = Math.floor(sampleRate / MAX_FREQ);
  const maxLag = Math.min(Math.floor(sampleRate / MIN_FREQ), size - 1);
  const corr = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < size; i++) sum += buffer[i] * buffer[i + lag];
    corr[lag] = sum / (size - lag);
  }

  let best = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (best === -1 || corr[lag] > corr[best]) best = lag;
  }
  if (best <= minLag || corr[best] <= 0) return null;

  const threshold = corr[best] * 0.9;
  let lag = minLag + 1;
  while (
    lag < best &&
    !(
      corr[lag] >= threshold &&
      corr[lag] >= corr[lag - 1] &&
      corr[lag] >= corr[lag + 1]
    )
  )
    lag++;

  const [a, b, c] = [corr[lag - 1], corr[lag], corr[lag + 1]];
  const shift = (a - c) / (2 * (a - 2 * b + c)) || 0;
  return sampleRate / (lag + shift);
}

export const midiFromFrequency = (freq: number) =>
  69 + 12 * Math.log2(freq / 440);

export function nearestString(midi: number, openMidis: number[]) {
  let index = 0;
  openMidis.forEach((open, i) => {
    if (Math.abs(midi - open) < Math.abs(midi - openMidis[index])) index = i;
  });
  return index;
}
