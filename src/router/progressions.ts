import { lazyRouteComponent } from '@tanstack/react-router';
import { PAGES } from './pages';
import { exploreFirstRoute } from './explore-first';

export const progressionsRoute = exploreFirstRoute(
  '/progressions',
  lazyRouteComponent(() => import('@/routes/galleries'), 'ProgressionsGallery'),
  'pop',
  PAGES.progressions,
);
