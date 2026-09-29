import { Chord, Interval, Note, Scale } from 'tonal';

export const TUNINGS: Record<string, string[]> = {
  standard: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'drop-d': ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'half-step-down': ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'],
};

export const LABEL_MODES = ['notes', 'intervals', 'degrees'] as const;
export type LabelMode = (typeof LABEL_MODES)[number];
export type FretRole = 'root' | 'chord-tone' | 'scale-tone' | 'outside';

export interface Spelled {
  notes: string[];
  intervals: string[];
}

export interface DegreeContext {
  root: string;
  chord?: Spelled;
}

export interface FretPosition {
  string: number;
  fret: number;
  note: string;
  label: string;
  role: FretRole;
  midi: number;
}

export function intervalLabel(name: string): string {
  const { num, alt } = Interval.get(name);
  if (num === 1 && alt === 0) return 'R';
  return (alt > 0 ? '#'.repeat(alt) : 'b'.repeat(-alt)) + num;
}

export const sameNote = (a: string, b: string) =>
  Note.chroma(a) === Note.chroma(b);

export function spellScale(root: string, tonalName: string): Spelled {
  const { notes, intervals } = Scale.get(`${root} ${tonalName}`);
  return { notes, intervals: intervals.map(intervalLabel) };
}
export function spellSymmetric(root: string, intervals: string[]): Spelled {
  return {
    notes: intervals.map((i) => Note.simplify(Note.transpose(root, i))),
    intervals: intervals.map(intervalLabel),
  };
}

export function spellChord(root: string, tonalType: string): Spelled {
  const { notes, intervals } = Chord.getChord(tonalType, root);
  return { notes, intervals: intervals.map(intervalLabel) };
}

const hasDoubleSharp = (s: Spelled) => s.notes.some((n) => n.includes('##'));

export function withoutDoubleSharps(
  root: string,
  spell: (root: string) => Spelled,
): Spelled & { root: string } {
  const spelled = spell(root);
  if (!hasDoubleSharp(spelled)) return { root, ...spelled };

  if (root.includes('#')) {
    const flat = Note.enharmonic(root);
    const respelled = spell(flat);
    if (!hasDoubleSharp(respelled)) return { root: flat, ...respelled };
  }

  return {
    root,
    notes: spelled.notes.map((n) => (n.includes('##') ? Note.simplify(n) : n)),
    intervals: spelled.intervals,
  };
}

export function parsePitchClass(value: string): string | undefined {
  const n = Note.get(value);
  if (n.empty || n.oct !== undefined || Math.abs(n.alt) > 1) return undefined;
  return n.pc;
}

export function parseContext(value: string): DegreeContext | undefined {
  const pc = parsePitchClass(value);
  if (pc) return { root: pc };
  const c = Chord.get(value);
  if (c.empty || !c.tonic) return undefined;
  return {
    root: c.tonic,
    chord: { notes: c.notes, intervals: c.intervals.map(intervalLabel) },
  };
}

export function parseTuning(value: string): string[] | undefined {
  if (TUNINGS[value]) return TUNINGS[value];
  const notes = value.split(',');
  if (notes.length !== 6 || notes.some((n) => Note.get(n).empty)) {
    return undefined;
  }
  return notes;
}

export function openMidis(tuning: string[]): number[] {
  return tuning.reduce<number[]>((acc, note, i) => {
    const midi = Note.midi(note);
    if (midi !== null) return [...acc, midi];
    const prev = i ? acc[i - 1] : 40; // E2
    const chroma = Note.chroma(note);
    return [...acc, prev + ((chroma - (prev % 12) + 12) % 12 || 12)];
  }, []);
}

export function degreeLabel(context: DegreeContext, note: string): string {
  const { chord } = context;
  const chordIdx = chord?.notes.findIndex((n) => sameNote(n, note)) ?? -1;
  if (chordIdx !== -1) return chord!.intervals[chordIdx];

  const interval = Interval.distance(context.root, note);
  const label = intervalLabel(interval);
  const { num } = Interval.get(interval);
  return chord && [2, 4, 6].includes(num)
    ? label.replace(/\d+$/, String(num + 7))
    : label;
}

export interface FretboardInput extends Spelled {
  root: string;
  toneRole: 'chord-tone' | 'scale-tone';
  tuning: string[];
  frets: number;
  labelMode: LabelMode;
  context?: DegreeContext;
}

export function fretboardPositions(input: FretboardInput): FretPosition[] {
  const {
    root,
    notes,
    intervals,
    toneRole,
    tuning,
    frets,
    labelMode,
    context,
  } = input;

  const label = (note: string, i: number) => {
    if (labelMode === 'notes') return note;
    if (labelMode === 'intervals') return intervals[i];
    return degreeLabel(context!, note);
  };

  const midis = openMidis(tuning);
  return tuning.flatMap((open, idx) => {
    const string = tuning.length - idx;
    const openChroma = Note.chroma(open);
    const positions: FretPosition[] = [];
    for (let fret = 0; fret <= frets; fret++) {
      const i = notes.findIndex(
        (n) => Note.chroma(n) === (openChroma + fret) % 12,
      );
      if (i === -1) continue;
      const note = notes[i];
      positions.push({
        string,
        fret,
        note,
        label: label(note, i),
        role: sameNote(note, root) ? 'root' : toneRole,
        midi: midis[idx] + fret,
      });
    }
    return positions;
  });
}

const compareScores = (a: number[], b: number[]) =>
  a.reduce((diff, v, i) => diff || v - b[i], 0);

export interface Voicing {
  frets: (number | null)[];
  baseFret: number;
  barre: Barre | null;
  positions: FretPosition[];
}

export interface Barre {
  fret: number;
  fromString: number;
  toString: number;
}

export function findBarre(frets: (number | null)[]): Barre | null {
  const fretted = frets.filter((f): f is number => f !== null && f > 0);
  if (!fretted.length) return null;
  const fret = Math.min(...fretted);
  const first = frets.indexOf(fret);
  const last = frets.lastIndexOf(fret);
  if (first === last) return null;
  const covered = frets.slice(first, last + 1);
  if (covered.some((f) => f === null || f < fret)) return null;
  return {
    fret,
    fromString: frets.length - first,
    toString: frets.length - last,
  };
}

export interface VoicingInput extends Spelled {
  root: string;
  tuning: string[];
  labelMode: Exclude<LabelMode, 'degrees'>;
}

const MAX_POSITION = 12;
const HAND_SPAN = 3;
const OPEN_POSITION_MAX_FRET = 4;

export function chordVoicings(input: VoicingInput): Voicing[] {
  const { root, notes, intervals, tuning, labelMode } = input;
  const chromas = notes.map((n) => Note.chroma(n));
  const rootChroma = Note.chroma(root);
  const optional = notes.length >= 5 ? intervals.indexOf('5') : -1;
  const required = chromas.filter((_, i) => i !== optional);
  const open = tuning.map((n) => Note.chroma(n));
  const midis = openMidis(tuning);

  type Candidate = {
    frets: (number | null)[];
    position: number;
    score: number[];
  };
  const byPosition = new Map<number, Candidate>();

  const consider = (frets: (number | null)[]) => {
    const played = frets.flatMap((f, i) => (f === null ? [] : [i]));
    if (played.length < 3) return;
    if (played[played.length - 1] - played[0] + 1 !== played.length) return;
    const pcs = played.map((i) => (open[i] + frets[i]!) % 12);
    if (pcs[0] !== rootChroma) return;
    if (!required.every((c) => pcs.includes(c))) return;

    const fretted = frets.filter((f): f is number => f !== null && f > 0);
    const minFret = Math.min(...fretted);
    const maxFret = Math.max(0, ...fretted);
    
    const fingers =
      fretted.filter((f) => f > minFret).length + (fretted.length ? 1 : 0);
    if (fingers > 4) return;

    const position =
      maxFret <= OPEN_POSITION_MAX_FRET && fretted.length < played.length
        ? 0
        : minFret;
    const score = [
      played.length,
      chromas.every((c) => pcs.includes(c)) ? 1 : 0,
      -(maxFret - (fretted.length ? minFret : 0)),
      -fingers,
    ];
    const best = byPosition.get(position);
    if (!best || compareScores(score, best.score) > 0) {
      byPosition.set(position, { frets, position, score });
    }
  };

  for (let base = 1; base <= MAX_POSITION; base++) {
    const options = open.map((o) => {
      const frets: (number | null)[] = [null];
      for (let f = base === 1 ? 0 : base; f <= base + HAND_SPAN; f++) {
        if (chromas.includes((o + f) % 12)) frets.push(f);
      }
      return frets;
    });
    const walk = (i: number, acc: (number | null)[]) => {
      if (i === options.length) return consider(acc);
      for (const f of options[i]) walk(i + 1, [...acc, f]);
    };
    walk(0, []);
  }

  return [...byPosition.values()]
    .sort((a, b) => a.position - b.position)
    .map(({ frets }) => {
      const fretted = frets.filter((f): f is number => f !== null && f > 0);
      const maxFret = Math.max(0, ...fretted);
      return {
        frets,
        baseFret: maxFret <= OPEN_POSITION_MAX_FRET ? 1 : Math.min(...fretted),
        barre: findBarre(frets),
        positions: frets.flatMap((fret, idx) => {
          if (fret === null) return [];
          const i = chromas.indexOf((open[idx] + fret) % 12);
          return [
            {
              string: tuning.length - idx,
              fret,
              note: notes[i],
              label: labelMode === 'notes' ? notes[i] : intervals[i],
              role: sameNote(notes[i], root) ? 'root' : 'chord-tone',
              midi: midis[idx] + fret,
            } satisfies FretPosition,
          ];
        }),
      };
    });
}

export const POSITION_COUNT = 5;

const PENTATONIC_INTERVALS = {
  minor: ['1P', '3m', '4P', '5P', '7m'],
  major: ['1P', '2M', '3M', '5P', '6M'],
} as const;

export function pentatonicBox(
  root: string,
  template: keyof typeof PENTATONIC_INTERVALS,
  position: number,
  tuning: string[],
): { lo: number; hi: number }[] {
  const chromas = PENTATONIC_INTERVALS[template].map((i) =>
    Note.chroma(Note.transpose(root, i)),
  );
  const open = openMidis(tuning);
  const up = (pitch: number, chroma: number) =>
    pitch + ((chroma - (pitch % 12) + 12) % 12 || 12);

  const start = position - 1;
  let pitch = open[0] + ((chromas[start] - (open[0] % 12) + 12) % 12);
  const pitches: number[] = [];
  for (let i = start; pitches.length < open.length * 2; i++) {
    pitches.push(pitch);
    pitch = up(pitch, chromas[(i + 1) % chromas.length]);
  }

  const frets = open.map((o, s) => [
    pitches[2 * s] - o,
    pitches[2 * s + 1] - o,
  ]);
  const shift = frets.flat().some((f) => f < 0) ? 12 : 0;
  return frets.map(([lo, hi]) => ({ lo: lo + shift, hi: hi + shift }));
}

export function arpeggioBoxTemplate(
  root: string,
  arpeggio: Spelled,
): keyof typeof PENTATONIC_INTERVALS {
  const held = (template: keyof typeof PENTATONIC_INTERVALS) => {
    const scale = PENTATONIC_INTERVALS[template].map((i) =>
      Note.transpose(root, i),
    );
    return arpeggio.notes.filter((n) => scale.some((s) => sameNote(s, n)))
      .length;
  };
  const minor = held('minor');
  const major = held('major');
  if (minor !== major) return minor > major ? 'minor' : 'major';
  return arpeggio.intervals.includes('b3') ? 'minor' : 'major';
}

export function scalePositionFrets(
  notes: string[],
  box: { lo: number; hi: number }[],
  tuning: string[],
): Set<string> {
  const chromas = notes.map((n) => Note.chroma(n));
  const open = openMidis(tuning);
  const taken = new Set<number>();
  const keys = new Set<string>();
  box.forEach(({ lo, hi }, idx) => {
    for (let fret = Math.max(0, lo - 1); fret <= hi + 1; fret++) {
      const pitch = open[idx] + fret;
      if (!chromas.includes(pitch % 12) || taken.has(pitch)) continue;
      taken.add(pitch);
      keys.add(`${tuning.length - idx}:${fret}`);
    }
  });
  return keys;
}

const LOWEST_GUITAR_MIDI = 40;

export function scaleOctaveMidis(notes: string[]): number[] {
  const midis: number[] = [];
  let pitch =
    LOWEST_GUITAR_MIDI +
    ((Note.chroma(notes[0]) - LOWEST_GUITAR_MIDI + 120) % 12);
  for (const note of [...notes, notes[0]]) {
    if (midis.length)
      pitch += (Note.chroma(note) - (pitch % 12) + 12) % 12 || 12;
    midis.push(pitch);
  }
  return midis;
}

export const containsAll = (container: string[], notes: string[]) =>
  notes.every((n) => container.some((c) => sameNote(c, n)));

export const samePitches = (a: string[], b: string[]) =>
  a.length === b.length && containsAll(a, b) && containsAll(b, a);

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export function romanNumeral(tonic: string, note: string): string {
  const label = intervalLabel(Interval.distance(tonic, note));
  if (label === 'R') return 'I';
  const [, accidental, num] = /^([#b]*)(\d+)$/.exec(label)!;
  return accidental + ROMAN[Number(num) - 1];
}

export interface ChordType {
  id: string;
  suffix: string;
  tonal: string;
}

export function matchChordType<T extends ChordType>(
  intervals: string[],
  types: T[],
): T | undefined {
  const formula = intervals.join(' ');
  return types.find(
    (t) => spellChord('C', t.tonal).intervals.join(' ') === formula,
  );
}

export interface FieldChord extends Spelled {
  degree: string;
  chordId: string;
  root: string;
  symbol: string;
}

export function fieldChord(
  scale: string[],
  degree: number,
  size: 3 | 4,
  types: ChordType[],
): FieldChord {
  const notes = Array.from(
    { length: size },
    (_, i) => scale[(degree + 2 * i) % scale.length],
  );
  const root = notes[0];
  const intervals = notes.map((n) => intervalLabel(Interval.distance(root, n)));
  const type = matchChordType(intervals, types);
  if (!type) throw new Error(`No chord type for ${notes.join(' ')}`);
  return {
    degree: romanNumeral(scale[0], root) + type.suffix,
    chordId: type.id,
    root,
    symbol: root + type.suffix,
    notes,
    intervals,
  };
}

export const harmonicField = (
  scale: string[],
  size: 3 | 4,
  types: ChordType[],
): FieldChord[] => scale.map((_, i) => fieldChord(scale, i, size, types));

export const plainRoot = (note: string) =>
  /bb|##/.test(note) ? Note.simplify(note) : note;

export type Consonance = 'perfect' | 'imperfect' | 'dissonant';

export function consonance(name: string): Consonance {
  const { num, q } = Interval.get(name);
  const simple = num === 8 ? 8 : ((num - 1) % 7) + 1;
  if (q === 'P' && [1, 4, 5, 8].includes(simple)) return 'perfect';
  if ((q === 'M' || q === 'm') && [3, 6].includes(simple)) return 'imperfect';
  return 'dissonant';
}

export function invertInterval(name: string): string {
  const { num } = Interval.get(name);
  if (num === 1) return '8P';
  if (num === 8) return '1P';
  return Interval.invert(Interval.simplify(name));
}

const MAJOR_KEYS = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];
const CHORD_TONE_ROLES = { 1: 3, 2: 5, 3: 7 } as const;

export interface Superimposition {
  chordId: string;
  root: string;
  symbol: string;
  role: 3 | 5 | 7;
  degrees: string[];
  keys: string[];
}

export function superimpositions(
  arpeggio: Spelled,
  types: ChordType[],
): Superimposition[] {
  const found = new Map<string, Superimposition>();
  for (const key of MAJOR_KEYS) {
    const scale = spellScale(key, 'major').notes;
    if (!containsAll(scale, arpeggio.notes)) continue;
    for (const chord of harmonicField(scale, 4, types)) {
      const idx = chord.notes.findIndex((n) => sameNote(n, arpeggio.notes[0]));
      if (idx < 1) continue;
      const id = `${Note.chroma(chord.root)}:${chord.chordId}`;
      const known = found.get(id);
      if (known) {
        known.keys.push(key);
        continue;
      }
      const context = { root: chord.root, chord };
      found.set(id, {
        chordId: chord.chordId,
        root: chord.root,
        symbol: chord.symbol,
        role: CHORD_TONE_ROLES[idx as 1 | 2 | 3],
        degrees: arpeggio.notes.map((n) => degreeLabel(context, n)),
        keys: [key],
      });
    }
  }
  return [...found.values()].sort((a, b) => a.role - b.role);
}

const DEGREE_INTERVALS = ['1P', '2M', '3M', '4P', '5P', '6M', '7M'];
const DEGREE_TOKEN = /^([b#]?)(VII|VI|V|IV|III|II|I)(.*)$/;

export interface ParsedDegree {
  degree: number;
  accidental: '' | 'b' | '#';
  suffix: string;
}

export function parseDegree(token: string): ParsedDegree | undefined {
  const match = DEGREE_TOKEN.exec(token);
  if (!match) return undefined;
  return {
    degree: ROMAN.indexOf(match[2]) + 1,
    accidental: match[1] as ParsedDegree['accidental'],
    suffix: match[3],
  };
}

export function degreeRoot(key: string, { degree, accidental }: ParsedDegree) {
  const { num, q } = Interval.get(DEGREE_INTERVALS[degree - 1]);
  const quality =
    accidental === 'b' ? (q === 'M' ? 'm' : 'd') : accidental === '#' ? 'A' : q;
  return plainRoot(Note.transpose(key, `${num}${quality}`));
}

export type HarmonicFunction =
  'tonic' | 'subdominant' | 'dominant' | 'secondary-dominant';

export function harmonicFunction(
  bar: ParsedDegree,
  root: string,
  chordId: string,
  nextRoot: string,
): HarmonicFunction {
  const resolvesUpAFourth =
    (Note.chroma(nextRoot) - Note.chroma(root) + 12) % 12 === 5;
  if (chordId === 'dom7' && ![1, 5].includes(bar.degree) && resolvesUpAFourth) {
    return 'secondary-dominant';
  }
  if (bar.degree === 6 && bar.accidental === 'b') return 'subdominant';
  if ([1, 3, 6].includes(bar.degree)) return 'tonic';
  if ([2, 4].includes(bar.degree)) return 'subdominant';
  return 'dominant';
}

export function chordScale<T extends { notes: string[] }>(
  candidates: T[],
  chord: string[],
  key: string[],
): T | undefined {
  const shared = (s: T) => s.notes.filter((n) => containsAll(key, [n])).length;
  return candidates
    .filter((s) => containsAll(s.notes, chord))
    .reduce<T | undefined>(
      (best, s) => (!best || shared(s) > shared(best) ? s : best),
      undefined,
    );
}
