import type { SearchSchemaInput } from '@tanstack/react-router';

export const pick = <T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
) => (options.includes(value as T) ? (value as T) : fallback);

const LABELS = ['notes', 'intervals'] as const;
export const THEORY_DEFAULTS = { root: 'C', labels: 'notes' } as const;

export type RawSearch = {
  root?: string;
  labels?: string;
  position?: number;
  view?: string;
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
