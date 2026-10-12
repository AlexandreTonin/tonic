import { ChordFinderPage } from '@/routes/chord-finder';
import { createRoute } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';
import type { RawSearch } from './search';

const FRETS = /^(x|\d{1,2})(-(x|\d{1,2})){3,6}$/;

export const chordFinderRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.chordFinder,
  path: '/chord-finder',
  component: ChordFinderPage,
  validateSearch: (search: RawSearch) => ({
    frets:
      typeof search.frets === 'string' && FRETS.test(search.frets)
        ? search.frets
        : undefined,
  }),
});
