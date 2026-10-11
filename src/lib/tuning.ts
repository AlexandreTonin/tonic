import { TUNINGS } from '@/lib/theory/core';

export const TUNING_IDS = Object.keys(TUNINGS);

export const DEFAULT_TUNING = 'standard';

export const TUNING_LABELS: Record<string, string> = {
  standard: 'Padrão (E A D G B E)',
  'drop-d': 'Drop D (D A D G B E)',
  'half-step-down': 'Meio tom abaixo (Eb Ab Db Gb Bb Eb)',
  dadgad: 'DADGAD (D A D G A D)',
  'open-g': 'Open G (D G D G B D)',
  'open-d': 'Open D (D A D F# A D)',
  'seven-string': '7 cordas (B E A D G B E)',
  bass: 'Baixo 4 cordas (E A D G)',
};

export const TUNING_SHORT_LABELS: Record<string, string> = {
  standard: 'Padrão',
  'drop-d': 'Drop D',
  'half-step-down': 'Meio tom abaixo',
  dadgad: 'DADGAD',
  'open-g': 'Open G',
  'open-d': 'Open D',
  'seven-string': '7 cordas',
  bass: 'Baixo',
};

export const isTuning = (value: unknown): value is string =>
  TUNING_IDS.includes(value as string);

const KEY = 'tonic.tuning';
const listeners = new Set<() => void>();

function read(): string {
  try {
    const saved = localStorage.getItem(KEY);
    return isTuning(saved) ? saved : DEFAULT_TUNING;
  } catch {
    return DEFAULT_TUNING;
  }
}

let current = read();

export const getSavedTuning = () => current;

export function saveTuning(tuning: string) {
  current = tuning;
  listeners.forEach((listener) => listener());
  try {
    localStorage.setItem(KEY, tuning);
  } catch {
    return;
  }
}

export function subscribeTuning(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
