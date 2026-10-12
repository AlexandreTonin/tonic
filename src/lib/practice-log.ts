import { read, write } from '@/lib/storage';

export type PracticeEntry = {
  start: string;
  seconds: number;
  path: string;
  title: string;
};
type Running = { since: number; session: number; path: string; title: string };
type PracticeState = { entries: PracticeEntry[]; running: Running | null };

const LOG_KEY = 'tonic.practice-log';
const RUNNING_KEY = 'tonic.practice-running';
const MIN_SECONDS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const isEntry = (e: unknown): e is PracticeEntry => {
  const v = e as Partial<PracticeEntry> | null;
  return (
    typeof v?.start === 'string' &&
    typeof v.seconds === 'number' &&
    typeof v.path === 'string' &&
    typeof v.title === 'string'
  );
};

function load(): PracticeState {
  const entries = read(LOG_KEY);
  const running = read(RUNNING_KEY) as Running | null;
  return {
    entries: Array.isArray(entries) ? entries.filter(isEntry) : [],
    running:
      typeof running?.since === 'number'
        ? { ...running, session: running.session ?? running.since }
        : null,
  };
}

let state = load();
const listeners = new Set<() => void>();

function set(next: PracticeState) {
  state = next;
  write(LOG_KEY, next.entries);
  write(RUNNING_KEY, next.running);
  listeners.forEach((listener) => listener());
}

export const getPractice = () => state;

export function subscribePractice(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function closed(running: Running, now: number): PracticeEntry[] {
  const seconds = Math.round((now - running.since) / 1000);
  if (seconds < MIN_SECONDS) return [];
  return [
    {
      start: new Date(running.since).toISOString(),
      seconds,
      path: running.path,
      title: running.title,
    },
  ];
}

export function startPractice(path: string, title: string, now = Date.now()) {
  if (state.running) return;
  set({ ...state, running: { since: now, session: now, path, title } });
}

export function stopPractice(now = Date.now()) {
  if (!state.running) return;
  set({
    entries: [...state.entries, ...closed(state.running, now)],
    running: null,
  });
}

export function movePractice(path: string, title: string, now = Date.now()) {
  const { running } = state;
  if (!running || (running.path === path && running.title === title)) return;
  set({
    entries: [...state.entries, ...closed(running, now)],
    running: { ...running, since: now, path, title },
  });
}

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function secondsByDay(entries: PracticeEntry[]) {
  const days = new Map<string, number>();
  for (const e of entries) {
    const key = dayKey(new Date(e.start));
    days.set(key, (days.get(key) ?? 0) + e.seconds);
  }
  return days;
}

export function lastDaysSeconds(
  entries: PracticeEntry[],
  days: number,
  now = Date.now(),
) {
  const from = now - days * DAY_MS;
  return entries
    .filter((e) => Date.parse(e.start) >= from)
    .reduce((sum, e) => sum + e.seconds, 0);
}

export function streak(entries: PracticeEntry[], now = new Date()) {
  const days = secondsByDay(entries);
  const day = new Date(now);
  if (!days.has(dayKey(day))) day.setDate(day.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(day))) {
    count++;
    day.setDate(day.getDate() - 1);
  }
  return count;
}

export function secondsByPage(entries: PracticeEntry[]) {
  const pages = new Map<string, { title: string; seconds: number }>();
  for (const e of entries) {
    const page = pages.get(e.path) ?? { title: e.title, seconds: 0 };
    pages.set(e.path, { title: page.title, seconds: page.seconds + e.seconds });
  }
  return [...pages.entries()]
    .map(([path, p]) => ({ path, ...p }))
    .sort((a, b) => b.seconds - a.seconds);
}

export const exportPractice = () => JSON.stringify(state.entries, null, 2);

export function importPractice(text: string) {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Formato inválido');
  const incoming = parsed.filter(isEntry);
  const id = (e: PracticeEntry) => `${e.start}|${e.path}`;
  const known = new Set(state.entries.map(id));
  const added = incoming.filter((e) => !known.has(id(e)));
  set({
    ...state,
    entries: [...state.entries, ...added].sort((a, b) =>
      a.start.localeCompare(b.start),
    ),
  });
  return added.length;
}

export const clearPractice = () => set({ entries: [], running: null });

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h} h ${String(m).padStart(2, '0')} min`;
  if (m) return `${m} min${s ? ` ${String(s).padStart(2, '0')} s` : ''}`;
  return `${s} s`;
}
