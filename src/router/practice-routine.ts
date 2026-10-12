import { ROUTINE_MINUTES } from '@/lib/practice-routine';
import { PracticeRoutinePage } from '@/routes/practice-routine';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';
import type { RawSearch } from './search';

const SEED = /^[0-9a-z]{1,8}$/;
const ROUTINE_DEFAULTS = { minutes: 30 } as const;

export const practiceRoutineRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.practiceRoutine,
  path: '/practice-routine',
  component: PracticeRoutinePage,
  validateSearch: (search: RawSearch) => ({
    minutes:
      ROUTINE_MINUTES.find((m) => m === Number(search.minutes)) ??
      ROUTINE_DEFAULTS.minutes,
    seed: SEED.test(String(search.seed ?? ''))
      ? String(search.seed)
      : undefined,
  }),
  search: { middlewares: [stripSearchParams(ROUTINE_DEFAULTS)] },
});
