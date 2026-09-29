import { ArpeggiosGallery } from '@/routes/galleries';
import { exploreFirstRoute } from './explore-first';

export const arpeggiosRoute = exploreFirstRoute(
  '/arpeggios',
  ArpeggiosGallery,
  'm7',
);
