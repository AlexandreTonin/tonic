import { PAGES } from './pages';
import { MetronomePage } from '@/routes/metronome';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

export const metronomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.metronome,
  path: '/metronome',
  component: MetronomePage,
});
