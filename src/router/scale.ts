import { ScalePage } from '@/routes/scales';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import {
  positionSearch,
  theorySearch,
  THEORY_DEFAULTS,
  type RawSearch,
} from './search';

export const scaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scales/$id',
  component: ScalePage,
  validateSearch: (search: RawSearch) => ({
    ...theorySearch(search),
    position: positionSearch(search),
  }),
  search: { middlewares: [stripSearchParams(THEORY_DEFAULTS)] },
});
