import { PAGES } from './pages';
import {
  createRoute,
  stripSearchParams,
  lazyRouteComponent,
} from '@tanstack/react-router';
import { rootRoute } from './root';
import { rootSearch, THEORY_DEFAULTS, type RawSearch } from './search';

export const circleOfFifthsRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.circleOfFifths,
  path: '/circle-of-fifths',
  component: lazyRouteComponent(
    () => import('@/routes/circle-of-fifths'),
    'CircleOfFifthsPage',
  ),
  validateSearch: (search: RawSearch) => ({ root: rootSearch(search) }),
  search: {
    middlewares: [stripSearchParams({ root: THEORY_DEFAULTS.root })],
  },
});
