import { AppLayout } from '@/components/layout/app-layout';
import { isTuning } from '@/lib/tuning';
import { createRootRoute, retainSearchParams } from '@tanstack/react-router';
import type { RawSearch } from './search';

export const rootRoute = createRootRoute({
  component: AppLayout,
  validateSearch: (search: RawSearch) => ({
    tuning: isTuning(search.tuning) ? search.tuning : undefined,
  }),
  search: { middlewares: [retainSearchParams(['tuning'])] },
});
