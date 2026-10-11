import { EAR_EXERCISES, INTERVAL_DIRECTIONS } from '@/lib/ear-training';
import { EarTrainingPage } from '@/routes/ear-training';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';
import { pick, type RawSearch } from './search';

const EAR_DEFAULTS = { exercise: 'intervals', direction: 'up' } as const;

export const earTrainingRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.earTraining,
  path: '/ear-training',
  component: EarTrainingPage,
  validateSearch: (search: RawSearch) => ({
    exercise: pick(search.exercise, EAR_EXERCISES, EAR_DEFAULTS.exercise),
    direction: pick(
      search.direction,
      INTERVAL_DIRECTIONS,
      EAR_DEFAULTS.direction,
    ),
  }),
  search: { middlewares: [stripSearchParams(EAR_DEFAULTS)] },
});
