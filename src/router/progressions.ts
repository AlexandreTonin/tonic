import { PAGES } from './pages';
import { ProgressionsGallery } from '@/routes/galleries';
import { exploreFirstRoute } from './explore-first';

export const progressionsRoute = exploreFirstRoute(
  '/progressions',
  ProgressionsGallery,
  'pop',
  PAGES.progressions,
);
