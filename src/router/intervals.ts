import { lazyRouteComponent } from '@tanstack/react-router';
import { PAGES } from './pages';
import { exploreFirstRoute } from './explore-first';

export const intervalsRoute = exploreFirstRoute(
  '/intervals',
  lazyRouteComponent(() => import('@/routes/galleries'), 'IntervalsGallery'),
  'minor-third',
  PAGES.intervals,
);
