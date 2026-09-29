import { HarmonicFieldPage } from '@/routes/harmonic-field';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import { pick, rootSearch, type RawSearch } from './search';

const FIELD_MODES = ['major', 'minor'] as const;
const FIELD_SIZES = ['sevenths', 'triads'] as const;
const FIELD_DEFAULTS = {
  root: 'C',
  mode: 'major',
  size: 'sevenths',
  dominant: false,
  degree: 1,
} as const;

export const harmonicFieldRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/harmonic-field',
  component: HarmonicFieldPage,
  validateSearch: (search: RawSearch) => {
    const degree = Number(search.degree);
    return {
      root: rootSearch(search),
      mode: pick(search.mode, FIELD_MODES, FIELD_DEFAULTS.mode),
      size: pick(search.size, FIELD_SIZES, FIELD_DEFAULTS.size),
      dominant: search.dominant === true,
      degree: degree >= 1 && degree <= 7 ? degree : FIELD_DEFAULTS.degree,
    };
  },
  search: { middlewares: [stripSearchParams(FIELD_DEFAULTS)] },
});
