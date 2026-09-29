import { AppLayout } from '@/components/layout/app-layout';
import { NAV } from '@/components/layout/nav';
import { Placeholder } from '@/routes/placeholder';
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

const rootRoute = createRootRoute({ component: AppLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: NAV[0].items[0].to, replace: true });
  },
});

const placeholderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: Placeholder,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, placeholderRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
