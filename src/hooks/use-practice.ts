import { getPractice, subscribePractice } from '@/lib/practice-log';
import { useEffect, useState, useSyncExternalStore } from 'react';

export const usePractice = () =>
  useSyncExternalStore(subscribePractice, getPractice);

export function useElapsed(since: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (since === undefined) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [since]);
  return since === undefined
    ? 0
    : Math.max(0, Math.round((now - since) / 1000));
}
