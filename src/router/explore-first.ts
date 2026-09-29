import {
  createRoute,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router';
import { rootRoute } from './root';
import { rootSearch, THEORY_DEFAULTS, type RawSearch } from './search';

export const exploreFirstRoute = <TPath extends '/scales' | '/chords' | '/arpeggios'>(
  path: TPath,
  component: () => React.ReactNode,
  defaultId: string,
) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component,
    validateSearch: (search: RawSearch) => ({
      root: rootSearch(search),
      view: search.view === 'gallery' ? ('gallery' as const) : undefined,
    }),
    search: {
      middlewares: [stripSearchParams({ root: THEORY_DEFAULTS.root })],
    },
    beforeLoad: ({ search }) => {
      if (search.view === 'gallery') return;
      const query =
        search.root === THEORY_DEFAULTS.root
          ? ''
          : `?root=${encodeURIComponent(search.root)}`;
      throw redirect({ href: `${path}/${defaultId}${query}`, replace: true });
    },
  });
