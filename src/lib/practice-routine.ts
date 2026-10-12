import { EAR_EXERCISES } from '@/lib/ear-training';
import { ROOTS } from '@/lib/roots';
import { EXERCISES } from '@/lib/technique/catalog';
import { LICK_SCALES, listRhythms, listScales } from '@/lib/theory/engine';
import { seededRandom } from '@/lib/theory/lick';

export const ROUTINE_MINUTES = [15, 30, 45, 60] as const;

export type RoutineBlock = {
  kind: string;
  title: string;
  detail: string;
  minutes: number;
  href: string;
};

const SHARES = [
  ['technique', 0.25],
  ['scale', 0.2],
  ['lick', 0.2],
  ['rhythm', 0.15],
  ['ear', 0.2],
] as const;

const EAR_NAMES: Record<(typeof EAR_EXERCISES)[number], string> = {
  intervals: 'intervalos',
  chords: 'tipos de acorde',
  scales: 'escalas',
  degrees: 'graus',
};

function split(total: number) {
  const minutes = SHARES.map(([, share]) =>
    Math.max(2, Math.round(total * share)),
  );
  minutes[0] += total - minutes.reduce((a, b) => a + b, 0);
  return minutes;
}

const query = (params: Record<string, string | number>) =>
  `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`;

export function generateRoutine(total: number, seed: string): RoutineBlock[] {
  const random = seededRandom(seed);
  const pick = <T>(items: readonly T[]) =>
    items[Math.floor(random() * items.length)];
  const minutes = split(total);
  const exercise = pick(EXERCISES);
  const scales = listScales().filter((s) => s.positions);
  const scale = pick(scales);
  const scaleRoot = pick(ROOTS);
  const position = 1 + Math.floor(random() * 5);
  const lickScale = pick(LICK_SCALES);
  const lickRoot = pick(ROOTS);
  const rhythm = pick(listRhythms());
  const ear = pick(EAR_EXERCISES);
  const lickName = listScales().find((s) => s.id === lickScale)?.name ?? '';

  return [
    {
      kind: 'Técnica',
      title: exercise.name,
      detail: `Comece em ${exercise.start} BPM e suba aos poucos rumo a ${exercise.target}.`,
      minutes: minutes[0],
      href: `/technique/${exercise.id}`,
    },
    {
      kind: 'Escala',
      title: `${scaleRoot} ${scale.name}, posição ${position}`,
      detail:
        'Suba e desça devagar falando os graus; depois toque com o metrônomo.',
      minutes: minutes[1],
      href: `/scales/${scale.id}${query({ root: scaleRoot, position })}`,
    },
    {
      kind: 'Licks',
      title: `Licks em ${lickRoot} ${lickName}`,
      detail:
        'Gere um lick, aprenda de ouvido com a tab e repita em loop com a base.',
      minutes: minutes[2],
      href: `/scales/${lickScale}${query({ root: lickRoot, position: 1, lick: seed })}`,
    },
    {
      kind: 'Ritmo',
      title: rhythm.name,
      detail: 'Toque junto com o loop e faça o teste de precisão no fim.',
      minutes: minutes[3],
      href: `/rhythm/${rhythm.id}`,
    },
    {
      kind: 'Ouvido',
      title: `Treino de ${EAR_NAMES[ear]}`,
      detail: 'Responda sem olhar o braço; erre à vontade, o placar é só seu.',
      minutes: minutes[4],
      href: `/ear-training${query({ exercise: ear })}`,
    },
  ];
}
