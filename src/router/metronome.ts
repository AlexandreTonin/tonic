import { PAGES } from './pages';
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './root';

export const metronomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.metronome,
  path: '/metronome',
  component: lazyRouteComponent(
    () => import('@/routes/metronome'),
    'MetronomePage',
  ),
});
