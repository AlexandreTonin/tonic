import { LICK_BARS, LICK_STYLES } from '@/lib/theory/lick';
import type { SearchSchemaInput } from '@tanstack/react-router';

export const pick = <T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
) => (options.includes(value as T) ? (value as T) : fallback);

const LABELS = ['notes', 'intervals'] as const;
export const PROGRESSION_STRUMS = [1, 2, 4] as const;
export const THEORY_DEFAULTS = { root: 'C', labels: 'notes' } as const;

export type RawSearch = {
  root?: string;
  labels?: string;
  position?: number;
  view?: string;
  shape?: string;
  over?: string;
  mode?: string;
  size?: string;
  dominant?: boolean;
  degree?: number;
  category?: string;
  bpm?: number;
  scales?: string;
  strums?: number;
  sound?: string;
  lick?: string | number;
  bars?: number;
  style?: string;
  easy?: boolean;
  span?: boolean;
} & SearchSchemaInput;

const PITCH_CLASS = /^[A-G][#b]?$/;
export const rootSearch = (search: RawSearch) =>
  typeof search.root === 'string' && PITCH_CLASS.test(search.root)
    ? search.root
    : THEORY_DEFAULTS.root;

export const theorySearch = (search: RawSearch) => ({
  root: rootSearch(search),
  labels: pick(search.labels, LABELS, THEORY_DEFAULTS.labels),
});

export const positionSearch = (search: RawSearch) => {
  const position = Number(search.position);
  return position >= 1 && position <= 5 ? position : undefined;
};

export const LICK_DEFAULTS = { bars: 2, easy: false, span: false } as const;
const LICK_SEED = /^[0-9a-z]{1,8}$/;

export const lickSearch = (search: RawSearch) => {
  const lick = String(search.lick ?? '');
  const bars = LICK_BARS.find((b) => b === Number(search.bars));
  return {
    lick: LICK_SEED.test(lick) ? lick : undefined,
    bars: bars ?? LICK_DEFAULTS.bars,
    style: LICK_STYLES.some((s) => s.id === search.style)
      ? search.style
      : undefined,
    easy: search.easy === true,
    span: search.span === true,
  };
};
