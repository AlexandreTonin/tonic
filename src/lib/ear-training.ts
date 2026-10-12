import type { PlayedNote } from '@/hooks/use-guitar';
import { ROOTS } from '@/lib/roots';
import {
  getChord,
  getHarmonicField,
  getScale,
  listChords,
  listIntervals,
  listScales,
} from '@/lib/theory/engine';
import { read, write } from '@/lib/storage';
import { Note } from 'tonal';

export const EAR_EXERCISES = [
  'intervals',
  'chords',
  'scales',
  'degrees',
] as const;
export type EarExercise = (typeof EAR_EXERCISES)[number];

export const INTERVAL_DIRECTIONS = ['up', 'down', 'harmonic'] as const;
export type IntervalDirection = (typeof INTERVAL_DIRECTIONS)[number];

export type EarOption = { id: string; name: string };

const CHORD_IDS = [
  'major',
  'minor',
  'dim',
  'aug',
  'dom7',
  'maj7',
  'm7',
  'm7b5',
];
const SCALE_IDS = [
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
  'harmonic-minor',
  'major-pentatonic',
  'minor-pentatonic',
  'blues',
];
const ENHARMONIC_INTERVALS = ['augmented-fourth', 'augmented-fifth'];
const DEGREES = ['I', 'IIm', 'IIIm', 'IV', 'V', 'VIm', 'VIIdim'];

export const EAR_OPTIONS: Record<EarExercise, EarOption[]> = {
  intervals: listIntervals()
    .filter(
      (i) =>
        i.category === 'Simples' &&
        i.semitones > 0 &&
        !ENHARMONIC_INTERVALS.includes(i.id),
    )
    .map(({ id, name, label }) => ({ id, name: `${name} (${label})` })),
  chords: listChords()
    .filter((c) => CHORD_IDS.includes(c.id))
    .map(({ id, name }) => ({ id, name })),
  scales: listScales()
    .filter((s) => SCALE_IDS.includes(s.id))
    .map(({ id, name }) => ({ id, name })),
  degrees: DEGREES.map((degree, i) => ({ id: String(i), name: degree })),
};

const BASE_MIDI = 48;

function stack(notes: string[], from = BASE_MIDI): number[] {
  const midis: number[] = [];
  for (const note of notes) {
    const prev = midis.length ? midis[midis.length - 1] + 1 : from;
    midis.push(prev + ((Note.chroma(note) - prev + 120) % 12));
  }
  return midis;
}

const together = (midis: number[], start = 0, duration = 2): PlayedNote[] =>
  midis.map((midi) => ({ midi, sound: midi, start, duration }));

const inTurn = (midis: number[], step: number): PlayedNote[] =>
  midis.map((midi, i) => ({
    midi,
    sound: midi,
    start: i * step,
    duration: step,
  }));

export function earNotes(
  exercise: EarExercise,
  answer: string,
  root: string,
  direction: IntervalDirection,
): PlayedNote[] {
  if (exercise === 'intervals') {
    const semitones = listIntervals().find((i) => i.id === answer)!.semitones;
    const low = BASE_MIDI + Note.chroma(root);
    const pair = [low, low + semitones];
    if (direction === 'harmonic') return together(pair);
    return inTurn(direction === 'up' ? pair : pair.reverse(), 1);
  }
  if (exercise === 'chords')
    return together(stack(getChord(answer, root).notes));
  if (exercise === 'scales') {
    return inTurn(stack([...getScale(answer, root).notes, root]), 0.5);
  }
  const chords = getHarmonicField({ root, size: 'triads' }).chords;
  return [
    ...together(stack(chords[0].notes), 0),
    ...together(stack(chords[Number(answer)].notes), 2),
  ];
}

export type EarQuestion = { answer: string; root: string };

export function nextEarQuestion(
  enabled: string[],
  previous?: EarQuestion,
  random: () => number = Math.random,
): EarQuestion | undefined {
  if (!enabled.length) return undefined;
  const pool =
    enabled.length > 1
      ? enabled.filter((id) => id !== previous?.answer)
      : enabled;
  return {
    answer: pool[Math.floor(random() * pool.length)],
    root: ROOTS[Math.floor(random() * ROOTS.length)],
  };
}

export type EarStats = { hits: number; attempts: number; bestStreak: number };
type EarSaved = {
  enabled: Partial<Record<EarExercise, string[]>>;
  stats: Partial<Record<EarExercise, EarStats>>;
};

const KEY = 'tonic.ear-training';

function load(): EarSaved {
  const saved = read(KEY) as Partial<EarSaved> | null;
  return { enabled: saved?.enabled ?? {}, stats: saved?.stats ?? {} };
}

export function loadEnabled(exercise: EarExercise): string[] {
  const ids = EAR_OPTIONS[exercise].map((o) => o.id);
  const saved = load().enabled[exercise]?.filter((id) => ids.includes(id));
  return saved?.length ? saved : ids;
}

export function saveEnabled(exercise: EarExercise, enabled: string[]) {
  const saved = load();
  write(KEY, { ...saved, enabled: { ...saved.enabled, [exercise]: enabled } });
}

export function loadEarStats(exercise: EarExercise): EarStats {
  const stats = load().stats[exercise];
  return {
    hits: Number(stats?.hits) || 0,
    attempts: Number(stats?.attempts) || 0,
    bestStreak: Number(stats?.bestStreak) || 0,
  };
}

export function saveEarStats(exercise: EarExercise, stats: EarStats) {
  const saved = load();
  write(KEY, { ...saved, stats: { ...saved.stats, [exercise]: stats } });
}
