export type BoxTemplate = 'minor' | 'major';

export type ScaleDef = {
  id: string;
  name: string;
  category: string;
  boxes?: BoxTemplate;
} & (
  | { tonal: string }
  | { intervals: string[] }
);

export interface ChordDef {
  id: string;
  suffix: string;
  tonal: string;
  name: string;
  category: string;
}

export const PENTA = 'Pentatônicas e blues';
const MAJOR_MODES = 'Modos da escala maior';
const HARMONIC = 'Menor harmônica e seus modos';
const MELODIC = 'Menor melódica e seus modos';
const SYMMETRIC = 'Simétricas';

const SCALES: ScaleDef[] = [
  {
    id: 'minor-pentatonic',
    tonal: 'minor pentatonic',
    boxes: 'minor',
    name: 'Pentatônica menor',
    category: PENTA,
  },
  {
    id: 'major-pentatonic',
    tonal: 'major pentatonic',
    boxes: 'major',
    name: 'Pentatônica maior',
    category: PENTA,
  },
  {
    id: 'blues',
    tonal: 'minor blues',
    boxes: 'minor',
    name: 'Blues',
    category: PENTA,
  },
  {
    id: 'major-blues',
    tonal: 'major blues',
    boxes: 'major',
    name: 'Blues maior',
    category: PENTA,
  },
  {
    id: 'ionian',
    tonal: 'ionian',
    boxes: 'major',
    name: 'Jônio (maior)',
    category: MAJOR_MODES,
  },
  {
    id: 'dorian',
    tonal: 'dorian',
    boxes: 'minor',
    name: 'Dórico',
    category: MAJOR_MODES,
  },
  {
    id: 'phrygian',
    tonal: 'phrygian',
    boxes: 'minor',
    name: 'Frígio',
    category: MAJOR_MODES,
  },
  {
    id: 'lydian',
    tonal: 'lydian',
    boxes: 'major',
    name: 'Lídio',
    category: MAJOR_MODES,
  },
  {
    id: 'mixolydian',
    tonal: 'mixolydian',
    boxes: 'major',
    name: 'Mixolídio',
    category: MAJOR_MODES,
  },
  {
    id: 'aeolian',
    tonal: 'aeolian',
    boxes: 'minor',
    name: 'Eólio (menor natural)',
    category: MAJOR_MODES,
  },
  {
    id: 'locrian',
    tonal: 'locrian',
    boxes: 'minor',
    name: 'Lócrio',
    category: MAJOR_MODES,
  },
  {
    id: 'harmonic-minor',
    tonal: 'harmonic minor',
    boxes: 'minor',
    name: 'Menor harmônica',
    category: HARMONIC,
  },
  {
    id: 'phrygian-dominant',
    tonal: 'phrygian dominant',
    boxes: 'major',
    name: 'Frígio dominante',
    category: HARMONIC,
  },
  {
    id: 'melodic-minor',
    tonal: 'melodic minor',
    boxes: 'minor',
    name: 'Menor melódica',
    category: MELODIC,
  },
  {
    id: 'diminished-whole-half',
    tonal: 'diminished',
    name: 'Diminuta (tom-semitom)',
    category: SYMMETRIC,
  },
  {
    id: 'diminished-half-whole',
    tonal: 'half-whole diminished',
    name: 'Diminuta (semitom-tom)',
    category: SYMMETRIC,
  },
  {
    id: 'whole-tone',
    intervals: ['1P', '2M', '3M', '4A', '5A', '7m'],
    name: 'Tons inteiros',
    category: SYMMETRIC,
  },
  {
    id: 'chromatic',
    intervals: [
      '1P',
      '2m',
      '2M',
      '3m',
      '3M',
      '4P',
      '4A',
      '5P',
      '6m',
      '6M',
      '7m',
      '7M',
    ],
    name: 'Cromática',
    category: SYMMETRIC,
  },
];

export const TRIADS = 'Tríades';
const SUS = 'Sus e power';
const SEVENTHS = 'Tétrades';
const EXTENDED = 'Sextas e extensões';

const CHORDS: ChordDef[] = [
  { id: 'major', suffix: '', tonal: 'M', name: 'Maior', category: TRIADS },
  { id: 'minor', suffix: 'm', tonal: 'm', name: 'Menor', category: TRIADS },
  {
    id: 'dim',
    suffix: 'dim',
    tonal: 'dim',
    name: 'Diminuto',
    category: TRIADS,
  },
  {
    id: 'aug',
    suffix: 'aug',
    tonal: 'aug',
    name: 'Aumentado',
    category: TRIADS,
  },
  { id: 'power', suffix: '5', tonal: '5', name: 'Power chord', category: SUS },
  { id: 'sus2', suffix: 'sus2', tonal: 'sus2', name: 'Sus2', category: SUS },
  { id: 'sus4', suffix: 'sus4', tonal: 'sus4', name: 'Sus4', category: SUS },
  {
    id: '7sus4',
    suffix: '7sus4',
    tonal: '7sus4',
    name: 'Sétima sus4',
    category: SUS,
  },
  {
    id: 'dom7',
    suffix: '7',
    tonal: '7',
    name: 'Sétima dominante',
    category: SEVENTHS,
  },
  {
    id: 'maj7',
    suffix: 'maj7',
    tonal: 'maj7',
    name: 'Sétima maior',
    category: SEVENTHS,
  },
  {
    id: 'm7',
    suffix: 'm7',
    tonal: 'm7',
    name: 'Menor com sétima',
    category: SEVENTHS,
  },
  {
    id: 'm7b5',
    suffix: 'm7b5',
    tonal: 'm7b5',
    name: 'Meio-diminuto',
    category: SEVENTHS,
  },
  {
    id: 'dim7',
    suffix: 'dim7',
    tonal: 'dim7',
    name: 'Diminuto com sétima',
    category: SEVENTHS,
  },
  {
    id: '7sharp9',
    suffix: '7#9',
    tonal: '7#9',
    name: 'Sétima com nona aumentada',
    category: SEVENTHS,
  },
  { id: '6', suffix: '6', tonal: '6', name: 'Sexta', category: EXTENDED },
  {
    id: 'm6',
    suffix: 'm6',
    tonal: 'm6',
    name: 'Menor com sexta',
    category: EXTENDED,
  },
  { id: '9', suffix: '9', tonal: '9', name: 'Nona', category: EXTENDED },
  {
    id: 'add9',
    suffix: 'add9',
    tonal: 'add9',
    name: 'Add9',
    category: EXTENDED,
  },
  {
    id: 'm9',
    suffix: 'm9',
    tonal: 'm9',
    name: 'Menor com nona',
    category: EXTENDED,
  },
  {
    id: 'maj9',
    suffix: 'maj9',
    tonal: 'maj9',
    name: 'Nona maior',
    category: EXTENDED,
  },
];

export interface IntervalDef {
  id: string;
  tonal: string;
  name: string;
  category: string;
}

export const SIMPLE = 'Simples';
const COMPOUND = 'Compostos';

const INTERVALS: IntervalDef[] = [
  { id: 'unison', tonal: '1P', name: 'Uníssono', category: SIMPLE },
  { id: 'minor-second', tonal: '2m', name: 'Segunda menor', category: SIMPLE },
  { id: 'major-second', tonal: '2M', name: 'Segunda maior', category: SIMPLE },
  { id: 'minor-third', tonal: '3m', name: 'Terça menor', category: SIMPLE },
  { id: 'major-third', tonal: '3M', name: 'Terça maior', category: SIMPLE },
  { id: 'perfect-fourth', tonal: '4P', name: 'Quarta justa', category: SIMPLE },
  {
    id: 'augmented-fourth',
    tonal: '4A',
    name: 'Quarta aumentada',
    category: SIMPLE,
  },
  {
    id: 'diminished-fifth',
    tonal: '5d',
    name: 'Quinta diminuta',
    category: SIMPLE,
  },
  { id: 'perfect-fifth', tonal: '5P', name: 'Quinta justa', category: SIMPLE },
  {
    id: 'augmented-fifth',
    tonal: '5A',
    name: 'Quinta aumentada',
    category: SIMPLE,
  },
  { id: 'minor-sixth', tonal: '6m', name: 'Sexta menor', category: SIMPLE },
  { id: 'major-sixth', tonal: '6M', name: 'Sexta maior', category: SIMPLE },
  { id: 'minor-seventh', tonal: '7m', name: 'Sétima menor', category: SIMPLE },
  { id: 'major-seventh', tonal: '7M', name: 'Sétima maior', category: SIMPLE },
  { id: 'octave', tonal: '8P', name: 'Oitava justa', category: SIMPLE },
  { id: 'minor-ninth', tonal: '9m', name: 'Nona menor', category: COMPOUND },
  { id: 'major-ninth', tonal: '9M', name: 'Nona maior', category: COMPOUND },
  {
    id: 'augmented-ninth',
    tonal: '9A',
    name: 'Nona aumentada',
    category: COMPOUND,
  },
  {
    id: 'perfect-eleventh',
    tonal: '11P',
    name: 'Décima primeira justa',
    category: COMPOUND,
  },
  {
    id: 'augmented-eleventh',
    tonal: '11A',
    name: 'Décima primeira aumentada',
    category: COMPOUND,
  },
  {
    id: 'minor-thirteenth',
    tonal: '13m',
    name: 'Décima terceira menor',
    category: COMPOUND,
  },
  {
    id: 'major-thirteenth',
    tonal: '13M',
    name: 'Décima terceira maior',
    category: COMPOUND,
  },
];

export interface ProgressionDef {
  id: string;
  name: string;
  category: string;
  mode: 'major' | 'minor';
  scale: string;
  bars: string[];
}

export const MAJOR = 'Maiores';
const MINOR = 'Menores';
const BLUES = 'Blues';
const JAZZ = 'Jazz';

const PROGRESSIONS: ProgressionDef[] = [
  {
    id: 'i-iv-v-i',
    name: 'I–IV–V–I',
    category: MAJOR,
    mode: 'major',
    scale: 'major-pentatonic',
    bars: ['I', 'IV', 'V', 'I'],
  },
  {
    id: 'pop',
    name: 'I–V–VIm–IV (pop)',
    category: MAJOR,
    mode: 'major',
    scale: 'major-pentatonic',
    bars: ['I', 'V', 'VIm', 'IV'],
  },
  {
    id: 'fifties',
    name: 'I–VIm–IV–V (anos 50)',
    category: MAJOR,
    mode: 'major',
    scale: 'major-pentatonic',
    bars: ['I', 'VIm', 'IV', 'V'],
  },
  {
    id: 'i-iv-vim-v',
    name: 'I–IV–VIm–V',
    category: MAJOR,
    mode: 'major',
    scale: 'major-pentatonic',
    bars: ['I', 'IV', 'VIm', 'V'],
  },
  {
    id: 'iim-v-i',
    name: 'IIm–V–I',
    category: MAJOR,
    mode: 'major',
    scale: 'major-pentatonic',
    bars: ['IIm', 'V', 'I', 'I'],
  },
  {
    id: 'andalusian',
    name: 'Im–bVII–bVI–V (andaluza)',
    category: MINOR,
    mode: 'minor',
    scale: 'minor-pentatonic',
    bars: ['Im', 'bVII', 'bVI', 'V'],
  },
  {
    id: 'im-ivm-v7',
    name: 'Im–IVm–V7',
    category: MINOR,
    mode: 'minor',
    scale: 'minor-pentatonic',
    bars: ['Im', 'IVm', 'V7', 'Im'],
  },
  {
    id: 'im-bvi-biii-bvii',
    name: 'Im–bVI–bIII–bVII',
    category: MINOR,
    mode: 'minor',
    scale: 'minor-pentatonic',
    bars: ['Im', 'bVI', 'bIII', 'bVII'],
  },
  {
    id: 'im-bvii-bvi-bvii',
    name: 'Im–bVII–bVI–bVII',
    category: MINOR,
    mode: 'minor',
    scale: 'minor-pentatonic',
    bars: ['Im', 'bVII', 'bVI', 'bVII'],
  },
  {
    id: 'blues-12',
    name: 'Blues de 12 compassos',
    category: BLUES,
    mode: 'major',
    scale: 'blues',
    bars: [
      'I7',
      'I7',
      'I7',
      'I7',
      'IV7',
      'IV7',
      'I7',
      'I7',
      'V7',
      'IV7',
      'I7',
      'V7',
    ],
  },
  {
    id: 'blues-12-quick',
    name: 'Blues de 12 com quick change',
    category: BLUES,
    mode: 'major',
    scale: 'blues',
    bars: [
      'I7',
      'IV7',
      'I7',
      'I7',
      'IV7',
      'IV7',
      'I7',
      'I7',
      'V7',
      'IV7',
      'I7',
      'V7',
    ],
  },
  {
    id: 'minor-blues',
    name: 'Blues menor',
    category: BLUES,
    mode: 'minor',
    scale: 'blues',
    bars: [
      'Im7',
      'Im7',
      'Im7',
      'Im7',
      'IVm7',
      'IVm7',
      'Im7',
      'Im7',
      'bVI7',
      'V7',
      'Im7',
      'V7',
    ],
  },
  {
    id: 'ii-v-i-major',
    name: 'IIm7–V7–Imaj7',
    category: JAZZ,
    mode: 'major',
    scale: 'ionian',
    bars: ['IIm7', 'V7', 'Imaj7', 'Imaj7'],
  },
  {
    id: 'ii-v-i-minor',
    name: 'IIm7b5–V7–Im7',
    category: JAZZ,
    mode: 'minor',
    scale: 'aeolian',
    bars: ['IIm7b5', 'V7', 'Im7', 'Im7'],
  },
  {
    id: 'turnaround',
    name: 'Imaj7–VIm7–IIm7–V7 (turnaround)',
    category: JAZZ,
    mode: 'major',
    scale: 'ionian',
    bars: ['Imaj7', 'VIm7', 'IIm7', 'V7'],
  },
  {
    id: 'iii-vi-ii-v',
    name: 'IIIm7–VI7–IIm7–V7',
    category: JAZZ,
    mode: 'major',
    scale: 'ionian',
    bars: ['IIIm7', 'VI7', 'IIm7', 'V7'],
  },
];

export interface RhythmDef {
  id: string;
  name: string;
  category: string;
  meter: string;
  beats: number;
  stepsPerBeat: number;
  steps: string;
}

const BASIC = 'Figuras básicas';
const GALLOPS = 'Galopes e síncopes';
const TRIPLETS = 'Tercinas e swing';
const GROOVES = 'Levadas';
const COMPOUND_METERS = 'Compassos compostos';

const bar = (beat: string, beats = 4) =>
  'X' + beat.slice(1) + beat.repeat(beats - 1);

const RHYTHMS: RhythmDef[] = [
  {
    id: 'quarter-notes',
    name: 'Semínimas',
    category: BASIC,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 1,
    steps: bar('x'),
  },
  {
    id: 'eighth-notes',
    name: 'Colcheias',
    category: BASIC,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 2,
    steps: bar('xx'),
  },
  {
    id: 'sixteenth-notes',
    name: 'Semicolcheias',
    category: BASIC,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 4,
    steps: bar('xxxx'),
  },
  {
    id: 'gallop',
    name: 'Galope (colcheia e duas semicolcheias)',
    category: GALLOPS,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 4,
    steps: bar('x-xx'),
  },
  {
    id: 'reverse-gallop',
    name: 'Galope invertido (duas semicolcheias e colcheia)',
    category: GALLOPS,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 4,
    steps: bar('xxx-'),
  },
  {
    id: 'syncopation',
    name: 'Síncope (semicolcheia, colcheia, semicolcheia)',
    category: GALLOPS,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 4,
    steps: bar('xx-x'),
  },
  {
    id: 'triplets',
    name: 'Tercinas',
    category: TRIPLETS,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 3,
    steps: bar('xxx'),
  },
  {
    id: 'swing',
    name: 'Swing / shuffle',
    category: TRIPLETS,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 3,
    steps: bar('x-x'),
  },
  {
    id: 'triplet-rest',
    name: 'Tercina com pausa no meio',
    category: TRIPLETS,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 3,
    steps: bar('x.x'),
  },
  {
    id: 'pop-rock',
    name: 'Pop/rock (↓ ↓ ↑ ↑ ↓ ↑)',
    category: GROOVES,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 2,
    steps: 'X-xx-xxx',
  },
  {
    id: 'reggae',
    name: 'Reggae / ska (contratempo)',
    category: GROOVES,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 2,
    steps: '.X.x.X.x',
  },
  {
    id: 'funk',
    name: 'Funk em semicolcheias',
    category: GROOVES,
    meter: '4/4',
    beats: 4,
    stepsPerBeat: 4,
    steps: 'X.x..x.xx.x..x.x',
  },
  {
    id: 'six-eight',
    name: '6/8 em colcheias',
    category: COMPOUND_METERS,
    meter: '6/8',
    beats: 2,
    stepsPerBeat: 3,
    steps: 'XxxXxx',
  },
  {
    id: 'six-eight-ballad',
    name: '6/8 balada',
    category: COMPOUND_METERS,
    meter: '6/8',
    beats: 2,
    stepsPerBeat: 3,
    steps: 'X--x-x',
  },
  {
    id: 'twelve-eight-shuffle',
    name: '12/8 blues shuffle',
    category: COMPOUND_METERS,
    meter: '12/8',
    beats: 4,
    stepsPerBeat: 3,
    steps: bar('x-x'),
  },
];

export const findAllScales = (): ScaleDef[] => SCALES;
export const findScale = (id: string) => SCALES.find((s) => s.id === id);
export const findAllChords = (): ChordDef[] => CHORDS;
export const findChord = (id: string) => CHORDS.find((c) => c.id === id);
export const findAllProgressions = (): ProgressionDef[] => PROGRESSIONS;
export const findProgression = (id: string) =>
  PROGRESSIONS.find((p) => p.id === id);
export const findAllRhythms = (): RhythmDef[] => RHYTHMS;
export const findRhythm = (id: string) => RHYTHMS.find((r) => r.id === id);
export const findAllIntervals = (): IntervalDef[] => INTERVALS;
export const findInterval = (id: string) => INTERVALS.find((i) => i.id === id);
