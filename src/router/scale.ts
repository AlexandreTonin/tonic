import { findScale } from '@/lib/theory/catalog';
import { PAGES } from './pages';
import {
  createRoute,
  stripSearchParams,
  lazyRouteComponent,
} from '@tanstack/react-router';
import { rootRoute } from './root';
import {
  LICK_DEFAULTS,
  lickSearch,
  positionSearch,
  RUN_DEFAULTS,
  runSearch,
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
  component: lazyRouteComponent(() => import('@/routes/scales'), 'ScalePage'),
  validateSearch: (search: RawSearch) => ({
    ...theorySearch(search),
    position: positionSearch(search),
    ...lickSearch(search),
    ...runSearch(search),
  }),
  search: {
    middlewares: [
      stripSearchParams({
        ...THEORY_DEFAULTS,
        ...LICK_DEFAULTS,
        ...RUN_DEFAULTS,
      }),
    ],
  },
});
