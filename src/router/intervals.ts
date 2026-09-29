import { IntervalsGallery } from '@/routes/galleries';
import { exploreFirstRoute } from './explore-first';

export const intervalsRoute = exploreFirstRoute(
  '/intervals',
  IntervalsGallery,
  'minor-third',
);
