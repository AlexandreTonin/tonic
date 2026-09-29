import { ChordPage } from '@/routes/chords';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import { pick, theorySearch, THEORY_DEFAULTS, type RawSearch } from './search';

const CHORD_VIEWS = ['notes', 'shape'] as const;
const CHORD_DEFAULTS = { ...THEORY_DEFAULTS, view: 'notes' } as const;
const SHAPE = /^(x|\d{1,2})(-(x|\d{1,2})){5}$/;

export const chordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chords/$id',
  component: ChordPage,
  validateSearch: (search: RawSearch) => ({
    ...theorySearch(search),
    view: pick(search.view, CHORD_VIEWS, CHORD_DEFAULTS.view),
    shape:
      typeof search.shape === 'string' && SHAPE.test(search.shape)
        ? search.shape
        : undefined,
  }),
  search: { middlewares: [stripSearchParams(CHORD_DEFAULTS)] },
});
