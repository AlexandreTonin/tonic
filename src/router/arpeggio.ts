import { findChord } from '@/lib/theory/catalog';
import { PAGES } from './pages';
import {
  createRoute,
  stripSearchParams,
  lazyRouteComponent,
} from '@tanstack/react-router';
import { rootRoute } from './root';
import {
  positionSearch,
  theorySearch,
  THEORY_DEFAULTS,
  type RawSearch,
} from './search';

const CHORD_SYMBOL = /^[A-G][#b]?[\w#]{0,12}$/;

export const arpeggioRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: {
    ...PAGES.arpeggios,
    item: (id: string) => findChord(id)?.name,
  },
  path: '/arpeggios/$id',
  component: lazyRouteComponent(
    () => import('@/routes/arpeggios'),
    'ArpeggioPage',
  ),
  validateSearch: (search: RawSearch) => ({
    ...theorySearch(search),
    position: positionSearch(search),
    over:
      typeof search.over === 'string' && CHORD_SYMBOL.test(search.over)
        ? search.over
        : undefined,
  }),
  search: { middlewares: [stripSearchParams(THEORY_DEFAULTS)] },
});
