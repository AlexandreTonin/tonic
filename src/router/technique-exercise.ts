import { TechniqueExercisePage } from '@/routes/technique-exercise';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

export const techniqueExerciseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/technique/$id',
  component: TechniqueExercisePage,
});
