import {
  TRAINER_MODES,
  TRAINER_REGIONS,
  type TrainerRegion,
} from '@/lib/fretboard-trainer';
import { FretboardTrainerPage } from '@/routes/fretboard-trainer';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { PAGES } from './pages';
import { rootRoute } from './root';
import { pick, type RawSearch } from './search';

const TRAINER_DEFAULTS = {
  mode: 'find',
  region: '0-12',
  strings: '123456',
} as const;
const REGIONS = Object.keys(TRAINER_REGIONS) as TrainerRegion[];
const STRINGS = /^[1-7]{1,7}$/;

export const fretboardTrainerRoute = createRoute({
  getParentRoute: () => rootRoute,
  staticData: PAGES.fretboardTrainer,
  path: '/fretboard-trainer',
  component: FretboardTrainerPage,
  validateSearch: (search: RawSearch) => ({
    mode: pick(search.mode, TRAINER_MODES, TRAINER_DEFAULTS.mode),
    region: pick(search.region, REGIONS, TRAINER_DEFAULTS.region),
    strings: STRINGS.test(String(search.strings ?? ''))
      ? String(search.strings)
      : TRAINER_DEFAULTS.strings,
  }),
  search: { middlewares: [stripSearchParams(TRAINER_DEFAULTS)] },
});
