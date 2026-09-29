import { findExercise } from '@/lib/technique/catalog';
import { PAGES } from './pages';
import { TechniqueExercisePage } from '@/routes/technique-exercise';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

export const techniqueExerciseRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: {
    ...PAGES.technique,
    item: (id: string) => findExercise(id)?.name,
  },
  path: '/technique/$id',
  component: TechniqueExercisePage,
});
