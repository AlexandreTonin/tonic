import { CircleOfFifthsPage } from '@/routes/circle-of-fifths';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import { rootSearch, THEORY_DEFAULTS, type RawSearch } from './search';

export const circleOfFifthsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/circle-of-fifths',
  component: CircleOfFifthsPage,
  validateSearch: (search: RawSearch) => ({ root: rootSearch(search) }),
  search: {
    middlewares: [stripSearchParams({ root: THEORY_DEFAULTS.root })],
  },
});
