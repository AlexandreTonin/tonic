export type Metric = 'bpm' | 'changes-per-minute';
export type Subdivision = 'eighths' | 'triplets' | 'sixteenths';

export interface ExerciseLink {
  kind: 'scale' | 'chord' | 'arpeggio';
  id: string;
  root: string;
  position?: number;
}

export interface ExerciseDef {
  id: string;
  name: string;
  category: string;
  metric: Metric;
  subdivision: Subdivision;
  start: number;
  target: number;
  tab: string[];
  chords?: { symbol: string; frets: string }[];
  howTo: string[];
  links: ExerciseLink[];
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

function sequenceTab(notes: [number, number][], strings = 6): string[] {
  const lines = STRING_NAMES.slice(0, strings).map((name) => ({
    name,
    cells: [] as string[],
  }));
  for (const [string, fret] of notes) {
    const text = String(fret);
    lines.forEach((line, i) =>
      line.cells.push(
        i === string - 1 ? `-${text}` : '-'.repeat(text.length + 1),
      ),
    );
  }
  return lines.map(({ name, cells }) => `${name}|${cells.join('')}-|`);
}

const ascending = (runs: [number, number[]][]) =>
  runs.flatMap(([string, frets]) =>
    frets.map((f): [number, number] => [string, f]),
  );

const PICKING = 'Palhetada alternada';
const LEGATO = 'Legato';
const CHANGES = 'Troca de acordes';
const SKIPPING = 'Cruzamento de cordas';
const SWEEP = 'Sweep';
const RIGHT_HAND = 'Mão direita';
const TAPPING = 'Tapping';

export const EXERCISES: ExerciseDef[] = [
  {
    id: 'chromatic-1234',
    name: 'Cromático 1-2-3-4',
    category: PICKING,
    metric: 'bpm',
    subdivision: 'sixteenths',
    start: 60,
    target: 120,
    tab: sequenceTab(
      ascending([6, 5, 4, 3, 2, 1].map((string) => [string, [1, 2, 3, 4]])),
    ),
    howTo: [
      'Um dedo por casa: indicador na 1, médio na 2, anelar na 3, mínimo na 4.',
      'Palhetada alternada estrita: baixo, cima, baixo, cima, mesmo ao trocar de corda.',
      'Deixe os dedos já apoiados perto das casas seguintes; levante só o necessário.',
      'Quatro notas por clique. Se sair sujo, desça o BPM antes de insistir.',
    ],
    links: [],
  },
  {
    id: 'pentatonic-am-position-1',
    name: 'Pentatônica menor, posição 1',
    category: PICKING,
    metric: 'bpm',
    subdivision: 'sixteenths',
    start: 60,
    target: 110,
    tab: sequenceTab(
      ascending([
        [6, [5, 8]],
        [5, [5, 7]],
        [4, [5, 7]],
        [3, [5, 7]],
        [2, [5, 8]],
        [1, [5, 8]],
      ]),
    ),
    howTo: [
      'Suba e desça a caixa inteira sem pausa na virada.',
      'Indicador fica na casa 5; anelar ou mínimo cobre a 7 e a 8.',
      'Quatro notas por clique, palhetada alternada.',
      'Ao tocar, repare nas notas do acorde de Am7 (A C E G): são as que soam resolvidas.',
    ],
    links: [
      { kind: 'scale', id: 'minor-pentatonic', root: 'A', position: 1 },
      { kind: 'arpeggio', id: 'm7', root: 'A', position: 1 },
    ],
  },
  {
    id: 'major-3nps',
    name: 'Escala maior, 3 notas por corda',
    category: PICKING,
    metric: 'bpm',
    subdivision: 'triplets',
    start: 50,
    target: 100,
    tab: sequenceTab(
      ascending([
        [6, [3, 5, 7]],
        [5, [3, 5, 7]],
        [4, [4, 5, 7]],
        [3, [4, 5, 7]],
        [2, [5, 7, 8]],
        [1, [5, 7, 8]],
      ]),
    ),
    howTo: [
      'Escala de G maior com três notas em cada corda.',
      'Tercinas: três notas por clique, então a palhetada começa ora para baixo, ora para cima em cada corda.',
      'Acentue a primeira nota de cada tercina para não perder o tempo.',
    ],
    links: [{ kind: 'scale', id: 'ionian', root: 'G' }],
  },
  {
    id: 'legato-124',
    name: 'Hammer-on e pull-off 1-2-4',
    category: LEGATO,
    metric: 'bpm',
    subdivision: 'sixteenths',
    start: 60,
    target: 110,
    tab: [
      'e|-------------------------|',
      'B|-------------------------|',
      'G|-5h6h8p6p5h6h8p6p5h6h8p6-|',
      'D|-------------------------|',
      'A|-------------------------|',
      'E|-------------------------|',
    ],
    howTo: [
      'Palhete só a primeira nota; as outras saem dos dedos.',
      'Hammer-on: bata o dedo firme, na ponta, logo atrás do traste.',
      'Pull-off: puxe a corda levemente para baixo ao soltar, não só levante o dedo.',
      'O volume das notas ligadas deve ficar igual ao da nota palhetada.',
    ],
    links: [],
  },
  {
    id: 'trill-13',
    name: 'Trinado 1-3',
    category: LEGATO,
    metric: 'bpm',
    subdivision: 'sixteenths',
    start: 70,
    target: 130,
    tab: [
      'e|-------------------------|',
      'B|-5h7p5h7p5h7p5h7p5h7p5h7-|',
      'G|-------------------------|',
      'D|-------------------------|',
      'A|-------------------------|',
      'E|-------------------------|',
    ],
    howTo: [
      'Indicador fixo na casa 5, anelar alternando na 7.',
      'Palhete só a primeira nota e mantenha o trinado sem parar.',
      'Movimento pequeno do anelar: quanto menos ele sobe, mais rápido e limpo fica.',
    ],
    links: [],
  },
  {
    id: 'changes-g-c-d',
    name: 'G, C e D abertos',
    category: CHANGES,
    metric: 'changes-per-minute',
    subdivision: 'eighths',
    start: 20,
    target: 60,
    tab: [
      'e|-3---0---2-|',
      'B|-0---1---3-|',
      'G|-0---0---2-|',
      'D|-0---2---0-|',
      'A|-2---3---x-|',
      'E|-3---x---x-|',
    ],
    chords: [
      { symbol: 'G', frets: '3 2 0 0 0 3' },
      { symbol: 'C', frets: 'x 3 2 0 1 0' },
      { symbol: 'D', frets: 'x x 0 2 3 2' },
    ],
    howTo: [
      'Uma troca por clique: no clique, o acorde novo já tem que soar.',
      'Olhe o próximo acorde antes da troca e mova todos os dedos juntos.',
      'Procure dedos-guia: de C para D o anelar sai da casa 3 da quinta corda para a casa 3 da segunda.',
      'Limpo = todas as cordas soando, sem trastejar, no tempo.',
    ],
    links: [
      { kind: 'chord', id: 'major', root: 'G' },
      { kind: 'chord', id: 'major', root: 'C' },
      { kind: 'chord', id: 'major', root: 'D' },
    ],
  },
  {
    id: 'changes-am-f',
    name: 'Am e F com pestana',
    category: CHANGES,
    metric: 'changes-per-minute',
    subdivision: 'eighths',
    start: 15,
    target: 50,
    tab: [
      'e|-0---1-|',
      'B|-1---1-|',
      'G|-2---2-|',
      'D|-2---3-|',
      'A|-0---3-|',
      'E|-x---1-|',
    ],
    chords: [
      { symbol: 'Am', frets: 'x 0 2 2 1 0' },
      { symbol: 'F', frets: '1 3 3 2 1 1' },
    ],
    howTo: [
      'Os dedos médio e anelar mudam de corda juntos; o indicador vira a pestana.',
      'Na pestana, use a lateral do indicador, perto do traste, e o peso do braço em vez de apertar com o polegar.',
      'Toque cada corda do F isolada de vez em quando para achar a que abafa.',
    ],
    links: [
      { kind: 'chord', id: 'minor', root: 'A' },
      { kind: 'chord', id: 'major', root: 'F' },
    ],
  },
  {
    id: 'string-skipping-pentatonic',
    name: 'Pulando cordas na pentatônica',
    category: SKIPPING,
    metric: 'bpm',
    subdivision: 'eighths',
    start: 70,
    target: 130,
    tab: sequenceTab(
      ascending([
        [6, [5, 8]],
        [4, [5, 7]],
        [5, [5, 7]],
        [3, [5, 7]],
        [4, [5, 7]],
        [2, [5, 8]],
        [3, [5, 7]],
        [1, [5, 8]],
      ]),
    ),
    howTo: [
      'Pentatônica menor de A, posição 1, pulando uma corda: 6ª com 4ª, 5ª com 3ª, 4ª com 2ª, 3ª com 1ª.',
      'Duas notas por clique, palhetada alternada.',
      'Abafe a corda pulada com a mão da palheta ou com a sobra dos dedos da mão esquerda.',
    ],
    links: [{ kind: 'scale', id: 'minor-pentatonic', root: 'A', position: 1 }],
  },
  {
    id: 'sweep-am-3-strings',
    name: 'Sweep de Am em 3 cordas',
    category: SWEEP,
    metric: 'bpm',
    subdivision: 'triplets',
    start: 50,
    target: 100,
    tab: sequenceTab(
      [
        [3, 14],
        [2, 13],
        [1, 12],
        [1, 17],
        [1, 12],
        [2, 13],
      ],
      3,
    ),
    howTo: [
      'Subindo, um único movimento da palheta para baixo atravessa as três cordas; descendo, um para cima.',
      'Cada nota tem que soar sozinha: levante o dedo da nota anterior assim que tocar a próxima.',
      'Comece bem devagar; o sweep sujo vira um acorde arpejado, não notas separadas.',
    ],
    links: [{ kind: 'arpeggio', id: 'minor', root: 'A' }],
  },
  {
    id: 'palm-mute-power-chords',
    name: 'Palm mute em power chords',
    category: RIGHT_HAND,
    metric: 'bpm',
    subdivision: 'eighths',
    start: 90,
    target: 160,
    tab: [
      '   PM------------------------------',
      'D|-------------------2--2--2--2--|',
      'A|--2--2--2--2-------0--0--0--0--|',
      'E|--0--0--0--0-------------------|',
    ],
    howTo: [
      'Apoie a lateral da mão direita sobre as cordas, bem junto à ponte.',
      'Todas as palhetadas para baixo, duas por clique.',
      'Muito perto da ponte some o abafado; muito longe, a nota morre. Procure o meio-termo.',
    ],
    links: [
      { kind: 'chord', id: 'power', root: 'E' },
      { kind: 'chord', id: 'power', root: 'A' },
    ],
  },
  {
    id: 'tapping-em-b-string',
    name: 'Tapping de Em na 2ª corda',
    category: TAPPING,
    metric: 'bpm',
    subdivision: 'triplets',
    start: 50,
    target: 100,
    tab: [
      'e|---------------------------------|',
      'B|-t12p5h8-t12p5h8-t12p5h8-t12p5h8-|',
      'G|---------------------------------|',
      'D|---------------------------------|',
      'A|---------------------------------|',
      'E|---------------------------------|',
    ],
    howTo: [
      't = toque com a mão direita: o dedo médio bate na casa 12 e puxa a corda (pull-off) para a casa 5.',
      'Indicador da mão esquerda fica na 5; o mínimo faz hammer-on na 8. As três notas são E, G e B, a tríade de Em.',
      'Três notas por clique; o toque da mão direita cai no clique.',
      'Abafe as outras cordas: a palma da mão direita sobre as graves, os dedos livres da esquerda encostados nas agudas.',
    ],
    links: [{ kind: 'arpeggio', id: 'minor', root: 'E' }],
  },
  {
    id: 'tapping-am-f-c-g',
    name: 'Tapping em Am, F, C e G',
    category: TAPPING,
    metric: 'bpm',
    subdivision: 'triplets',
    start: 40,
    target: 90,
    tab: [
      '   Am      F       C        G',
      'e|-t12p5h8-t13p5h8-t15p8h12-t15p7h10-|',
      'B|-----------------------------------|',
      'G|-----------------------------------|',
      'D|-----------------------------------|',
      'A|-----------------------------------|',
      'E|-----------------------------------|',
    ],
    howTo: [
      'Mesmo movimento do tapping na 2ª corda, agora na 1ª, trocando de tríade a cada grupo. Se ficar difícil, repita cada grupo 4 vezes antes de trocar.',
      'Cada grupo t-p-h toca as três notas do acorde: Am = A C E, F = F A C, C = C E G, G = G B D.',
      'Mude a mão esquerda e a direita juntas, no clique que abre o acorde novo.',
      'Toque junto com a progressão Am F C G para ouvir cada tríade sobre o seu acorde.',
    ],
    links: [
      { kind: 'arpeggio', id: 'minor', root: 'A' },
      { kind: 'arpeggio', id: 'major', root: 'F' },
      { kind: 'arpeggio', id: 'major', root: 'C' },
      { kind: 'arpeggio', id: 'major', root: 'G' },
    ],
  },
];

export const findExercise = (id: string) => EXERCISES.find((e) => e.id === id);

export const UNITS: Record<Metric, string> = {
  bpm: 'BPM',
  'changes-per-minute': 'trocas/min',
};

export const SUBDIVISIONS: Record<Subdivision, string> = {
  eighths: 'colcheias (2 notas por clique)',
  triplets: 'tercinas (3 notas por clique)',
  sixteenths: 'semicolcheias (4 notas por clique)',
};
