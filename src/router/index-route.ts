import { NAV } from '@/components/layout/nav';
import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: NAV[0].items[0].to, replace: true });
  },
});
