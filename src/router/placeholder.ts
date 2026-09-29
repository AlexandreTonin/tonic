import { Placeholder } from '@/routes/placeholder';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

export const placeholderRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: { noindex: true },
  path: '$',
  component: Placeholder,
});
