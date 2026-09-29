import { IntervalPage } from '@/routes/intervals';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import { rootSearch, THEORY_DEFAULTS, type RawSearch } from './search';

export const intervalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/intervals/$id',
  component: IntervalPage,
  validateSearch: (search: RawSearch) => ({ root: rootSearch(search) }),
  search: {
    middlewares: [stripSearchParams({ root: THEORY_DEFAULTS.root })],
  },
});
