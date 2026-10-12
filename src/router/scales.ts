import { lazyRouteComponent } from '@tanstack/react-router';
import { PAGES } from './pages';
import { exploreFirstRoute } from './explore-first';

export const scalesRoute = exploreFirstRoute(
  '/scales',
  lazyRouteComponent(() => import('@/routes/galleries'), 'ScalesGallery'),
  'minor-pentatonic',
  PAGES.scales,
);
