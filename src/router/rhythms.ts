import { lazyRouteComponent } from '@tanstack/react-router';
import { PAGES } from './pages';
import { exploreFirstRoute } from './explore-first';

export const rhythmsRoute = exploreFirstRoute(
  '/rhythm',
  lazyRouteComponent(() => import('@/routes/galleries'), 'RhythmsGallery'),
  'eighth-notes',
  PAGES.rhythm,
);
