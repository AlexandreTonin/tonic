import { SOUND_IDS } from '@/lib/rhythm-sounds';
import { RhythmPage } from '@/routes/rhythm';
import { createRoute, stripSearchParams } from '@tanstack/react-router';
import { rootRoute } from './root';
import { pick, type RawSearch } from './search';

const RHYTHM_DEFAULTS = { bpm: 80, sound: 'muted' } as const;

export const rhythmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rhythm/$id',
  component: RhythmPage,
  validateSearch: (search: RawSearch) => {
    const bpm = Math.round(Number(search.bpm));
    return {
      bpm: bpm >= 40 && bpm <= 240 ? bpm : RHYTHM_DEFAULTS.bpm,
      sound: pick(search.sound, SOUND_IDS, RHYTHM_DEFAULTS.sound),
    };
  },
  search: { middlewares: [stripSearchParams(RHYTHM_DEFAULTS)] },
});
