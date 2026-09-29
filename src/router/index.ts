import { createRouter } from '@tanstack/react-router';
import { chordRoute } from './chord';
import { chordsRoute } from './chords';
import { indexRoute } from './index-route';
import { placeholderRoute } from './placeholder';
import { rootRoute } from './root';
import { scaleRoute } from './scale';
import { scalesRoute } from './scales';

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    scalesRoute,
    scaleRoute,
    chordsRoute,
    chordRoute,
    placeholderRoute,
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
