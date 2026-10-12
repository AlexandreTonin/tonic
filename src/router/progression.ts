import { findProgression } from '@/lib/theory/catalog';
import { PAGES } from './pages';
import {
  createRoute,
  stripSearchParams,
  lazyRouteComponent,
} from '@tanstack/react-router';
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
  mode: 'major',
  chords: 'I,VIm,IV,V',
} as const;
const PROGRESSION_MODES = ['major', 'minor'] as const;
const CHORDS = /^[#b]?[IV]{1,3}[^,]{0,8}(,[#b]?[IV]{1,3}[^,]{0,8}){0,31}$/;

export const progressionRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: {
    ...PAGES.progressions,
    item: (id: string) => findProgression(id)?.name,
  },
  path: '/progressions/$id',
  component: lazyRouteComponent(
    () => import('@/routes/progressions'),
    'ProgressionPage',
  ),
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
      mode: pick(search.mode, PROGRESSION_MODES, PROGRESSION_DEFAULTS.mode),
      chords: CHORDS.test(String(search.chords ?? ''))
        ? String(search.chords)
        : PROGRESSION_DEFAULTS.chords,
    };
  },
  search: { middlewares: [stripSearchParams(PROGRESSION_DEFAULTS)] },
});
