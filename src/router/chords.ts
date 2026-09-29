import { PAGES } from './pages';
import { ChordsGallery } from '@/routes/galleries';
import { exploreFirstRoute } from './explore-first';

export const chordsRoute = exploreFirstRoute(
  '/chords',
  ChordsGallery,
  'major',
  PAGES.chords,
);
