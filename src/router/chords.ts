import { lazyRouteComponent } from '@tanstack/react-router';
import { PAGES } from './pages';
import { exploreFirstRoute } from './explore-first';

export const chordsRoute = exploreFirstRoute(
  '/chords',
  lazyRouteComponent(() => import('@/routes/galleries'), 'ChordsGallery'),
  'major',
  PAGES.chords,
);
