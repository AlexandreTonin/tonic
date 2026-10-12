import { ROOTS } from '@/lib/roots';
import { ScaleFinderPage } from '@/routes/scale-finder';
import { createRoute } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';
import type { RawSearch } from './search';

export const scaleFinderRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.scaleFinder,
  path: '/scale-finder',
  component: ScaleFinderPage,
  validateSearch: (search: RawSearch) => {
    const notes = String(search.notes ?? '')
      .split(',')
      .filter((n): n is (typeof ROOTS)[number] =>
        ROOTS.includes(n as (typeof ROOTS)[number]),
      );
    return { notes: notes.length ? [...new Set(notes)].join(',') : undefined };
  },
});
