import type { Accent, ClickSound } from '@/lib/clicks';
import { read, write } from '@/lib/storage';

export const METERS = [
  '2/4',
  '3/4',
  '4/4',
  '5/4',
  '6/8',
  '7/8',
  '12/8',
] as const;
export type Meter = (typeof METERS)[number];

export type MetronomeSettings = {
  bpm: number;
  meter: Meter;
  accents: Accent[];
  subdivision: 1 | 2 | 3 | 4;
  sound: ClickSound;
  countIn: boolean;
  gap: { enabled: boolean; play: number; mute: number };
  trainer: {
    enabled: boolean;
    from: number;
    step: number;
    every: number;
    to: number;
  };
  timerMinutes: number;
};

export type MetronomePreset = {
  id: string;
  name: string;
  settings: MetronomeSettings;
};

export const BEATS: Record<Meter, number> = {
  '2/4': 2,
  '3/4': 3,
  '4/4': 4,
  '5/4': 5,
  '6/8': 6,
  '7/8': 7,
  '12/8': 12,
};

const STRONG: Record<Meter, number[]> = {
  '2/4': [0],
  '3/4': [0],
  '4/4': [0],
  '5/4': [0],
  '6/8': [0, 3],
  '7/8': [0, 2, 4],
  '12/8': [0, 3, 6, 9],
};

export const defaultAccents = (meter: Meter): Accent[] =>
  Array.from({ length: BEATS[meter] }, (_, i) =>
    STRONG[meter].includes(i) ? 'accent' : 'normal',
  );

export const DEFAULT_SETTINGS: MetronomeSettings = {
  bpm: 90,
  meter: '4/4',
  accents: defaultAccents('4/4'),
  subdivision: 1,
  sound: 'beep',
  countIn: false,
  gap: { enabled: false, play: 2, mute: 2 },
  trainer: { enabled: false, from: 80, step: 4, every: 4, to: 120 },
  timerMinutes: 0,
};

const ACCENT_CYCLE: Record<Accent, Accent> = {
  accent: 'normal',
  normal: 'mute',
  mute: 'accent',
};
export const nextAccent = (accent: Accent) => ACCENT_CYCLE[accent];

export function tapTempo(taps: number[]): number | null {
  const recent = taps.slice(-5);
  const intervals = recent.slice(1).map((t, i) => t - recent[i]);
  if (!intervals.length || intervals.some((ms) => ms > 2000)) return null;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return Math.min(300, Math.max(20, Math.round(60000 / mean)));
}

export function barState(settings: MetronomeSettings, beat: number) {
  const beats = BEATS[settings.meter];
  const countInBeats = settings.countIn ? beats : 0;
  const bar = Math.floor((beat - countInBeats) / beats);
  const { gap, trainer } = settings;
  const muted =
    gap.enabled && bar >= 0 && bar % (gap.play + gap.mute) >= gap.play;
  const bpm = trainer.enabled
    ? Math.min(
        trainer.to,
        trainer.from +
          Math.floor(Math.max(0, bar) / trainer.every) * trainer.step,
      )
    : settings.bpm;
  return { bar, beatInBar: beat % beats, countingIn: bar < 0, muted, bpm };
}

export function duration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const LAST_KEY = 'tonic.metronome';
const PRESETS_KEY = 'tonic.metronome-presets';

const isSettings = (value: unknown): value is Partial<MetronomeSettings> => {
  const saved = value as Partial<MetronomeSettings> | null;
  return (
    !!saved &&
    !!saved.meter &&
    saved.meter in BEATS &&
    saved.accents?.length === BEATS[saved.meter]
  );
};

export function loadLastSettings(): MetronomeSettings {
  const saved = read(LAST_KEY);
  return isSettings(saved)
    ? { ...DEFAULT_SETTINGS, ...saved }
    : DEFAULT_SETTINGS;
}

export const saveLastSettings = (settings: MetronomeSettings) =>
  write(LAST_KEY, settings);

export function loadPresets(): MetronomePreset[] {
  const saved = read(PRESETS_KEY);
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(
      (p): p is MetronomePreset =>
        typeof p?.id === 'string' &&
        typeof p?.name === 'string' &&
        isSettings(p?.settings),
    )
    .map((p) => ({ ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } }));
}

export function savePreset(name: string, settings: MetronomeSettings) {
  const presets = loadPresets();
  const existing = presets.find((p) => p.name === name);
  const preset = { id: existing?.id ?? crypto.randomUUID(), name, settings };
  const next = existing
    ? presets.map((p) => (p.id === existing.id ? preset : p))
    : [...presets, preset];
  return write(PRESETS_KEY, next) ? { preset, presets: next } : null;
}

export function deletePreset(id: string) {
  const next = loadPresets().filter((p) => p.id !== id);
  return write(PRESETS_KEY, next) ? next : null;
}
