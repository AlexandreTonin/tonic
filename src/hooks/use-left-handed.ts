import {
  getLeftHanded,
  setLeftHanded,
  subscribeLeftHanded,
} from '@/lib/handedness';
import { useSyncExternalStore } from 'react';

export function useLeftHanded() {
  const leftHanded = useSyncExternalStore(subscribeLeftHanded, getLeftHanded);
  return [leftHanded, setLeftHanded] as const;
}
