export type StepState = 'hit' | 'sustain' | 'rest';
export type Stroke = 'down' | 'up';

export interface RhythmStep {
  beat: number;
  sub: number;
  state: StepState;
  accent: boolean;
  stroke: Stroke;
}

const STATES: Record<string, StepState> = {
  X: 'hit',
  x: 'hit',
  '-': 'sustain',
  '.': 'rest',
};

export function strokeAt(sub: number, stepsPerBeat: number): Stroke {
  if (stepsPerBeat === 3) return sub === 2 ? 'up' : 'down';
  return sub % 2 === 0 ? 'down' : 'up';
}

export function parseRhythm(steps: string, stepsPerBeat: number): RhythmStep[] {
  return [...steps].map((char, i) => {
    const state = STATES[char];
    if (!state) throw new Error(`Bad rhythm step "${char}" in ${steps}`);
    const sub = i % stepsPerBeat;
    return {
      beat: Math.floor(i / stepsPerBeat),
      sub,
      state,
      accent: char === 'X',
      stroke: strokeAt(sub, stepsPerBeat),
    };
  });
}

export function hitTimes(
  steps: RhythmStep[],
  stepsPerBeat: number,
  bpm: number,
  bars: number,
): number[] {
  const stepMs = 60000 / bpm / stepsPerBeat;
  const times: number[] = [];
  for (let bar = 0; bar < bars; bar++) {
    steps.forEach((step, i) => {
      if (step.state === 'hit') times.push((bar * steps.length + i) * stepMs);
    });
  }
  return times;
}

export const ON_TIME_MS = 30;

export function scoreTaps(hits: number[], taps: number[], windowMs: number) {
  const used = new Set<number>();
  const offsets = hits.map((hit) => {
    let best = -1;
    taps.forEach((tap, i) => {
      if (used.has(i) || Math.abs(tap - hit) > windowMs) return;
      if (best === -1 || Math.abs(tap - hit) < Math.abs(taps[best] - hit)) {
        best = i;
      }
    });
    if (best === -1) return null;
    used.add(best);
    return Math.round(taps[best] - hit);
  });
  const matched = offsets.filter((o): o is number => o !== null);
  const mean = (values: number[]) =>
    values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  return {
    offsets,
    missed: offsets.length - matched.length,
    extra: taps.length - matched.length,
    meanOffsetMs: mean(matched),
    meanAbsOffsetMs: mean(matched.map(Math.abs)),
    onTimePct: hits.length
      ? Math.round(
          (matched.filter((o) => Math.abs(o) <= ON_TIME_MS).length * 100) /
            hits.length,
        )
      : 0,
  };
}

export type Figure = 'quarter' | 'eighth' | 'sixteenth';

export interface FigureEvent {
  kind: 'note' | 'rest';
  start: number;
  length: number;
  figure: Figure;
  dotted: boolean;
  tiedFromPrevious: boolean;
  accent: boolean;
  name: string;
}

export interface BeatFigures {
  tuplet: boolean;
  events: FigureEvent[];
}

const NAMES: Record<Figure, string> = {
  quarter: 'semínima',
  eighth: 'colcheia',
  sixteenth: 'semicolcheia',
};

function figureOf(
  length: number,
  stepsPerBeat: number,
  compound: boolean,
): { figure: Figure; dotted: boolean } {
  const table: Record<number, [Figure, boolean][]> = compound
    ? {
        3: [
          ['eighth', false],
          ['quarter', false],
          ['quarter', true],
        ],
      }
    : {
        1: [['quarter', false]],
        2: [
          ['eighth', false],
          ['quarter', false],
        ],
        3: [
          ['eighth', false],
          ['quarter', false],
          ['quarter', false],
        ],
        4: [
          ['sixteenth', false],
          ['eighth', false],
          ['eighth', true],
          ['quarter', false],
        ],
      };
  const entry = table[stepsPerBeat]?.[length - 1];
  if (!entry) throw new Error(`No figure for ${length}/${stepsPerBeat}`);
  return { figure: entry[0], dotted: entry[1] };
}

function previousSounding(steps: RhythmStep[], index: number): boolean {
  for (let i = 1; i <= steps.length; i++) {
    const step = steps[(index - i + steps.length) % steps.length];
    if (step.state === 'hit') return true;
    if (step.state === 'rest') return false;
  }
  return false;
}

export function rhythmFigures(
  steps: RhythmStep[],
  stepsPerBeat: number,
  compound: boolean,
): BeatFigures[] {
  const beats = steps.length / stepsPerBeat;
  return Array.from({ length: beats }, (_, beat) => {
    const events: FigureEvent[] = [];
    for (let sub = 0; sub < stepsPerBeat; sub++) {
      const step = steps[beat * stepsPerBeat + sub];
      const last = events.at(-1);
      const kind =
        step.state === 'hit'
          ? 'note'
          : step.state === 'rest'
            ? 'rest'
            : (last?.kind ??
              (previousSounding(steps, beat * stepsPerBeat) ? 'note' : 'rest'));
      if (step.state !== 'hit' && last && last.kind === kind) {
        last.length++;
        continue;
      }
      events.push({
        kind,
        start: sub,
        length: 1,
        figure: 'quarter',
        dotted: false,
        tiedFromPrevious: step.state === 'sustain' && kind === 'note',
        accent: step.accent,
        name: '',
      });
    }
    for (const event of events) {
      const { figure, dotted } = figureOf(event.length, stepsPerBeat, compound);
      const base = NAMES[figure] + (dotted ? ' pontuada' : '');
      Object.assign(event, {
        figure,
        dotted,
        name: event.kind === 'rest' ? `pausa de ${base}` : base,
      });
    }
    const tuplet = !compound && stepsPerBeat === 3 && events.length > 1;
    if (tuplet) events.forEach((e) => (e.name += ' de tercina'));
    return { tuplet, events };
  });
}
