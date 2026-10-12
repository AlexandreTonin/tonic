import { getRoutineTimer, subscribeRoutineTimer } from '@/lib/routine-timer';
import { useSyncExternalStore } from 'react';

export const useRoutineTimer = () =>
  useSyncExternalStore(subscribeRoutineTimer, getRoutineTimer);
