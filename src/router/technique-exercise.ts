import { findExercise } from '@/lib/technique/catalog';
import { PAGES } from './pages';
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './root';

export const techniqueExerciseRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: {
    ...PAGES.technique,
    item: (id: string) => findExercise(id)?.name,
  },
  path: '/technique/$id',
  component: lazyRouteComponent(
    () => import('@/routes/technique-exercise'),
    'TechniqueExercisePage',
  ),
});
