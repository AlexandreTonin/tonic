import { useEffect, useRef, useState } from 'react';
import { audioContext } from '@/hooks/use-guitar';
import {
  type Accent,
  type ClickSound,
  playClick,
  prepareClick,
} from '@/lib/clicks';

const LOOKAHEAD = 0.1;
const TICK_MS = 25;

export type MetronomeOptions = {
  bpm: number | ((beat: number) => number);
  beats: number;
  accents?: Accent[];
  subdivision?: number;
  sound?: ClickSound;
  silent?: (beat: number) => boolean;
  onBeat?: (beat: number, time: number, context: AudioContext) => void;
};

export function useMetronome(options: MetronomeOptions) {
  const [beat, setBeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const latest = useRef(options);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    latest.current = options;
  });

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setBeat(null);
  };

  const start = async () => {
    stop();
    setLoading(true);
    try {
      const context = audioContext();
      await context.resume();
      await prepareClick(latest.current.sound ?? 'beep');
      setFailed(false);
      const timers: ReturnType<typeof setTimeout>[] = [];
      let next = 0;
      let time = context.currentTime + 0.1;

      const schedule = () => {
        const {
          bpm,
          beats,
          accents,
          subdivision = 1,
          sound = 'beep',
          silent,
          onBeat,
        } = latest.current;
        while (time < context.currentTime + LOOKAHEAD) {
          const current = next;
          const tempo = typeof bpm === 'function' ? bpm(current) : bpm;
          const accent =
            accents?.[current % beats] ??
            (current % beats === 0 ? 'accent' : 'normal');
          if (accent !== 'mute' && !silent?.(current)) {
            playClick(context, sound, accent, time);
            for (let sub = 1; sub < subdivision; sub++) {
              playClick(
                context,
                sound,
                'sub',
                time + (sub * 60) / tempo / subdivision,
              );
            }
          }
          onBeat?.(current, time, context);
          const delay = Math.max(0, (time - context.currentTime) * 1000);
          timers.push(setTimeout(() => setBeat(current), delay));
          time += 60 / tempo;
          next++;
        }
      };

      schedule();
      const interval = setInterval(schedule, TICK_MS);
      stopRef.current = () => {
        clearInterval(interval);
        timers.forEach(clearTimeout);
      };
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => stopRef.current?.(), []);

  return { beat, running: beat !== null, loading, failed, start, stop };
}
