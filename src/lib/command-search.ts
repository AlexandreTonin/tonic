import { NAV } from '@/components/layout/nav';
import { ROOTS } from '@/lib/roots';
import { EXERCISES } from '@/lib/technique/catalog';
import {
  listChords,
  listIntervals,
  listProgressions,
  listRhythms,
  listScales,
} from '@/lib/theory/engine';
import { Note } from 'tonal';

export type CommandItem = {
  label: string;
  group: string;
  to: string;
  id?: string;
  rooted?: boolean;
};

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let index: CommandItem[] | undefined;

function buildIndex(): CommandItem[] {
  const items = (
    group: string,
    to: string,
    list: { id: string; name: string }[],
    rooted = true,
  ) => list.map(({ id, name }) => ({ label: name, group, to, id, rooted }));
  return [
    ...NAV.flatMap((g) =>
      g.items.map(({ to, label }) => ({ label, group: 'Páginas', to })),
    ),
    ...items('Escalas', '/scales/$id', listScales()),
    ...items('Acordes', '/chords/$id', listChords()),
    ...items('Arpejos', '/arpeggios/$id', listChords()),
    ...items('Intervalos', '/intervals/$id', listIntervals()),
    ...items('Progressões', '/progressions/$id', listProgressions()),
    ...items('Ritmos', '/rhythm/$id', listRhythms(), false),
    ...items('Exercícios', '/technique/$id', EXERCISES, false),
  ];
}

const ROOT_TOKEN = /^[a-g][#b]?$/i;

export function parseQuery(query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const first = query.trim().split(/\s+/)[0] ?? '';
  if (words.length && ROOT_TOKEN.test(first)) {
    const name = first[0].toUpperCase() + first.slice(1);
    const root = ROOTS.find((r) => Note.chroma(r) === Note.chroma(name));
    return { root, words: words.slice(1) };
  }
  return { root: undefined, words };
}

export function searchCommands(query: string, limit = 30) {
  index ??= buildIndex();
  const { root, words } = parseQuery(query);
  const matches = index.filter((item) => {
    if (root && !item.rooted) return false;
    const text = normalize(`${item.label} ${item.group}`);
    return words.every((w) => text.includes(w));
  });
  return { root, items: matches.slice(0, limit) };
}
