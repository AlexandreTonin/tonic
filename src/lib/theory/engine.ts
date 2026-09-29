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
import { hitTimes, parseRhythm, rhythmFigures, scoreTaps } from './rhythm';

export const ITEM_TYPES = ['scale', 'chord', 'arpeggio', 'interval'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export interface VoicingsQuery {
  root: string;
  tuning?: string;
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
    tuning: tuningOrThrow(query.tuning ?? 'standard'),
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

export function getProgression(id: string, root: string) {
  const def = findProgression(id);
  if (!def) throw new Error(`Unknown progression ${id}`);
  const key = withoutDoubleSharps(root, (r) =>
    spellScale(r, def.mode === 'major' ? 'major' : 'aeolian'),
  );
  const modes = findAllScales().filter(
    (scale) => spell(scale, 'C').notes.length === 7,
  );
  const chords = def.bars.map((token) => {
    const degree = parseDegree(token);
    const type = findAllChords().find((c) => c.suffix === degree?.suffix);
    if (!degree || !type) throw new Error(`Bad degree ${token} in ${id}`);
    return {
      token,
      degree,
      chord: getChord(type.id, degreeRoot(key.root, degree)),
    };
  });
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
        voicing: getChordVoicings(chord.id, { root: chord.root })[0] ?? null,
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
