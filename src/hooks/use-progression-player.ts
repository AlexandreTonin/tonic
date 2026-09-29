import { useRef, useState } from 'react';
import { DrumMachine } from 'smplr';
import { audioContext, loadAudio, loadSoundfont } from '@/hooks/use-guitar';
import { useMetronome } from '@/hooks/use-metronome';
import {
  bassLine,
  type BackingChord,
  drumHits,
  type Groove,
  pianoVoicing,
  type Track,
} from '@/lib/backing';

const STRUM_GAP = 0.03;
const PIANO_VELOCITY = 60;
const BASS_VELOCITY = 100;

export type LoopBar = BackingChord & { strum: number[] };

type Loop = {
  bars: LoopBar[];
  bpm: number;
  beats: number;
  strums: number;
  groove: Groove;
  muted: Set<Track>;
};

type Instrument = Awaited<ReturnType<typeof loadSoundfont>>;
type Drums = ReturnType<typeof DrumMachine>;
type Band = {
  guitar: Instrument | null;
  bass: Instrument | null;
  piano: Instrument | null;
  drums: Drums | null;
};

let drumKit: Promise<Drums> | undefined;

function loadDrums() {
  drumKit ??= (async () => {
    const kit = DrumMachine(audioContext(), { instrument: 'LM-2' });
    await kit.ready;
    return kit;
  })().catch((error) => {
    drumKit = undefined;
    throw error;
  });
  return drumKit;
}

const orNull = <T>(promise: Promise<T>) => promise.catch(() => null);

export function useProgressionPlayer({
  bars,
  bpm,
  beats,
  strums,
  groove,
  muted,
}: Loop) {
  const band = useRef<Band>({
    guitar: null,
    bass: null,
    piano: null,
    drums: null,
  });
  const [loadingBand, setLoadingBand] = useState(false);
  const barOf = (beat: number) =>
    beat < beats ? -1 : (Math.floor(beat / beats) - 1) % bars.length;

  const metronome = useMetronome({
    bpm,
    beats,
    silent: (beat) => beat >= beats && muted.has('click'),
    onBeat: (beat, time) => {
      const index = barOf(beat);
      if (index < 0) return;
      const bar = bars[index];
      const beatInBar = beat % beats;
      const beatLength = 60 / bpm;
      const { guitar, bass, piano, drums } = band.current;

      const beatsPerStrum = beats / strums;
      if (!muted.has('guitar') && beatInBar % beatsPerStrum === 0) {
        bar.strum.forEach((note, i) =>
          guitar?.start({
            note,
            time: time + i * STRUM_GAP,
            duration: beatLength * beatsPerStrum,
          }),
        );
      }

      const half = beats / 2;
      if (!muted.has('bass') && beatInBar % half === 0) {
        const line = bassLine(bar);
        bass?.start({
          note: beatInBar === 0 ? line.root : line.fifth,
          time,
          duration: beatLength * half,
          velocity: BASS_VELOCITY,
        });
      }

      if (!muted.has('piano') && beatInBar === 0) {
        pianoVoicing(bar).forEach((note) =>
          piano?.start({
            note,
            time,
            duration: beatLength * beats,
            velocity: PIANO_VELOCITY,
          }),
        );
      }

      if (!muted.has('drums')) {
        drumHits(groove, beatInBar).forEach((hit) =>
          drums?.start({
            note: hit.sample,
            time: time + hit.offset * beatLength,
            velocity: hit.velocity,
          }),
        );
      }
    },
  });

  const stopBand = () => {
    const { guitar, bass, piano, drums } = band.current;
    guitar?.stop();
    bass?.stop();
    piano?.stop();
    drums?.stop();
  };

  return {
    ...metronome,
    start: async () => {
      setLoadingBand(true);
      const [guitar, bass, piano, drums] = await Promise.all([
        orNull(loadAudio().then((audio) => audio.guitar)),
        orNull(loadSoundfont('electric_bass_finger')),
        orNull(loadSoundfont('acoustic_grand_piano')),
        orNull(loadDrums()),
      ]);
      band.current = { guitar, bass, piano, drums };
      setLoadingBand(false);
      await metronome.start();
    },
    stop: () => {
      metronome.stop();
      stopBand();
    },
    loading: metronome.loading || loadingBand,
    bar: metronome.beat === null ? null : barOf(metronome.beat),
    playing: metronome.running,
  };
}
