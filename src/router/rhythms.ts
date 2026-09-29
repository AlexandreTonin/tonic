import { PAGES } from './pages';
import { RhythmsGallery } from '@/routes/galleries';
import { exploreFirstRoute } from './explore-first';

export const rhythmsRoute = exploreFirstRoute(
  '/rhythm',
  RhythmsGallery,
  'eighth-notes',
  PAGES.rhythm,
);
