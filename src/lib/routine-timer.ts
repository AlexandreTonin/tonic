import type { RoutineBlock } from '@/lib/practice-routine';

export type RoutineTimer = {
  blocks: RoutineBlock[];
  index: number;
  endsAt: number;
};

let state: RoutineTimer | null = null;
let finished = false;
const listeners = new Set<() => void>();

function set(next: RoutineTimer | null) {
  state = next;
  listeners.forEach((listener) => listener());
}

export const getRoutineTimer = () => state;
export const routineFinished = () => finished;

export function subscribeRoutineTimer(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function goTo(blocks: RoutineBlock[], index: number, now: number) {
  finished = index >= blocks.length;
  set(
    finished
      ? null
      : { blocks, index, endsAt: now + blocks[index].minutes * 60_000 },
  );
}

export const startRoutine = (blocks: RoutineBlock[], now = Date.now()) =>
  goTo(blocks, 0, now);

export function skipRoutineBlock(now = Date.now()) {
  if (state) goTo(state.blocks, state.index + 1, now);
}

export function stopRoutine() {
  finished = false;
  set(null);
}

export function tickRoutine(now = Date.now()) {
  if (!state || now < state.endsAt) return false;
  goTo(state.blocks, state.index + 1, now);
  return true;
}
