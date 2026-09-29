import { createRouter } from '@tanstack/react-router';
import { arpeggioRoute } from './arpeggio';
import { arpeggiosRoute } from './arpeggios';
import { chordRoute } from './chord';
import { chordsRoute } from './chords';
import { harmonicFieldRoute } from './harmonic-field';
import { indexRoute } from './index-route';
import { intervalRoute } from './interval';
import { intervalsRoute } from './intervals';
import { placeholderRoute } from './placeholder';
import { progressionRoute } from './progression';
import { progressionsRoute } from './progressions';
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
    arpeggiosRoute,
    arpeggioRoute,
    intervalsRoute,
    intervalRoute,
    harmonicFieldRoute,
    progressionsRoute,
    progressionRoute,
    placeholderRoute,
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
