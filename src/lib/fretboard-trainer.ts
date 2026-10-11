import { ROOTS, type Root } from '@/lib/roots';
import { read, write } from '@/lib/storage';
import { Note } from 'tonal';

export const TRAINER_MODES = ['find', 'name'] as const;
export type TrainerMode = (typeof TRAINER_MODES)[number];

export const TRAINER_REGIONS = {
  '0-5': [0, 5],
  '5-9': [5, 9],
  '7-12': [7, 12],
  '0-12': [0, 12],
} as const;
export type TrainerRegion = keyof typeof TRAINER_REGIONS;

export type Cell = { string: number; fret: number };
export type TrainerScope = {
  tuning: string[];
  strings: number[];
  region: TrainerRegion;
};
export type Question = Cell & { note: Root };

export const chromaAt = (tuning: string[], { string, fret }: Cell) =>
  (Note.chroma(tuning[tuning.length - string]) + fret) % 12;

export const rootFor = (chroma: number) =>
  ROOTS.find((r) => Note.chroma(r) === chroma)!;

export function inScope({ strings, region }: TrainerScope, cell: Cell) {
  const [lo, hi] = TRAINER_REGIONS[region];
  return strings.includes(cell.string) && cell.fret >= lo && cell.fret <= hi;
}

export function scopeCells(scope: TrainerScope): Cell[] {
  const [lo, hi] = TRAINER_REGIONS[scope.region];
  return scope.strings.flatMap((string) =>
    Array.from({ length: hi - lo + 1 }, (_, i) => ({ string, fret: lo + i })),
  );
}

export function nextQuestion(
  scope: TrainerScope,
  previous?: Question,
  random: () => number = Math.random,
): Question | undefined {
  const cells = scopeCells(scope);
  const fresh = cells.filter(
    (c) =>
      !previous || chromaAt(scope.tuning, c) !== Note.chroma(previous.note),
  );
  const pool = fresh.length ? fresh : cells;
  if (!pool.length) return undefined;
  const cell = pool[Math.floor(random() * pool.length)];
  return { ...cell, note: rootFor(chromaAt(scope.tuning, cell)) };
}

export const isFound = (scope: TrainerScope, note: Root, cell: Cell) =>
  inScope(scope, cell) && chromaAt(scope.tuning, cell) === Note.chroma(note);

export type TrainerStats = {
  hits: number;
  attempts: number;
  bestStreak: number;
  bestMs: number | null;
};

const KEY = 'tonic.fretboard-trainer';
const EMPTY: TrainerStats = {
  hits: 0,
  attempts: 0,
  bestStreak: 0,
  bestMs: null,
};

export function loadStats(): TrainerStats {
  const saved = read(KEY) as Partial<TrainerStats> | null;
  return {
    hits: Number(saved?.hits) || 0,
    attempts: Number(saved?.attempts) || 0,
    bestStreak: Number(saved?.bestStreak) || 0,
    bestMs: typeof saved?.bestMs === 'number' ? saved.bestMs : null,
  };
}

export const saveStats = (stats: TrainerStats) => write(KEY, stats);

export const resetStats = () => {
  saveStats(EMPTY);
  return EMPTY;
};

export const now = () => Date.now();
