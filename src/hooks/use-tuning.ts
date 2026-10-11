import {
  DEFAULT_TUNING,
  getSavedTuning,
  saveTuning,
  subscribeTuning,
} from '@/lib/tuning';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSyncExternalStore } from 'react';

export function useTuning() {
  const { tuning } = useSearch({ strict: false });
  const saved = useSyncExternalStore(subscribeTuning, getSavedTuning);
  const navigate = useNavigate();
  const setTuning = (value: string) => {
    saveTuning(value);
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        tuning: value === DEFAULT_TUNING ? undefined : value,
      }),
      replace: true,
    });
  };
  return [tuning ?? saved, setTuning] as const;
}
