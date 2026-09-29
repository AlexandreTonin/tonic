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
import { rhythmRoute } from './rhythm';
import { rhythmsRoute } from './rhythms';
import { rootRoute } from './root';
import { techniqueRoute } from './technique';
import { techniqueExerciseRoute } from './technique-exercise';
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
    techniqueRoute,
    techniqueExerciseRoute,
    rhythmsRoute,
    rhythmRoute,
    placeholderRoute,
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
