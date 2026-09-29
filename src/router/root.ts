import { AppLayout } from '@/components/layout/app-layout';
import { createRootRoute } from '@tanstack/react-router';

export const rootRoute = createRootRoute({ component: AppLayout });
