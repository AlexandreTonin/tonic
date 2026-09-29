import { ProgressionPage } from '@/routes/progressions';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import {
  PROGRESSION_STRUMS,
  pick,
  theorySearch,
  THEORY_DEFAULTS,
  type RawSearch,
} from './search';

const PROGRESSION_SCALES = ['key', 'chord'] as const;
const PROGRESSION_DEFAULTS = {
  ...THEORY_DEFAULTS,
  bpm: 90,
  scales: 'key',
  strums: 1,
} as const;

export const progressionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progressions/$id',
  component: ProgressionPage,
  validateSearch: (search: RawSearch) => {
    const bpm = Math.round(Number(search.bpm));
    const strums = PROGRESSION_STRUMS.find((s) => s === Number(search.strums));
    return {
      ...theorySearch(search),
      bpm: bpm >= 40 && bpm <= 240 ? bpm : PROGRESSION_DEFAULTS.bpm,
      scales: pick(
        search.scales,
        PROGRESSION_SCALES,
        PROGRESSION_DEFAULTS.scales,
      ),
      strums: strums ?? PROGRESSION_DEFAULTS.strums,
    };
  },
  search: { middlewares: [stripSearchParams(PROGRESSION_DEFAULTS)] },
});
