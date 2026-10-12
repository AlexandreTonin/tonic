import { TunerPage } from '@/routes/tuner';
import { createRoute } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';

export const tunerRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.tuner,
  path: '/tuner',
  component: TunerPage,
});
