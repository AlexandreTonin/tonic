import { findChord } from '@/lib/theory/catalog';
import { PAGES } from './pages';
import {
  createRoute,
  stripSearchParams,
  lazyRouteComponent,
} from '@tanstack/react-router';
import { rootRoute } from './root';
import {
  capoSearch,
  pick,
  theorySearch,
  THEORY_DEFAULTS,
  type RawSearch,
} from './search';

const CHORD_VIEWS = ['notes', 'shape'] as const;
const CHORD_DEFAULTS = { ...THEORY_DEFAULTS, view: 'notes', capo: 0 } as const;
const SHAPE = /^(x|\d{1,2})(-(x|\d{1,2})){3,6}$/;

export const chordRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: {
    ...PAGES.chords,
    item: (id: string) => findChord(id)?.name,
  },
  path: '/chords/$id',
  component: lazyRouteComponent(() => import('@/routes/chords'), 'ChordPage'),
  validateSearch: (search: RawSearch) => ({
    ...theorySearch(search),
    view: pick(search.view, CHORD_VIEWS, CHORD_DEFAULTS.view),
    shape:
      typeof search.shape === 'string' && SHAPE.test(search.shape)
        ? search.shape
        : undefined,
    capo: capoSearch(search),
  }),
  search: { middlewares: [stripSearchParams(CHORD_DEFAULTS)] },
});
