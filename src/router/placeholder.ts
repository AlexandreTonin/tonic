import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './root';

export const placeholderRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: { noindex: true },
  path: '$',
  component: lazyRouteComponent(
    () => import('@/routes/placeholder'),
    'Placeholder',
  ),
});
