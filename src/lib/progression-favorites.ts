import { read, write } from '@/lib/storage';

export type ProgressionFavorite = {
  title: string;
  mode: 'major' | 'minor';
  chords: string;
};

const KEY = 'tonic.progression-favorites';

export function loadProgressionFavorites(): ProgressionFavorite[] {
  const saved = read(KEY);
  if (!Array.isArray(saved)) return [];
  return saved.filter(
    (f): f is ProgressionFavorite =>
      typeof f?.title === 'string' &&
      typeof f?.chords === 'string' &&
      (f?.mode === 'major' || f?.mode === 'minor'),
  );
}

export const progressionFavoriteId = (f: Omit<ProgressionFavorite, 'title'>) =>
  `${f.mode}|${f.chords}`;

export function toggleProgressionFavorite(favorite: ProgressionFavorite) {
  const favorites = loadProgressionFavorites();
  const id = progressionFavoriteId(favorite);
  const next = favorites.some((f) => progressionFavoriteId(f) === id)
    ? favorites.filter((f) => progressionFavoriteId(f) !== id)
    : [favorite, ...favorites];
  return write(KEY, next) ? next : favorites;
}
