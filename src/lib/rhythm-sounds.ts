import { DrumMachine, Soundfont } from 'smplr';
import { audioContext, loadSoundfont } from '@/hooks/use-guitar';

export const SOUND_IDS = [
  'muted',
  'drive',
  'acoustic',
  'tr-808',
  'cr-8000',
  'woodblock',
] as const;
export type SoundId = (typeof SOUND_IDS)[number];

export const SOUND_LABELS: Record<SoundId, string> = {
  muted: 'Guitarra abafada',
  drive: 'Guitarra com drive',
  acoustic: 'Violão',
  'tr-808': 'Bateria TR-808',
  'cr-8000': 'Bateria CR-8000',
  woodblock: 'Woodblock',
};

export type Voice = {
  hit: (time: number, duration: number, accent: boolean) => void;
  step: (time: number) => void;
  stop: () => void;
};

const ACCENT = 115;
const NORMAL = 75;
const POWER_CHORD = [40, 47, 52];
const OPEN_E = [40, 47, 52, 56, 59, 64];
const STRUM_GAP = 0.012;

const cache = new Map<SoundId, Promise<Voice>>();

function chordVoice(
  instrument: ReturnType<typeof Soundfont>,
  notes: number[],
): Voice {
  return {
    hit: (time, duration, accent) =>
      notes.forEach((note, i) =>
        instrument.start({
          note,
          time: time + i * STRUM_GAP,
          duration,
          velocity: accent ? ACCENT : NORMAL,
        }),
      ),
    step: () => {},
    stop: () => instrument.stop(),
  };
}

function drumVoice(drums: ReturnType<typeof DrumMachine>): Voice {
  const groups = drums.getGroupNames();
  const hihat = groups.find((g) => g.startsWith('hihat-clos')) ?? 'hihat-close';
  return {
    hit: (time, _duration, accent) => {
      drums.start({ note: 'snare', time, velocity: accent ? ACCENT : 90 });
      if (accent) drums.start({ note: 'kick', time, velocity: ACCENT });
    },
    step: (time) => drums.start({ note: hihat, time, velocity: 45 }),
    stop: () => drums.stop(),
  };
}

async function load(id: SoundId): Promise<Voice> {
  const context = audioContext();
  if (id === 'tr-808' || id === 'cr-8000') {
    const drums = DrumMachine(context, {
      instrument: id === 'tr-808' ? 'TR-808' : 'Roland CR-8000',
    });
    await drums.ready;
    return drumVoice(drums);
  }
  const name = {
    muted: 'electric_guitar_muted',
    drive: 'overdriven_guitar',
    acoustic: 'acoustic_guitar_steel',
    woodblock: 'woodblock',
  }[id];
  const instrument = await loadSoundfont(name);
  const notes =
    id === 'acoustic' ? OPEN_E : id === 'woodblock' ? [76] : POWER_CHORD;
  return chordVoice(instrument, notes);
}

export async function loadVoice(id: SoundId): Promise<Voice> {
  if (!cache.has(id)) {
    cache.set(
      id,
      load(id).catch((error) => {
        cache.delete(id);
        throw error;
      }),
    );
  }
  return cache.get(id)!;
}
