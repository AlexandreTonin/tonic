import { ScalesGallery } from '@/routes/galleries';
import { exploreFirstRoute } from './explore-first';

export const scalesRoute = exploreFirstRoute(
  '/scales',
  ScalesGallery,
  'minor-pentatonic',
);
