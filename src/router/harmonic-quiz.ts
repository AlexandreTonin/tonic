import { QUIZ_SIZES } from '@/lib/harmonic-quiz';
import { HarmonicQuizPage } from '@/routes/harmonic-quiz';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';
import { pick, type RawSearch } from './search';

const QUIZ_DEFAULTS = { size: 'triads' } as const;

export const harmonicQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.harmonicQuiz,
  path: '/harmonic-quiz',
  component: HarmonicQuizPage,
  validateSearch: (search: RawSearch) => ({
    size: pick(search.size, QUIZ_SIZES, QUIZ_DEFAULTS.size),
  }),
  search: { middlewares: [stripSearchParams(QUIZ_DEFAULTS)] },
});
