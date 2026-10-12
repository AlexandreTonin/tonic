import { Interval, Key, Note } from 'tonal';
import {
  findAllChords,
  findAllIntervals,
  findAllProgressions,
  findAllRhythms,
  findAllScales,
  findChord,
  findInterval,
  findProgression,
  findRhythm,
  findScale,
  type IntervalDef,
  type ProgressionDef,
  type ScaleDef,
} from './catalog';
import {
  arpeggioBoxTemplate,
  chordScale,
  chordVoicings,
  consonance,
  containsAll,
  degreeRoot,
  fieldChord,
  fretboardPositions,
  harmonicField,
  harmonicFunction,
  intervalLabel,
  openMidis,
  invertInterval,
  parseContext,
  parseDegree,
  parsePitchClass,
  parseTuning,
  pentatonicBox,
  plainRoot,
  POSITION_COUNT,
  romanNumeral,
  sameNote,
  smoothVoicings,
  samePitches,
  scaleOctaveMidis,
  scalePositionFrets,
  spellChord,
  spellScale,
  spellSymmetric,
  superimpositions,
  withoutDoubleSharps,
  type LabelMode,
} from './core';
import { generateLick, type PoolNote, seededRandom } from './lick';
import { hitTimes, parseRhythm, rhythmFigures, scoreTaps } from './rhythm';

export const ITEM_TYPES = ['scale', 'chord', 'arpeggio', 'interval'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export interface VoicingsQuery {
  root: string;
  tuning?: string;
  capo?: number;
  labelMode?: 'notes' | 'intervals';
}

export interface HarmonicFieldQuery {
  root: string;
  mode?: 'major' | 'minor';
  size?: 'triads' | 'sevenths';
  dominant?: boolean;
}

export interface FretboardQuery {
  root: string;
  item: string;
  tuning?: string;
  labelMode?: LabelMode;
  frets?: number;
  context?: string;
  position?: number;
  highlight?: string;
}

const spell = (def: ScaleDef, root: string) =>
  'tonal' in def
    ? spellScale(root, def.tonal)
    : spellSymmetric(root, def.intervals);

const tuningOrThrow = (value: string) => {
  const tuning = parseTuning(value);
  if (!tuning) throw new Error(`Invalid tuning: ${value}`);
  return tuning;
};

export const listScales = () =>
  findAllScales().map((def) => ({
    id: def.id,
    name: def.name,
    category: def.category,
    formula: spell(def, 'C').intervals,
    positions: def.boxes ? POSITION_COUNT : 0,
  }));

export function getScale(id: string, root: string) {
  const def = findScale(id);
  if (!def) throw new Error(`Unknown scale ${id}`);
  const spelled = withoutDoubleSharps(root, (r) => spell(def, r));
  return {
    id,
    name: def.name,
    category: def.category,
    ...spelled,
    midi: scaleOctaveMidis(spelled.notes),
  };
}

export const listChords = () =>
  findAllChords().map((def) => ({
    id: def.id,
    name: def.name,
    category: def.category,
    suffix: def.suffix,
    formula: spellChord('C', def.tonal).intervals,
  }));

export function getChord(id: string, root: string) {
  const def = findChord(id);
  if (!def) throw new Error(`Unknown chord ${id}`);
  const spelled = withoutDoubleSharps(root, (r) => spellChord(r, def.tonal));
  return {
    id,
    name: def.name,
    category: def.category,
    symbol: spelled.root + def.suffix,
    ...spelled,
  };
}

export function getChordVoicings(id: string, query: VoicingsQuery) {
  const chord = getChord(id, query.root);
  return chordVoicings({
    root: chord.root,
    notes: chord.notes,
    intervals: chord.intervals,
    tuning: tuningOrThrow(query.tuning ?? 'standard').map((note) =>
      Note.transpose(note, Interval.fromSemitones(query.capo ?? 0)),
    ),
    labelMode: query.labelMode ?? 'notes',
  });
}

export function getScaleChords(id: string, root: string) {
  const scale = getScale(id, root);
  return scale.notes.flatMap((note) =>
    findAllChords()
      .filter((def) =>
        containsAll(scale.notes, spellChord(note, def.tonal).notes),
      )
      .map((def) => ({
        numeral: romanNumeral(scale.root, note),
        degree: romanNumeral(scale.root, note) + def.suffix,
        chordId: def.id,
        name: def.name,
        root: note,
        symbol: note + def.suffix,
      })),
  );
}

// scales on  chord's own root that hold every chord tone: what to play over it
export function getChordScales(id: string, root: string) {
  const chord = getChord(id, root);
  return findAllScales()
    .filter((def) => containsAll(spell(def, chord.root).notes, chord.notes))
    .map((def) => ({
      id: def.id,
      name: def.name,
      category: def.category,
      root: chord.root,
    }));
}

// other catalog  with exactly these pitches (Am7 = C6); their root must be one of the notes
export function getSameNotes(id: string, root: string) {
  const chord = getChord(id, root);
  return chord.notes.map(plainRoot).flatMap((note) =>
    findAllChords()
      .filter((def) => !(def.id === id && note === chord.root))
      .filter((def) =>
        samePitches(spellChord(note, def.tonal).notes, chord.notes),
      )
      .map((def) => ({
        chordId: def.id,
        name: def.name,
        root: note,
        symbol: note + def.suffix,
      })),
  );
}

export function getHarmonicField({
  root,
  mode = 'major',
  size = 'sevenths',
  dominant = false,
}: HarmonicFieldQuery) {
  const withDominant = mode === 'minor' && dominant;
  const spelled = withoutDoubleSharps(root, (r) =>
    spellScale(
      r,
      withDominant ? 'harmonic minor' : mode === 'major' ? 'major' : 'aeolian',
    ),
  );
  const scale =
    mode === 'major'
      ? spelled.notes
      : spellScale(spelled.root, 'aeolian').notes;
  const types = findAllChords();
  const chordSize = size === 'triads' ? 3 : 4;
  const chords = harmonicField(scale, chordSize, types);
  if (withDominant) chords[4] = fieldChord(spelled.notes, 4, chordSize, types);
  return { root: spelled.root, mode, size, dominant: withDominant, chords };
}

export const listProgressions = () =>
  findAllProgressions().map((def) => ({
    id: def.id,
    name: def.name,
    category: def.category,
    bars: def.bars,
  }));

const scaleRef = (id: string, root: string) => {
  const scale = getScale(id, root);
  return { id, name: scale.name, root: scale.root };
};

export const CUSTOM_PROGRESSION = 'custom';

const progressionChordType = (token: string) => {
  const degree = parseDegree(token);
  const type =
    degree && findAllChords().find((c) => c.suffix === degree.suffix);
  return degree && type ? { degree, type } : undefined;
};

export const isProgressionToken = (token: string) =>
  !!progressionChordType(token);

export function customProgressionPalette(mode: 'major' | 'minor') {
  const field = (m: 'major' | 'minor', size: 'triads' | 'sevenths') =>
    getHarmonicField({ root: 'C', mode: m, size }).chords.map((c) => c.degree);
  const other = mode === 'major' ? 'minor' : 'major';
  const diatonic = [...field(mode, 'triads'), ...field(mode, 'sevenths')];
  const borrowed = [...field(other, 'triads'), ...field(other, 'sevenths')];
  const dominants = ['I7', 'II7', 'III7', 'V7', 'VI7', 'VII7'];
  return {
    diatonic,
    borrowed: borrowed.filter((d) => !diatonic.includes(d)),
    dominants: dominants.filter(
      (d) => !diatonic.includes(d) && !borrowed.includes(d),
    ),
  };
}

export function getCustomProgression(
  bars: string[],
  mode: 'major' | 'minor',
  root: string,
  tuning?: string,
  smooth?: boolean,
  capo?: number,
) {
  return buildProgression(
    {
      id: CUSTOM_PROGRESSION,
      name: 'Personalizada',
      category: 'Personalizada',
      mode,
      scale: mode === 'major' ? 'ionian' : 'aeolian',
      bars: bars.filter(isProgressionToken),
    },
    root,
    tuning,
    smooth,
    capo,
  );
}

const SEMITONE_DEGREES = [
  'I',
  'bII',
  'II',
  'bIII',
  'III',
  'IV',
  '#IV',
  'V',
  'bVI',
  'VI',
  'bVII',
  'VII',
];

const degreeToken = (semitones: number, suffix: string) =>
  SEMITONE_DEGREES[((semitones % 12) + 12) % 12] + suffix;

export interface Substitution {
  kind: 'tritone' | 'relative' | 'borrowed' | 'secondary' | 'two-five';
  chords: string[];
  result: string[];
}

export function progressionSubstitutions(
  tokens: string[],
  index: number,
  mode: 'major' | 'minor',
): Substitution[] {
  const parsed = progressionChordType(tokens[index]);
  if (!parsed) return [];
  const { degree, type } = parsed;
  const semitones = Note.chroma(degreeRoot('C', degree));
  const { suffix } = degree;
  const sevenths = /7/.test(suffix);
  const options: Omit<Substitution, 'result'>[] = [];
  const replace = (kind: Substitution['kind'], chords: string[]) =>
    options.push({ kind, chords });

  if (type.id === 'dom7') replace('tritone', [degreeToken(semitones + 6, '7')]);
  if (['', 'maj7'].includes(suffix)) {
    replace('relative', [degreeToken(semitones - 3, suffix ? 'm7' : 'm')]);
  } else if (['m', 'm7'].includes(suffix)) {
    replace('relative', [
      degreeToken(semitones + 3, suffix === 'm' ? '' : 'maj7'),
    ]);
  }
  const parallel = getHarmonicField({
    root: 'C',
    mode: mode === 'major' ? 'minor' : 'major',
    size: sevenths ? 'sevenths' : 'triads',
  }).chords.find((c) => parseDegree(c.degree)?.degree === degree.degree);
  if (parallel && parallel.degree !== tokens[index]) {
    replace('borrowed', [parallel.degree]);
  }
  if (type.id !== 'dim' && type.id !== 'dim7') {
    const minorTarget = ['m', 'm7', 'm7b5'].includes(suffix);
    replace('secondary', [degreeToken(semitones + 7, '7'), tokens[index]]);
    replace('two-five', [
      degreeToken(semitones + 2, minorTarget ? 'm7b5' : 'm7'),
      degreeToken(semitones + 7, '7'),
      tokens[index],
    ]);
  }
  return options
    .filter((o) => o.chords.every(isProgressionToken))
    .map((o) => ({
      ...o,
      result: [
        ...tokens.slice(0, index),
        ...o.chords,
        ...tokens.slice(index + 1),
      ],
    }));
}

export function getProgression(
  id: string,
  root: string,
  tuning?: string,
  smooth?: boolean,
  capo?: number,
) {
  const def = findProgression(id);
  if (!def) throw new Error(`Unknown progression ${id}`);
  return buildProgression(def, root, tuning, smooth, capo);
}

function buildProgression(
  def: ProgressionDef,
  root: string,
  tuning?: string,
  smooth = false,
  capo?: number,
) {
  const { id } = def;
  const key = withoutDoubleSharps(root, (r) =>
    spellScale(r, def.mode === 'major' ? 'major' : 'aeolian'),
  );
  const modes = findAllScales().filter(
    (scale) => spell(scale, 'C').notes.length === 7,
  );
  const chords = def.bars.map((token) => {
    const parsed = progressionChordType(token);
    if (!parsed) throw new Error(`Bad degree ${token} in ${id}`);
    const { degree, type } = parsed;
    return {
      token,
      degree,
      chord: getChord(type.id, degreeRoot(key.root, degree)),
    };
  });
  const options = chords.map(({ chord }) =>
    getChordVoicings(chord.id, { root: chord.root, tuning, capo }),
  );
  const voicings = smooth ? smoothVoicings(options) : options.map((o) => o[0]);
  return {
    id,
    name: def.name,
    category: def.category,
    mode: def.mode,
    root: key.root,
    scale: scaleRef(def.scale, key.root),
    bars: chords.map(({ token, degree, chord }, i) => {
      const next = chords[(i + 1) % chords.length].chord;
      const scale = chordScale(
        modes.map((mode) => ({ mode, notes: spell(mode, chord.root).notes })),
        chord.notes,
        key.notes,
      );
      return {
        degree: token,
        chordId: chord.id,
        root: chord.root,
        symbol: chord.symbol,
        notes: chord.notes,
        intervals: chord.intervals,
        function: harmonicFunction(degree, chord.root, chord.id, next.root),
        voicing: voicings[i] ?? null,
        scale: scale ? scaleRef(scale.mode.id, chord.root) : null,
      };
    }),
  };
}

export const listRhythms = () =>
  findAllRhythms().map(({ id, name, category, meter, steps }) => ({
    id,
    name,
    category,
    meter,
    steps,
  }));

export function getRhythm(id: string) {
  const def = findRhythm(id);
  if (!def) throw new Error(`Unknown rhythm ${id}`);
  const grid = parseRhythm(def.steps, def.stepsPerBeat);
  const compound = def.meter.endsWith('/8');
  return {
    ...def,
    grid,
    figures: rhythmFigures(grid, def.stepsPerBeat, compound),
  };
}

const MAX_TAP_WINDOW_MS = 150;

export function scoreRhythmTest(
  id: string,
  { bpm, bars, taps }: { bpm: number; bars: number; taps: number[] },
) {
  const def = findRhythm(id);
  if (!def) throw new Error(`Unknown rhythm ${id}`);
  const grid = parseRhythm(def.steps, def.stepsPerBeat);
  const hits = hitTimes(grid, def.stepsPerBeat, bpm, bars);
  const stepMs = 60000 / bpm / def.stepsPerBeat;
  return {
    bpm,
    bars,
    ...scoreTaps(hits, taps, Math.min(stepMs / 2, MAX_TAP_WINDOW_MS)),
  };
}

const describeInterval = (def: IntervalDef) => ({
  id: def.id,
  name: def.name,
  category: def.category,
  label: intervalLabel(def.tonal),
  semitones: Interval.semitones(def.tonal),
  inversion: intervalLabel(invertInterval(def.tonal)),
  consonance: consonance(def.tonal),
});

export const listIntervals = () => findAllIntervals().map(describeInterval);

export function getInterval(id: string, root: string) {
  const def = findInterval(id);
  if (!def) throw new Error(`Unknown interval ${id}`);
  const spelled = withoutDoubleSharps(root, (r) => ({
    notes: [r, Note.transpose(r, def.tonal)],
    intervals: ['R', intervalLabel(def.tonal)],
  }));
  const low = scaleOctaveMidis([spelled.root])[0];
  return {
    ...describeInterval(def),
    root: spelled.root,
    notes: spelled.notes,
    intervals: spelled.intervals,
    midi: [low, low + Interval.semitones(def.tonal)],
  };
}

export function getArpeggio(id: string, root: string) {
  const chord = getChord(id, root);
  const boxes = arpeggioBoxTemplate(chord.root, chord);
  return {
    ...chord,
    midi: scaleOctaveMidis(chord.notes),
    pentatonic: `${boxes}-pentatonic` as const,
    positions: POSITION_COUNT,
  };
}

export const getArpeggioOverlays = (id: string, root: string) =>
  superimpositions(getArpeggio(id, root), findAllChords());

export function getFretboard({
  root,
  item: itemRef,
  tuning: tuningName = 'standard',
  labelMode = 'notes',
  frets = 15,
  context: contextName,
  position,
  highlight: highlightName,
}: FretboardQuery) {
  const [type, id] = itemRef.split(':') as [ItemType, string];
  if (!ITEM_TYPES.includes(type) || !id) {
    throw new Error(`Invalid item: ${itemRef}`);
  }
  const item =
    type === 'scale'
      ? getScale(id, root)
      : type === 'interval'
        ? getInterval(id, root)
        : getChord(id, root);

  const tuning = tuningOrThrow(tuningName);

  const context =
    labelMode === 'degrees' ? parseContext(contextName ?? '') : undefined;
  if (labelMode === 'degrees' && !context) {
    throw new Error(`Invalid context: ${contextName}`);
  }

  const highlight = highlightName
    ? parseContext(
        parsePitchClass(highlightName) ? `${highlightName}M` : highlightName,
      )?.chord
    : undefined;
  if (highlightName && !highlight) {
    throw new Error(`Invalid highlight: ${highlightName}`);
  }
  const extra =
    highlight?.notes.filter((n) => !item.notes.some((m) => sameNote(m, n))) ??
    [];
  const board = fretboardPositions({
    root,
    notes: [...item.notes, ...extra],
    intervals: [
      ...item.intervals,
      ...extra.map((n) => intervalLabel(Interval.distance(item.root, n))),
    ],
    toneRole: type === 'scale' ? 'scale-tone' : 'chord-tone',
    tuning,
    frets,
    labelMode,
    context,
  });
  const positions = highlight
    ? board.map((p) =>
        p.role !== 'root' && highlight.notes.some((n) => sameNote(n, p.note))
          ? { ...p, role: 'chord-tone' as const }
          : p,
      )
    : board;
  if (!position) return positions;

  const boxes =
    type === 'scale'
      ? findScale(id)?.boxes
      : type === 'arpeggio'
        ? arpeggioBoxTemplate(item.root, item)
        : undefined;
  if (!boxes) throw new Error(`${itemRef} has no positions`);
  const inside = scalePositionFrets(
    item.notes,
    pentatonicBox(item.root, boxes, position, tuning),
    tuning,
  );
  return positions.map((p) =>
    inside.has(`${p.string}:${p.fret}`)
      ? p
      : { ...p, role: 'outside' as const },
  );
}

const BLUES_LICK_SCALES = [
  'minor-pentatonic',
  'major-pentatonic',
  'blues',
  'major-blues',
];

export const LICK_CHORDS: Record<string, string> = {
  ...Object.fromEntries(BLUES_LICK_SCALES.map((id) => [id, 'dom7'])),
  ionian: 'maj7',
  dorian: 'm7',
  phrygian: 'm7',
  lydian: 'maj7',
  mixolydian: 'dom7',
  aeolian: 'm7',
  locrian: 'm7b5',
  'harmonic-minor': 'minor',
  'phrygian-dominant': 'dom7',
};

export const LICK_SCALES = Object.keys(LICK_CHORDS);

export const isBluesLick = (id: string) => BLUES_LICK_SCALES.includes(id);

export const getLickChord = (id: string, root: string) =>
  getChord(LICK_CHORDS[id], root);

const tabStringNames = (tuning: string[]) =>
  [...tuning]
    .reverse()
    .map((note, i, all) =>
      i === 0 && all.slice(1).some((other) => sameNote(other, note))
        ? Note.pitchClass(note).toLowerCase()
        : Note.pitchClass(note),
    );

const BLUE_NOTES = {
  minor: { degree: 'b5', interval: '5d', below: '4' },
  major: { degree: 'b3', interval: '3m', below: '2' },
};

export function getLick(
  id: string,
  root: string,
  position: number,
  bars: number,
  seed: string,
  options?: {
    style?: string;
    easy?: boolean;
    span?: boolean;
    tuning?: string;
  },
) {
  const def = findScale(id);
  if (!def?.boxes || !LICK_SCALES.includes(id)) {
    throw new Error(`No licks for scale ${id}`);
  }
  const scale = getScale(id, root);
  const tuning = tuningOrThrow(options?.tuning ?? 'standard');
  const open = openMidis(tuning);
  const box = pentatonicBox(scale.root, def.boxes, position, tuning);
  const next = pentatonicBox(
    scale.root,
    def.boxes,
    (position % POSITION_COUNT) + 1,
    tuning,
  );
  const shift = next[0].lo < box[0].lo ? 12 : 0;
  const toNote = (key: string) => {
    const [string, fret] = key.split(':').map(Number);
    const midi = open[tuning.length - string] + fret;
    const i = scale.notes.findIndex((n) => Note.chroma(n) === midi % 12);
    return {
      string,
      fret,
      midi,
      note: scale.notes[i],
      degree: scale.intervals[i],
    };
  };
  const low = [...scalePositionFrets(scale.notes, box, tuning)].map(toNote);
  const high = options?.span
    ? [
        ...scalePositionFrets(
          scale.notes,
          next.map(({ lo, hi }) => ({ lo: lo + shift, hi: hi + shift })),
          tuning,
        ),
      ].map(toNote)
    : [];
  const split = high.length
    ? [...low, ...high].map((n) => n.midi).sort((a, b) => a - b)[
        Math.floor((low.length + high.length) / 2)
      ]
    : Infinity;
  const pool: PoolNote[] = [
    ...high.filter((n) => n.midi >= split),
    ...low,
    ...high,
  ]
    .filter((n, i, all) => all.findIndex((m) => m.midi === n.midi) === i)
    .sort((a, b) => a.midi - b.midi);
  const chordTones = getLickChord(id, scale.root).intervals;
  const toned = pool.map((n) => ({
    ...n,
    chordTone: chordTones.includes(n.degree),
  }));
  const blues = isBluesLick(id);
  const blue = BLUE_NOTES[def.boxes];
  const inScale = scale.intervals.includes(blue.degree);
  const marked = toned.map((n) =>
    blues && inScale && n.degree === blue.degree
      ? { ...n, blue: true, chordTone: false }
      : n,
  );
  const passing: PoolNote[] =
    inScale || !blues
      ? []
      : toned
          .filter((n) => n.degree === blue.below)
          .map((n) => ({
            ...n,
            fret: n.fret + 1,
            midi: n.midi + 1,
            note: Note.transpose(scale.root, blue.interval),
            degree: blue.degree,
            blue: true,
            passing: true,
            chordTone: false,
          }));
  return generateLick(
    [...marked, ...passing].sort((a, b) => a.midi - b.midi),
    bars,
    seededRandom(seed),
    { ...options, climb: options?.span, strings: tabStringNames(tuning) },
  );
}

const CIRCLE_SIZE = 12;
const SHARPS_SIDE = 6;

const keySignature = (alteration: number) =>
  Array.from({ length: Math.abs(alteration) }, (_, i) =>
    alteration > 0
      ? Note.transposeFifths('F#', i)
      : Note.transposeFifths('Bb', -i),
  );

export function getCircleOfFifths() {
  return Array.from({ length: CIRCLE_SIZE }, (_, position) => {
    const major = Note.transposeFifths(
      'C',
      position <= SHARPS_SIDE ? position : position - CIRCLE_SIZE,
    );
    const key = Key.majorKey(major);
    return {
      position,
      major,
      minor: key.minorRelative,
      alteration: key.alteration,
    };
  });
}

export function getCircleKey(root: string) {
  const circle = getCircleOfFifths();
  const index = circle.findIndex((k) => sameNote(k.major, root));
  if (index === -1) throw new Error(`Unknown key ${root}`);
  const at = (offset: number) =>
    circle[(index + offset + CIRCLE_SIZE) % CIRCLE_SIZE];
  const key = circle[index];
  const chords = getHarmonicField({ root: key.major, size: 'triads' }).chords;
  return {
    ...key,
    signature: keySignature(key.alteration),
    majorScale: Key.majorKey(key.major).scale,
    minorScale: Key.minorKey(key.minor).natural.scale,
    dominant: at(1),
    subdominant: at(-1),
    diatonic: {
      outer: {
        [at(-1).position]: chords[3],
        [key.position]: chords[0],
        [at(1).position]: chords[4],
      },
      inner: {
        [at(-1).position]: chords[1],
        [key.position]: chords[5],
        [at(1).position]: chords[2],
      },
    },
  };
}

export interface FoundChord {
  chordId: string;
  root: string;
  symbol: string;
  name: string;
  bass: string;
  inversion: boolean;
}

export function findChords(notes: string[]): FoundChord[] {
  const chromas = [...new Set(notes.map((n) => Note.chroma(n)))];
  if (chromas.length < 2) return [];
  const bass = notes[0];
  const sameSet = (a: number[], b: number[]) =>
    a.length === b.length && a.every((c) => b.includes(c));
  return chromas
    .flatMap((rootChroma) => {
      const relative = chromas.map((c) => (c - rootChroma + 12) % 12);
      const def = findAllChords().find((c) =>
        sameSet(
          spellChord('C', c.tonal).notes.map((n) => Note.chroma(n)),
          relative,
        ),
      );
      if (!def) return [];
      const root = notes.find((n) => Note.chroma(n) === rootChroma)!;
      const chord = getChord(def.id, Note.simplify(root));
      const inversion = !sameNote(chord.root, bass);
      const bassName =
        chord.notes.find((n) => sameNote(n, bass)) ?? Note.simplify(bass);
      return [
        {
          chordId: def.id,
          root: chord.root,
          symbol: inversion ? `${chord.symbol}/${bassName}` : chord.symbol,
          name: def.name,
          bass: bassName,
          inversion,
        },
      ];
    })
    .sort((a, b) => Number(a.inversion) - Number(b.inversion));
}

export interface FoundScale {
  scaleId: string;
  root: string;
  name: string;
  notes: string[];
  extra: number;
}

export function findScales(notes: string[], roots: readonly string[]) {
  if (!notes.length) return [];
  const found = new Map<string, FoundScale>();
  for (const def of findAllScales()) {
    if (def.id === 'chromatic') continue;
    for (const root of roots) {
      const scale = getScale(def.id, root);
      if (!containsAll(scale.notes, notes)) continue;
      const key = `${def.id}:${Note.chroma(scale.root)}`;
      if (found.has(key)) continue;
      found.set(key, {
        scaleId: def.id,
        root: scale.root,
        name: def.name,
        notes: scale.notes,
        extra: scale.notes.length - new Set(notes.map(Note.chroma)).size,
      });
    }
  }
  return [...found.values()].sort((a, b) => a.extra - b.extra);
}
