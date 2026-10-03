import { read, write } from '@/lib/storage';

export type LickFavorite = {
  scale: string;
  root: string;
  position: number;
  bars: number;
  lick: string;
  style?: string;
  easy: boolean;
  span?: boolean;
  title: string;
};

const KEY = 'tonic.lick-favorites';

export const favoriteId = (f: Omit<LickFavorite, 'title'>) =>
  [
    f.scale,
    f.root,
    f.position,
    f.bars,
    f.lick,
    f.style ?? '',
    f.easy,
    f.span ?? false,
  ].join('|');

export function loadFavorites(): LickFavorite[] {
  const saved = read(KEY);
  if (!Array.isArray(saved)) return [];
  return saved.filter(
    (f): f is LickFavorite =>
      typeof f?.scale === 'string' &&
      typeof f?.root === 'string' &&
      typeof f?.lick === 'string' &&
      typeof f?.title === 'string' &&
      typeof f?.position === 'number' &&
      typeof f?.bars === 'number',
  );
}

export function toggleFavorite(favorite: LickFavorite) {
  const favorites = loadFavorites();
  const id = favoriteId(favorite);
  const next = favorites.some((f) => favoriteId(f) === id)
    ? favorites.filter((f) => favoriteId(f) !== id)
    : [favorite, ...favorites];
  return write(KEY, next) ? next : favorites;
}
