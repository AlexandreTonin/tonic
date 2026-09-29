import {
  getTone,
  setTone,
  subscribeTone,
  TONE_INSTRUMENTS,
} from '@/lib/tone';
import { useState, useSyncExternalStore } from 'react';
import { Soundfont } from 'smplr';

type Guitar = ReturnType<typeof Soundfont>;

const STRUM_GAP = 0.03;
const STRUM_LENGTH = 2.5;
const NOTE_LENGTH = 0.3;

let context: AudioContext | undefined;
const instruments = new Map<string, Promise<Guitar>>();
let playing: Guitar | undefined;
let noteTimers: ReturnType<typeof setTimeout>[] = [];

function cueAt(audioTime: number, cue: () => void) {
  const delayMs = Math.max(0, (audioTime - context!.currentTime) * 1000);
  noteTimers.push(setTimeout(cue, delayMs));
}

export function audioContext() {
  context ??= new AudioContext();
  return context;
}

export function loadSoundfont(name: string) {
  if (!instruments.has(name)) {
    instruments.set(
      name,
      (async () => {
        const instrument = Soundfont(audioContext(), { instrument: name });
        await instrument.ready;
        return instrument;
      })().catch((error) => {
        instruments.delete(name); 
        throw error;
      }),
    );
  }
  return instruments.get(name)!;
}

async function loadGuitar() {
  const guitar = await loadSoundfont(TONE_INSTRUMENTS[getTone()]);
  if (playing !== guitar) playing?.stop();
  playing = guitar;
  return guitar;
}

export function useTone() {
  const tone = useSyncExternalStore(subscribeTone, getTone);
  return [tone, setTone] as const;
}

export async function loadAudio() {
  const instrument = await loadGuitar();
  await context!.resume();
  return { context: context!, guitar: instrument };
}

export function useGuitar() {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const play = async (schedule: (g: Guitar, start: number) => void) => {
    setLoading(true);
    try {
      const g = await loadGuitar();
      await context!.resume();
      g.stop();
      noteTimers.forEach(clearTimeout);
      noteTimers = [];
      schedule(g, context!.currentTime + 0.05);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    failed,
    strum: (midis: number[]) =>
      play((g, start) =>
        midis.forEach((note, i) =>
          g.start({
            note,
            time: start + i * STRUM_GAP,
            duration: STRUM_LENGTH,
          }),
        ),
      ),
    melody: (midis: number[]) =>
      play((g, start) =>
        midis.forEach((note, i) =>
          g.start({ note, time: start + i * NOTE_LENGTH * 2, duration: NOTE_LENGTH * 2 }),
        ),
      ),
    upAndDown: (midis: number[], onNote?: (midi: number | null) => void) =>
      play((g, start) => {
        const run = [...midis, ...midis.slice(0, -1).reverse()];
        run.forEach((note, i) => {
          const time = start + i * NOTE_LENGTH;
          g.start({ note, time, duration: NOTE_LENGTH });
          if (onNote) cueAt(time, () => onNote(note));
        });
        if (onNote) cueAt(start + run.length * NOTE_LENGTH, () => onNote(null));
      }),
  };
}
