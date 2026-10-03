export interface PoolNote {
  string: number;
  fret: number;
  midi: number;
  note: string;
  degree: string;
  blue?: boolean;
  passing?: boolean;
}

export type Role = 'Repouso' | 'Estável' | 'Cor' | 'Tensão';

export type Technique = 'h' | 'p' | '/' | '\\' | 'r';

export interface LickNote extends PoolNote {
  sound: number;
  start: number;
  duration: number;
  technique?: Technique;
  bend?: boolean;
  curl?: boolean;
  vibrato?: boolean;
  role: Role;
  why: string;
}

export interface LickBar {
  label: string;
  text: string;
}

export interface Lick {
  style: string;
  form: string;
  summary: string;
  bars: LickBar[];
  beats: number;
  notes: LickNote[];
  tab: string[];
  cells: TabCell[];
}

export interface TabCell {
  column: number;
  width: number;
}

type Random = () => number;
type Weighted<T> = [T, number][];

const BAR = 4;
const EPSILON = 1e-6;
const T = 1 / 3;
const SHIFT_FRETS = 4;
const S = 1 / 6;
const CHORD_TONES = ['R', '3', '5', 'b7'];
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

const CELLS = {
  quarter: [1],
  shuffle: [2 * T, T],
  triplet: [T, T, T],
  restShuffle: [-2 * T, T],
  pickup: [-T, T, T],
  sextuplet: [S, S, S, S, S, S],
  rest: [-1],
  half: [2],
  longShort: [5 * T, T],
};
type Cell = keyof typeof CELLS;

interface Style {
  id: string;
  name: string;
  about: string;
  rhythm: Partial<Record<Cell, number>>;
  fragments: number;
  bend: number;
  legato: number;
  longEnding: number;
  easy?: boolean;
}

const STYLES: Style[] = [
  {
    id: 'slow',
    name: 'Blues lento',
    about: 'shuffle lento, notas longas, bends e bastante espaço',
    rhythm: {
      shuffle: 4,
      triplet: 3,
      quarter: 2,
      rest: 2,
      restShuffle: 2,
      half: 2,
      longShort: 1,
    },
    fragments: 0.6,
    bend: 0.6,
    legato: 0.3,
    longEnding: 0.8,
  },
  {
    id: 'shuffle',
    name: 'Shuffle',
    about: 'colcheias em shuffle (longa-curta), com pegada e respiros',
    rhythm: {
      shuffle: 5,
      triplet: 2,
      restShuffle: 2,
      quarter: 2,
      pickup: 1,
      rest: 1,
    },
    fragments: 0.55,
    bend: 0.45,
    legato: 0.4,
    longEnding: 0.5,
  },
  {
    id: 'rock',
    name: 'Blues rock',
    about: 'tercinas rápidas e legato, como nos solos de blues rock',
    rhythm: {
      triplet: 5,
      shuffle: 2,
      sextuplet: 2,
      quarter: 1,
      restShuffle: 1,
    },
    fragments: 0.5,
    bend: 0.35,
    legato: 0.6,
    longEnding: 0.4,
  },
];

interface Fragment {
  name: string;
  minor: boolean;
  steps: string[];
  rhythm: number[];
}

const FRAGMENTS: Fragment[] = [
  {
    name: 'bend da 4ª até a 5ª com release',
    minor: true,
    steps: ['5^', '4r', '-b3', '-R'],
    rhythm: [1, T, T, T],
  },
  {
    name: 'descida em tercinas até a tônica',
    minor: true,
    steps: ['R', '-b7', '-5', '-4', '-b3', '-R'],
    rhythm: [T, T, T, T, T, T],
  },
  {
    name: 'subida cromática pela blue note',
    minor: true,
    steps: ['4', '+b5', '+5', '+b7'],
    rhythm: [T, T, T, 1],
  },
  {
    name: 'descida cromática pela blue note',
    minor: true,
    steps: ['5', '-b5', '-4', '-b3', '-R'],
    rhythm: [T, T, T, T, T, -T],
  },
  {
    name: 'bend da 7ª menor até a tônica, repetido',
    minor: true,
    steps: ['R^', 'R^', '-b7', '-5'],
    rhythm: [2 * T, T, 2 * T, T],
  },
  {
    name: 'curl na 3ª menor',
    minor: true,
    steps: ['5', '-b3c', '-R'],
    rhythm: [2 * T, T, 1],
  },
  {
    name: 'tônica martelada em shuffle',
    minor: true,
    steps: ['R', 'R', '+b3', '-R'],
    rhythm: [2 * T, T, 2 * T, T],
  },
  {
    name: 'bend da 3ª menor até a 4ª',
    minor: true,
    steps: ['4^', '-b3', '-R'],
    rhythm: [1, 2 * T, T],
  },
  {
    name: 'bend da 5ª até a 6ª',
    minor: false,
    steps: ['6^', '-5', '-3', '-R'],
    rhythm: [1, T, T, T],
  },
  {
    name: 'blue note: 3ª menor subindo para a maior',
    minor: false,
    steps: ['2', '+b3', '+3', '-R'],
    rhythm: [T, T, T, 1],
  },
  {
    name: 'descida em tercinas até a 6ª',
    minor: false,
    steps: ['6', '-5', '-3', '-2', '-R', '-6'],
    rhythm: [T, T, T, T, T, T],
  },
  {
    name: 'bend da 2ª até a 3ª',
    minor: false,
    steps: ['3^', '-2', '-R'],
    rhythm: [1, 2 * T, T],
  },
  {
    name: 'tônica martelada em shuffle',
    minor: false,
    steps: ['R', 'R', '+2', '-R'],
    rhythm: [2 * T, T, 2 * T, T],
  },
  {
    name: 'bend da 2ª até a 3ª com release',
    minor: false,
    steps: ['3^', '2r', '-R'],
    rhythm: [2 * T, T, 1],
  },
];

const MOVES: number[][] = [
  [-1, -1, -1],
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1],
  [1, -1],
  [-2, 1, -2],
  [2, -1, 2],
  [0],
  [3, -1, -1],
  [-3, 1, 1],
  [-1, 1, -2, 2],
  [-2, -1],
  [2, 1],
  [-1, -1, 2],
];

const FORMS: Record<number, string[]> = {
  1: ['A'],
  2: ['AB', 'Aa'],
  4: ['AaAB', 'ABAC', 'AaBb', 'ABaC', 'AABC', 'ABAb'],
};

const FORM_ABOUT: Record<string, string> = {
  A: 'Uma ideia só, que caminha até a resolução.',
  AB: 'Pergunta e resposta: A apresenta uma ideia e para em aberto, B responde e resolve.',
  Aa: 'Ideia e variação: repetir com uma mudança dá unidade sem soar igual, e a variação resolve.',
  AaAB: 'A ideia aparece, varia e volta para fixar no ouvido; B traz o contraste e resolve, como o AAB das letras de blues.',
  ABAC: 'A volta como um refrão entre duas respostas diferentes; a última (C) resolve.',
  AaBb: 'Duas ideias, cada uma seguida da sua variação; a variação de B resolve.',
  ABaC: 'Pergunta, resposta, a pergunta variada e uma resposta nova que resolve.',
  AABC: 'A ideia se repete igual para criar expectativa, como o AAB das letras de blues; B e C desenvolvem e resolvem.',
  ABAb: 'A e B se alternam; a volta de B vem variada e resolve.',
};

const DEGREES: Record<string, [Role, string, string]> = {
  R: ['Repouso', 'tônica', 'o ponto de maior repouso'],
  '5': ['Estável', '5ª', 'estável e neutra'],
  b3: [
    'Tensão',
    '3ª menor',
    'blue note contra a 3ª maior do acorde, o choque típico do blues',
  ],
  '3': ['Estável', '3ª maior', 'define o som maior'],
  b7: ['Estável', '7ª menor', 'nota do acorde dominante, o sabor do blues'],
  '6': ['Cor', '6ª', 'cor doce e aberta, tensão leve'],
  '4': ['Tensão', '4ª', 'pede resolução na 5ª ou na 3ª'],
  '2': ['Tensão', '2ª (9ª)', 'pede resolução na tônica ou na 3ª'],
  b5: ['Tensão', '5ª diminuta', 'blue note entre a 4ª e a 5ª'],
};

export const LICK_BARS = [1, 2, 4] as const;

export const LICK_STYLES = STYLES.map(({ id, name }) => ({ id, name }));

const EASY_CELLS: Cell[] = [
  'quarter',
  'shuffle',
  'restShuffle',
  'rest',
  'half',
  'longShort',
];
const EASY_MIN_NOTE = 2 * T - EPSILON;

const easyStyle = (style: Style): Style => ({
  ...style,
  rhythm: Object.fromEntries(
    Object.entries(style.rhythm).filter(([cell]) =>
      EASY_CELLS.includes(cell as Cell),
    ),
  ),
  bend: 0,
  legato: 0.2,
  easy: true,
});

const easyFragment = (f: Fragment) =>
  f.steps.every((step) => !/[\^rc]$/.test(step)) &&
  f.rhythm.every((d) => d < 0 || d >= EASY_MIN_NOTE);

export const newLickSeed = () =>
  Math.floor(Math.random() * 36 ** 6).toString(36);

export function seededRandom(seed: string): Random {
  let state = parseInt(seed, 36) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const span = (cell: number[]) => sum(cell.map(Math.abs));
const isChordTone = (note: PoolNote) =>
  !note.blue && CHORD_TONES.includes(note.degree);

function weighted<T>(random: Random, options: Weighted<T>): T {
  let r = random() * sum(options.map(([, w]) => w));
  for (const [value, w] of options) if ((r -= w) < 0) return value;
  return options[options.length - 1][0];
}

const oneOf = <T>(random: Random, items: T[]) =>
  items[Math.floor(random() * items.length)];

function moveBy(pool: PoolNote[], i: number, delta: number) {
  let j = i;
  for (let k = 0; k < Math.abs(delta); k++) {
    do j += Math.sign(delta);
    while (pool[j]?.passing);
  }
  return j >= 0 && j < pool.length ? j : undefined;
}

const stepFrom = (pool: PoolNote[], i: number, delta: number) =>
  moveBy(pool, i, delta) ?? moveBy(pool, i, -delta) ?? i;

function bendSource(pool: PoolNote[], i: number) {
  const j = pool.findIndex((n) => !n.blue && n.midi === pool[i].midi - 2);
  const source = pool[j];
  return source && source.fret > 0 && source.string <= 3 ? j : undefined;
}

type Mark = 'bend' | 'release' | 'curl' | 'plain';
const MARKS: Record<string, Mark> = { '^': 'bend', r: 'release', c: 'curl' };

interface Hit {
  start: number;
  duration: number;
}

interface Cliche {
  name: string;
  from: number;
  count: number;
}

const within = (frags: Cliche[], notes: number, shift = 0) =>
  frags
    .filter((f) => f.from + f.count <= notes)
    .map((f) => ({ ...f, from: f.from + shift }));

interface Phrase {
  hits: Hit[];
  idx: number[];
  marks: (Mark | undefined)[];
  frags: Cliche[];
  about?: string;
}

function contour(
  random: Random,
  count: number,
  bias: number,
  easy = false,
): number[] {
  const out: number[] = [];
  while (out.length < count) {
    out.push(
      ...weighted(
        random,
        MOVES.filter((m) => !easy || m.every((step) => Math.abs(step) < 3)).map(
          (m): [number[], number] => [m, Math.sign(sum(m)) === bias ? 3 : 1],
        ),
      ),
    );
  }
  return out.slice(0, count);
}

function walk(
  random: Random,
  pool: PoolNote[],
  from: number,
  hits: Hit[],
  bias: number,
  easy = false,
): number[] {
  const snap = (i: number, hit: Hit) => {
    if (hit.start % 2 > EPSILON || isChordTone(pool[i]) || random() > 0.75)
      return i;
    const near = [moveBy(pool, i, -1), moveBy(pool, i, 1)].filter(
      (j): j is number => j !== undefined && isChordTone(pool[j]),
    );
    return near.length ? oneOf(random, near) : i;
  };
  const moves = contour(random, hits.length, bias, easy);
  const idx: number[] = [];
  let at = pool[from].passing ? stepFrom(pool, from, 1) : from;
  hits.forEach((hit, n) => {
    if (n) at = stepFrom(pool, at, moves[n]);
    at = snap(at, hit);
    idx.push(at);
  });
  return idx;
}

function place(
  random: Random,
  pool: PoolNote[],
  fragment: Fragment,
  from: number,
): { idx: number[]; marks: Mark[] } | undefined {
  const idx: number[] = [];
  const marks: Mark[] = [];
  for (const step of fragment.steps) {
    const [, dir, degree, sign] = /^([+-]?)(b?\d|R)([\^rc]?)$/.exec(step)!;
    const mark = MARKS[sign] ?? 'plain';
    const prev = idx.length ? idx[idx.length - 1] : undefined;
    let options = pool.flatMap((n, i) => (n.degree === degree ? [i] : []));
    if (mark === 'release' && prev !== undefined) {
      const source = bendSource(pool, prev);
      options = source === undefined ? [] : [source];
    } else if (prev !== undefined && dir) {
      options = options.filter((i) =>
        dir === '+'
          ? pool[i].midi > pool[prev].midi
          : pool[i].midi < pool[prev].midi,
      );
    }
    if (!options.length) return undefined;
    const target = pool[prev ?? from].midi;
    const distance = (i: number) => Math.abs(pool[i].midi - target);
    const nearest = Math.min(...options.map(distance));
    const pickFrom =
      prev === undefined
        ? options.filter((i) => distance(i) <= 7)
        : options.filter((i) => distance(i) === nearest);
    idx.push(oneOf(random, pickFrom.length ? pickFrom : options));
    marks.push(mark);
  }
  return { idx, marks };
}

function phrase(
  random: Random,
  style: Style,
  pool: PoolNote[],
  from: number,
  bias: number,
  beats: number,
): Phrase {
  const minor = pool.some((n) => !n.blue && n.degree === 'b3');
  const out: Phrase = { hits: [], idx: [], marks: [], frags: [] };
  let t = 0;
  let at = from;
  const push = (cell: number[], idx: number[], marks?: Mark[]) => {
    let k = 0;
    for (const d of cell) {
      if (d > 0) {
        out.hits.push({ start: t, duration: d });
        out.idx.push(idx[k]);
        out.marks.push(marks?.[k]);
        k++;
      }
      t += Math.abs(d);
    }
    at = out.idx.length ? out.idx[out.idx.length - 1] : at;
  };
  while (beats - t > EPSILON) {
    const left = beats - t + EPSILON;
    const fragments = FRAGMENTS.filter(
      (f) =>
        f.minor === minor &&
        span(f.rhythm) <= left &&
        (!style.easy || easyFragment(f)),
    );
    if (fragments.length && random() < style.fragments) {
      const fragment = oneOf(random, fragments);
      const placed = place(random, pool, fragment, at);
      if (placed) {
        out.frags.push({
          name: fragment.name,
          from: out.idx.length,
          count: placed.idx.length,
        });
        push(fragment.rhythm, placed.idx, placed.marks);
        continue;
      }
    }
    const cells = (Object.entries(style.rhythm) as [Cell, number][]).filter(
      ([cell]) => span(CELLS[cell]) <= left,
    );
    const cell = cells.length ? CELLS[weighted(random, cells)] : [beats - t];
    const start = t;
    const hits = cell
      .map((d, k) => ({ d, at: start + span(cell.slice(0, k)) }))
      .filter(({ d }) => d > 0)
      .map(({ d, at }) => ({ start: at, duration: d }));
    const begin = out.idx.length
      ? stepFrom(pool, at, oneOf(random, [-1, 1]))
      : at;
    push(
      cell,
      hits.length ? walk(random, pool, begin, hits, bias, style.easy) : [],
    );
  }
  return out;
}

const direction = (idx: number[]) => Math.sign(idx[idx.length - 1] - idx[0]);

function newPhrase(
  random: Random,
  style: Style,
  pool: PoolNote[],
  from: number,
  bias: number,
): Phrase {
  let out = phrase(random, style, pool, from, bias, BAR);
  while (out.hits.length < 2)
    out = phrase(random, style, pool, from, bias, BAR);
  return out;
}

function vary(
  random: Random,
  style: Style,
  pool: PoolNote[],
  base: Phrase,
): Phrase {
  const shifts = base.idx.some((i) => pool[i].passing)
    ? []
    : [-2, -1, 1, 2].filter((k) =>
        base.idx.every((i) => moveBy(pool, i, k) !== undefined),
      );
  if (shifts.length && random() < 0.5) {
    const k = oneOf(random, shifts);
    return {
      ...base,
      idx: base.idx.map((i) => moveBy(pool, i, k)!),
      about: `Sequência: o mesmo desenho ${Math.abs(k)} nota${Math.abs(k) > 1 ? 's' : ''} da escala ${k > 0 ? 'acima' : 'abaixo'}, mesmo ritmo.`,
    };
  }
  const half = BAR / 2;
  const kept = base.hits.filter((h) => h.start < half - EPSILON);
  const from = base.idx[Math.max(0, kept.length - 1)];
  const tail = phrase(
    random,
    style,
    pool,
    stepFrom(pool, from, oneOf(random, [-1, 1])),
    -direction(base.idx) || 1,
    half,
  );
  return {
    hits: [
      ...kept.map((h) => ({
        ...h,
        duration: Math.min(h.duration, half - h.start),
      })),
      ...tail.hits.map((h) => ({ ...h, start: h.start + half })),
    ],
    idx: [...base.idx.slice(0, kept.length), ...tail.idx],
    marks: [...base.marks.slice(0, kept.length), ...tail.marks],
    frags: [
      ...within(base.frags, kept.length),
      ...within(tail.frags, tail.idx.length, kept.length),
    ],
    about: 'Mesmo começo, outra resposta na segunda metade do compasso.',
  };
}

function resolve(
  random: Random,
  style: Style,
  pool: PoolNote[],
  base: Phrase,
): Phrase {
  const length = random() < style.longEnding ? 2 : 1;
  const end = BAR - length;
  const kept = base.hits.filter((h) => h.start < end - EPSILON);
  const idx = base.idx.slice(0, kept.length);
  const from = idx.at(-1) ?? base.idx[0];
  const degree = random() < 0.75 ? 'R' : '5';
  const targets = pool.flatMap((n, i) =>
    !n.blue && n.degree === degree ? [i] : [],
  );
  const target = targets.reduce((best, i) =>
    Math.abs(i - from) < Math.abs(best - from) ? i : best,
  );
  return {
    ...base,
    hits: [
      ...kept.map((h) => ({
        ...h,
        duration: Math.min(h.duration, end - h.start),
      })),
      { start: end, duration: length },
    ],
    idx: [...idx, target],
    marks: [...base.marks.slice(0, kept.length), undefined],
    frags: within(base.frags, kept.length),
  };
}

type Played = Omit<LickNote, 'role' | 'why'>;

function ornament(
  random: Random,
  style: Style,
  pool: PoolNote[],
  entries: { hit: Hit; i: number; mark?: Mark }[],
): Played[] {
  const out: Played[] = [];
  entries.forEach(({ hit, i, mark }) => {
    const at = pool[i];
    const source = bendSource(pool, i);
    const bend =
      source !== undefined &&
      (mark === 'bend' ||
        (!mark && hit.duration >= 0.5 && random() < style.bend));
    const release = mark === 'release';
    const fretted = bend ? pool[source] : at;
    out.push({
      string: fretted.string,
      fret: fretted.fret,
      midi: fretted.midi,
      note: at.note,
      degree: at.degree,
      blue: at.blue,
      sound: at.midi,
      start: hit.start,
      duration: hit.duration,
      technique: release ? 'r' : undefined,
      bend: bend || undefined,
      curl: mark === 'curl' || undefined,
      vibrato: hit.duration >= 1 && random() < 0.7 ? true : undefined,
    });
  });
  out[out.length - 1].vibrato = true;
  out.forEach((note, n) => {
    const prev = out[n - 1];
    if (
      prev &&
      !prev.bend &&
      !note.bend &&
      !note.technique &&
      prev.string === note.string &&
      Math.abs(note.fret - prev.fret) >= SHIFT_FRETS
    ) {
      note.technique = note.fret > prev.fret ? '/' : '\\';
      return;
    }
    if (
      !prev ||
      prev.bend ||
      note.bend ||
      note.technique ||
      prev.string !== note.string ||
      prev.fret === note.fret ||
      note.start - prev.start > 0.5 + EPSILON ||
      note.start - (prev.start + prev.duration) > EPSILON ||
      random() > style.legato
    )
      return;
    const up = note.fret > prev.fret;
    note.technique = random() < 0.2 ? (up ? '/' : '\\') : up ? 'h' : 'p';
  });
  return out;
}

const beatOf = (start: number) => start % BAR;
const FRACTIONS: [number, string][] = [
  [1 / 6, '⅙'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
  [5 / 6, '⅚'],
];

export function beatLabel(start: number) {
  const beat = beatOf(start);
  const whole = Math.floor(beat + EPSILON);
  const fraction = FRACTIONS.find(
    ([f]) => Math.abs(beat - whole - f) < EPSILON,
  )?.[1];
  return `c${Math.floor(start / BAR + EPSILON) + 1} · t${whole + 1}${fraction ? ` +${fraction}` : ''}`;
}

const named = (note: PoolNote) => `${note.note} (${note.degree})`;
const roleOf = (note: PoolNote) =>
  note.blue ? 'Tensão' : (DEGREES[note.degree]?.[0] ?? 'Cor');
const stable = (note: PoolNote) =>
  ['Repouso', 'Estável'].includes(roleOf(note));

function why(
  pool: PoolNote[],
  notes: Played[],
  idx: number[],
  n: number,
): string {
  const note = notes[n];
  const at = pool[idx[n]];
  const prev = n > 0 ? pool[idx[n - 1]] : undefined;
  const next = n < notes.length - 1 ? pool[idx[n + 1]] : undefined;
  const step = (a: number, b: number) => Math.abs(idx[a] - idx[b]);
  const strong = beatOf(note.start) % 2 < EPSILON;
  const phraseStart =
    n === 0 ||
    Math.floor(notes[n - 1].start / BAR + EPSILON) !==
      Math.floor(note.start / BAR + EPSILON);
  const role = roleOf(at);
  const [, name, about] = DEGREES[at.degree] ?? ['Cor', at.degree, ''];
  const Name = name[0].toUpperCase() + name.slice(1);
  const resolves = !!next && stable(next) && step(n, n + 1) === 1;
  const source = () => named(pool[bendSource(pool, idx[n])!]);

  if (!next) {
    const arrival = note.bend ? ` Chega pelo bend, saindo de ${source()}.` : '';
    return at.degree === 'R'
      ? `Resolução na tônica: repouso total, a frase termina.${arrival}`
      : `Termina na 5ª: repousa, mas deixa um leve gosto de continuação.${arrival}`;
  }
  if (note.bend) {
    const effect = {
      Tensão: 'estica a nota até a tensão, criando expectativa',
      Cor: 'estica a nota até a cor, um choro expressivo',
      Estável: 'sai da tensão e resolve dentro do próprio bend',
      Repouso: 'sai da tensão e resolve dentro do próprio bend',
    }[role];
    return `Bend de ${source()} até ${named(at)}: ${effect}.`;
  }
  if (note.technique === 'r') {
    return `Release: solta o bend e volta para ${named(at)}; a nota sobe e desce como uma voz.`;
  }
  if (
    (note.technique === '/' || note.technique === '\\') &&
    Math.abs(note.fret - notes[n - 1].fret) >= SHIFT_FRETS
  ) {
    return `Slide até ${named(at)}: a mão desliza pela corda e muda de região do braço.`;
  }
  if (note.curl) {
    return 'Curl na 3ª menor: um quarto de tom puxado em direção à 3ª maior, a ambiguidade maior/menor do blues.';
  }
  if (at.blue) {
    return at.degree === 'b5'
      ? `Blue note (b5): cromatismo entre a 4ª e a 5ª, o som mais característico do blues. ${note.duration < 0.5 ? 'Passa rápido, sem parar nela.' : 'Sustentada, é a tensão máxima da escala blues.'}`
      : 'Blue note (b3): a 3ª menor contra a 3ª maior; o choque resolve logo na 3ª maior.';
  }
  if (n === notes.length - 2 && step(n, n + 1) <= 1 && !stable(at)) {
    return `Aproximação: a ${name}, vizinha da nota final, conduz à resolução.`;
  }
  if (phraseStart) {
    return stable(at)
      ? `Começa a frase na ${name}, nota do acorde: ponto de partida firme.`
      : `Começa a frase na ${name}, fora do acorde: já nasce pedindo movimento.`;
  }
  if (prev && idx[n - 1] === idx[n]) {
    return 'Nota repetida: reforça o ritmo, um recurso típico do blues.';
  }
  if (strong) {
    return stable(at)
      ? `Tempo forte na ${name}, nota do acorde: ponto de apoio da frase.`
      : `${Name} no tempo forte: ${about}, cria expectativa${resolves ? ` e resolve em ${named(next)} logo em seguida` : ''}.`;
  }
  if (note.duration >= 1 && stable(at)) {
    return `Nota longa na ${name}: um respiro de repouso no meio da frase.`;
  }
  if (step(n, n - 1) >= 3) {
    return `Salto até ${named(at)}: dá energia; a frase compensa voltando por grau conjunto.`;
  }
  if (step(n, n - 1) === 1 && idx[n - 1] === idx[n + 1]) {
    return `Bordadura: sai de ${named(prev!)} e volta, enfeitando a nota.`;
  }
  if (
    step(n, n - 1) === 1 &&
    step(n, n + 1) === 1 &&
    Math.sign(idx[n] - idx[n - 1]) === Math.sign(idx[n + 1] - idx[n])
  ) {
    return `Nota de passagem em tempo fraco: liga ${named(prev!)} a ${named(next)}.`;
  }
  if (!stable(at) && resolves) {
    return `${Name} em tempo fraco: ${about}, e resolve em ${named(next)} logo depois.`;
  }
  return role === 'Tensão'
    ? `${Name} em tempo fraco: ${about}; passa sem peso.`
    : role === 'Cor'
      ? `${Name} em tempo fraco: ${about}; colore sem pesar.`
      : `${Name} em tempo fraco: nota do acorde, mantém a frase firme.`;
}

function describeBar(
  pool: PoolNote[],
  notes: Played[],
  idx: number[],
  bar: number,
  last: boolean,
  frags: string[],
): string {
  const inBar = notes
    .map((note, n) => ({ note, i: idx[n] }))
    .filter(({ note }) => Math.floor(note.start / BAR + EPSILON) === bar);
  const first = inBar[0];
  const end = inBar[inBar.length - 1];
  const pitches = inBar.map(({ note }) => note.sound);
  const climb = end.note.sound - first.note.sound;
  const range = Math.max(...pitches) - Math.min(...pitches);
  const gaps = inBar.filter(
    ({ note }, k) =>
      k > 0 &&
      note.start - (inBar[k - 1].note.start + inBar[k - 1].note.duration) >=
        T - EPSILON,
  ).length;

  const entry =
    beatOf(first.note.start) > EPSILON
      ? `Entra depois do tempo 1, em ${named(pool[first.i])}: a pausa inicial faz a frase respirar.`
      : `Começa no tempo 1, em ${named(pool[first.i])}.`;
  const shape =
    climb <= -3
      ? 'O desenho desce'
      : climb >= 3
        ? 'O desenho sobe'
        : range >= 5
          ? 'O desenho faz um arco e volta perto de onde começou'
          : 'O desenho gira em torno da mesma região';
  const pauses = gaps
    ? `, com ${gaps > 1 ? 'pausas que separam' : 'uma pausa que separa'} os motivos`
    : '';
  const cliches = frags.length ? ` Clichês de blues: ${frags.join('; ')}.` : '';
  const ending = last
    ? `Fecha resolvendo em ${named(pool[end.i])}: repouso.`
    : stable(pool[end.i])
      ? `Para em ${named(pool[end.i])}, nota do acorde: repouso parcial antes da próxima ideia.`
      : `Para em ${named(pool[end.i])}, fora do acorde: fica em aberto, como uma pergunta.`;
  return `${entry} ${shape}${pauses}.${cliches} ${ending}`;
}

function tab(notes: Played[], beats: number) {
  const lines = STRING_NAMES.map(() => '');
  const cells: TabCell[] = [];
  const units = (b: number) => Math.round(b * 4);
  const pad = (n: number) =>
    lines.forEach((_, s) => (lines[s] += '-'.repeat(Math.max(0, n))));
  let time = 0;
  let bar = 0;
  const advance = (to: number) => {
    while (to >= (bar + 1) * BAR - EPSILON) {
      bar++;
      pad(units(bar * BAR - time) + 1);
      lines.forEach((_, s) => (lines[s] += '|'));
      time = bar * BAR;
    }
    pad(units(to - time));
    time = to;
  };
  for (const note of notes) {
    advance(note.start);
    const token = `${note.technique ?? ''}${note.fret}${note.bend ? `b${note.fret + 2}` : ''}${note.curl ? 'b¼' : ''}${note.vibrato ? '~' : ''}`;
    cells.push({ column: lines[0].length + 3, width: token.length });
    lines.forEach(
      (_, s) =>
        (lines[s] +=
          s === note.string - 1 ? `-${token}` : '-'.repeat(token.length + 1)),
    );
    pad(units(note.duration) - 1);
    time = note.start + note.duration;
  }
  advance(beats);
  return {
    lines: lines.map((line, s) => `${STRING_NAMES[s]}|${line}`),
    cells,
  };
}

export function generateLick(
  pool: PoolNote[],
  bars: number,
  random: Random = Math.random,
  {
    style: styleId,
    easy = false,
    climb = false,
  }: { style?: string; easy?: boolean; climb?: boolean } = {},
): Lick {
  const picked = STYLES.find((s) => s.id === styleId) ?? oneOf(random, STYLES);
  const style = easy ? easyStyle(picked) : picked;
  const form = oneOf(random, FORMS[bars] ?? FORMS[2]);
  const chordTones = pool.flatMap((n, i) => (isChordTone(n) ? [i] : []));
  const phrases: Record<string, Phrase> = {};
  const played: Phrase[] = [];
  let from = oneOf(random, chordTones);
  let bias = random() < 0.6 ? -1 : 1;

  const upper = chordTones.filter((i) => i >= pool.length * 0.6);
  for (const [bar, letter] of [...form].entries()) {
    if (climb && upper.length && bar >= form.length / 2 && bar > 0)
      from = oneOf(random, upper);
    const base = phrases[letter.toUpperCase()];
    const next =
      letter === letter.toUpperCase()
        ? (base ?? newPhrase(random, style, pool, from, bias))
        : vary(random, style, pool, base);
    phrases[letter.toUpperCase()] ??= next;
    played.push(next);
    from = stepFrom(
      pool,
      next.idx[next.idx.length - 1],
      oneOf(random, [-2, -1, 1, 2]),
    );
    bias = -direction(next.idx) || bias;
  }
  played[played.length - 1] = resolve(random, style, pool, played.at(-1)!);

  const flat = played.flatMap((p, bar) =>
    p.hits.map((hit, n) => ({
      hit: { ...hit, start: hit.start + bar * BAR },
      i: p.idx[n],
      mark: p.marks[n],
    })),
  );
  flat.forEach((entry, n) => {
    const source = n > 0 ? bendSource(pool, flat[n - 1].i) : undefined;
    if (entry.mark !== 'release') return;
    if (flat[n - 1]?.mark === 'bend' && source !== undefined) entry.i = source;
    else entry.mark = 'plain';
  });
  const idx = flat.map(({ i }) => i);
  const sounded = ornament(random, style, pool, flat);
  const notes: LickNote[] = sounded.map((note, n) => ({
    ...note,
    role: roleOf(pool[idx[n]]),
    why: why(pool, sounded, idx, n),
  }));

  const seen = new Set<string>();
  const barInfo = [...form].map((letter, bar) => {
    const upper = letter.toUpperCase();
    const isLast = bar === form.length - 1;
    const label =
      letter !== upper
        ? `Variação de ${upper}`
        : seen.has(upper)
          ? `${upper} de novo`
          : `Ideia ${upper}`;
    seen.add(upper);
    const about =
      letter !== upper
        ? `${played[bar].about} `
        : label.endsWith('de novo')
          ? 'Repete a ideia igual, para fixá-la no ouvido. '
          : '';
    return {
      label: `Compasso ${bar + 1} · ${label}${isLast ? ' + resolução' : ''}`,
      text:
        about +
        describeBar(pool, sounded, idx, bar, isLast, [
          ...new Set(played[bar].frags.map((f) => f.name)),
        ]),
    };
  });

  const tonic = pool.find((n) => n.degree === 'R')!.note;
  const chord = `${tonic}7`;
  const beats = bars * BAR;
  const { lines, cells } = tab(notes, beats);
  return {
    style: style.name,
    form,
    summary: `${FORM_ABOUT[form]} Estilo ${style.name.toLowerCase()}: ${style.about}. As funções das notas são pensadas sobre o acorde de ${chord}.`,
    bars: barInfo,
    beats,
    notes,
    tab: lines,
    cells,
  };
}
