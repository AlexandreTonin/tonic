import { PracticeLogPage } from '@/routes/practice-log';
import { createRoute } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';

export const practiceLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.practiceLog,
  path: '/practice-log',
  component: PracticeLogPage,
});
