import { PAGES } from './pages';
import { TechniquePage } from '@/routes/technique';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import type { RawSearch } from './search';

export const techniqueRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.technique,
  path: '/technique',
  component: TechniquePage,
  validateSearch: (search: RawSearch) => ({
    category:
      typeof search.category === 'string' && search.category.length <= 60
        ? search.category
        : undefined,
  }),
});
