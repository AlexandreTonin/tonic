import { loadSoundfont } from '@/hooks/use-guitar';

export type ClickSound = 'beep' | 'click' | 'wood';
export type Accent = 'accent' | 'normal' | 'mute';
type Level = 'accent' | 'normal' | 'sub';

export const CLICK_LABELS: Record<ClickSound, string> = {
  beep: 'Bipe',
  click: 'Clique',
  wood: 'Woodblock',
};

const GAIN: Record<Level, number> = { accent: 0.5, normal: 0.3, sub: 0.12 };
const BEEP_HZ: Record<Level, number> = { accent: 1600, normal: 1000, sub: 800 };
const WOOD: Record<Level, { note: number; velocity: number }> = {
  accent: { note: 79, velocity: 120 },
  normal: { note: 76, velocity: 90 },
  sub: { note: 76, velocity: 45 },
};
const BEEP_LENGTH = 0.03;
const NOISE_LENGTH = 0.02;

let noise: AudioBuffer | undefined;
let woodblock: Awaited<ReturnType<typeof loadSoundfont>> | undefined;

export async function prepareClick(sound: ClickSound) {
  if (sound === 'wood') woodblock ??= await loadSoundfont('woodblock');
}

function noiseBuffer(context: AudioContext) {
  if (noise) return noise;
  const length = Math.round(context.sampleRate * NOISE_LENGTH);
  noise = context.createBuffer(1, length, context.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  return noise;
}

export function playClick(
  context: AudioContext,
  sound: ClickSound,
  level: Level,
  at: number,
) {
  if (sound === 'wood' && woodblock) {
    woodblock.start({ ...WOOD[level], time: at, duration: 0.2 });
    return;
  }
  const gain = context.createGain();
  gain.connect(context.destination);
  if (sound === 'click') {
    const source = context.createBufferSource();
    source.buffer = noiseBuffer(context);
    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = level === 'accent' ? 1500 : 2500;
    gain.gain.value = GAIN[level] * 2;
    source.connect(filter).connect(gain);
    source.start(at);
    return;
  }
  const osc = context.createOscillator();
  osc.frequency.value = BEEP_HZ[level];
  gain.gain.setValueAtTime(GAIN[level], at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + BEEP_LENGTH);
  osc.connect(gain);
  osc.start(at);
  osc.stop(at + BEEP_LENGTH);
}
