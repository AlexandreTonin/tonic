import { lazyRouteComponent } from '@tanstack/react-router';
import { PAGES } from './pages';
import { exploreFirstRoute } from './explore-first';

export const arpeggiosRoute = exploreFirstRoute(
  '/arpeggios',
  lazyRouteComponent(() => import('@/routes/galleries'), 'ArpeggiosGallery'),
  'm7',
  PAGES.arpeggios,
);
