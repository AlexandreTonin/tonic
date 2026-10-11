import { audioContext } from '@/hooks/use-guitar';
import { detectPitch } from '@/lib/pitch';
import { useEffect, useRef, useState } from 'react';

const FFT_SIZE = 4096;
const INTERVAL_MS = 100;
const SMOOTHING = 5;

export type TunerStatus =
  'idle' | 'listening' | 'denied' | 'unsupported' | 'error';

const median = (values: number[]) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

export function useTuner() {
  const [status, setStatus] = useState<TunerStatus>('idle');
  const [frequency, setFrequency] = useState<number | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  const stop = () => {
    cleanup.current?.();
    cleanup.current = null;
    setFrequency(null);
    setStatus('idle');
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const context = audioContext();
      await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);
      const buffer = new Float32Array(FFT_SIZE);
      const recent: number[] = [];
      const timer = setInterval(() => {
        analyser.getFloatTimeDomainData(buffer);
        const pitch = detectPitch(buffer, context.sampleRate);
        if (pitch === null) {
          recent.length = 0;
          setFrequency(null);
          return;
        }
        recent.push(pitch);
        if (recent.length > SMOOTHING) recent.shift();
        setFrequency(median(recent));
      }, INTERVAL_MS);
      cleanup.current = () => {
        clearInterval(timer);
        source.disconnect();
        stream.getTracks().forEach((track) => track.stop());
      };
      setStatus('listening');
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'denied'
          : 'error',
      );
    }
  };

  useEffect(() => () => cleanup.current?.(), []);

  return { status, frequency, start, stop };
}
