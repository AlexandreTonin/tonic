import { playClick } from '@/lib/clicks';
import {
  getTone,
  setTone,
  subscribeTone,
  TONE_INSTRUMENTS,
} from '@/lib/tone';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Soundfont } from 'smplr';

type Guitar = ReturnType<typeof Soundfont>;

const STRUM_GAP = 0.03;
const STRUM_LENGTH = 2.5;
const NOTE_LENGTH = 0.3;
const LOOP_LOOKAHEAD = 0.1;
const MAX_BPM = 200;
const BEND_RISE = 0.25;
const BENT_VELOCITY = 80;
const CURL_CENTS = 30;

let context: AudioContext | undefined;
const instruments = new Map<string, Promise<Guitar>>();
let playing: Guitar | undefined;
let noteTimers: ReturnType<typeof setTimeout>[] = [];
let loopOwner: object | undefined;

function silence() {
  playing?.stop();
  noteTimers.forEach(clearTimeout);
  noteTimers = [];
  loopOwner = undefined;
}

function cueAt(audioTime: number, cue: () => void) {
  const delayMs = Math.max(0, (audioTime - context!.currentTime) * 1000);
  noteTimers.push(setTimeout(cue, delayMs));
}

export type PlayedNote = {
  midi: number;
  sound: number;
  start: number;
  duration: number;
  velocity?: number;
  bend?: boolean;
  curl?: boolean;
};

export function startNote(
  g: Guitar,
  { midi, sound, velocity, bend, curl }: PlayedNote,
  time: number,
  length: number,
) {
  if (bend) {
    const rise = length * BEND_RISE;
    g.start({ note: midi, time, duration: rise, velocity });
    g.start({
      note: sound,
      time: time + rise,
      duration: length - rise,
      velocity: BENT_VELOCITY,
    });
    return;
  }
  g.start({
    note: sound,
    time,
    duration: length,
    velocity,
    detune: curl ? CURL_CENTS : undefined,
  });
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
  const [looping, setLooping] = useState(false);
  const owner = useRef({});

  useEffect(() => {
    const self = owner.current;
    return () => {
      if (loopOwner === self) silence();
    };
  }, []);

  const play = async (schedule: (g: Guitar, start: number) => void) => {
    setLoading(true);
    try {
      const g = await loadGuitar();
      await context!.resume();
      silence();
      setLooping(false);
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
    looping,
    stop: () => {
      silence();
      setLooping(false);
    },
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
    sequence: (
      notes: PlayedNote[],
      {
        bpm,
        onNote,
        onPass,
        loop = false,
        countIn = 0,
        accelerate = 0,
      }: {
        bpm: number;
        onNote?: (midi: number | null, index?: number) => void;
        onPass?: (bpm: number) => void;
        loop?: boolean;
        countIn?: number;
        accelerate?: number;
      },
    ) =>
      play((g, start) => {
        const pass = (from: number, tempo: number) => {
          const beat = 60 / tempo;
          let end = from;
          notes.forEach((n, index) => {
            const time = from + n.start * beat;
            end = time + n.duration * beat;
            startNote(g, n, time, n.duration * beat);
            if (onNote) cueAt(time, () => onNote(n.midi, index));
          });
          if (onPass) cueAt(from, () => onPass(tempo));
          if (loop) {
            cueAt(end - LOOP_LOOKAHEAD, () => {
              if (loopOwner === owner.current)
                pass(end, Math.min(MAX_BPM, tempo + accelerate));
            });
          } else if (onNote) {
            cueAt(end, () => onNote(null));
          }
        };
        if (loop) {
          loopOwner = owner.current;
          setLooping(true);
        }
        const beat = 60 / bpm;
        for (let i = 0; i < countIn; i++) {
          playClick(context!, 'beep', i ? 'normal' : 'accent', start + i * beat);
        }
        pass(start + countIn * beat, bpm);
      }),
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
