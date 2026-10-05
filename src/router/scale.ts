import { findScale } from '@/lib/theory/catalog';
import { PAGES } from './pages';
import { ScalePage } from '@/routes/scales';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import {
  LICK_DEFAULTS,
  lickSearch,
  positionSearch,
  theorySearch,
  THEORY_DEFAULTS,
  type RawSearch,
} from './search';

export const scaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: {
    ...PAGES.scales,
    item: (id: string) => findScale(id)?.name,
  },
  path: '/scales/$id',
  component: ScalePage,
  validateSearch: (search: RawSearch) => ({
    ...theorySearch(search),
    position: positionSearch(search),
    ...lickSearch(search),
  }),
  search: {
    middlewares: [stripSearchParams({ ...THEORY_DEFAULTS, ...LICK_DEFAULTS })],
  },
});
