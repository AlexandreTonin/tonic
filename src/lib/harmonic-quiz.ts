import { ROOTS } from '@/lib/roots';
import { getCircleKey, getHarmonicField } from '@/lib/theory/engine';
import { read, write } from '@/lib/storage';

export const QUIZ_SIZES = ['triads', 'sevenths'] as const;
export type QuizSize = (typeof QUIZ_SIZES)[number];

export type QuizQuestion = {
  prompt: string;
  answer: string;
  options: string[];
};

const OPTION_COUNT = 4;

const pickOne = <T>(items: readonly T[], random: () => number) =>
  items[Math.floor(random() * items.length)];

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function withDistractors(
  answer: string,
  pool: string[],
  random: () => number,
): string[] {
  const others = shuffle(
    [...new Set(pool)].filter((p) => p !== answer),
    random,
  ).slice(0, OPTION_COUNT - 1);
  return shuffle([answer, ...others], random);
}

const QUIZ_KINDS = ['degree-chord', 'chord-degree', 'relative'] as const;

export function nextQuizQuestion(
  size: QuizSize,
  random: () => number = Math.random,
): QuizQuestion {
  const field = getHarmonicField({ root: pickOne(ROOTS, random), size });
  const key = field.root;
  const kind = pickOne(QUIZ_KINDS, random);
  if (kind === 'relative') {
    const circle = getCircleKey(key);
    const toMinor = random() < 0.5;
    const answer = toMinor ? `${circle.minor}m` : circle.major;
    const pool = ROOTS.map((r) =>
      toMinor ? `${getCircleKey(r).minor}m` : getCircleKey(r).major,
    );
    return {
      prompt: toMinor
        ? `Qual é a relativa menor de ${circle.major}?`
        : `Qual é a relativa maior de ${circle.minor}m?`,
      answer,
      options: withDistractors(answer, pool, random),
    };
  }
  const chord = pickOne(field.chords, random);
  if (kind === 'degree-chord') {
    const numeral = chord.degree.match(/^[b#]?[IV]+/)![0];
    return {
      prompt: `Qual é o acorde ${numeral} de ${key} maior?`,
      answer: chord.symbol,
      options: withDistractors(
        chord.symbol,
        field.chords.map((c) => c.symbol),
        random,
      ),
    };
  }
  return {
    prompt: `Que grau ${chord.symbol} ocupa em ${key} maior?`,
    answer: chord.degree,
    options: withDistractors(
      chord.degree,
      field.chords.map((c) => c.degree),
      random,
    ),
  };
}

export type QuizStats = { hits: number; attempts: number; bestStreak: number };

const KEY = 'tonic.harmonic-quiz';

export function loadQuizStats(): QuizStats {
  const saved = read(KEY) as Partial<QuizStats> | null;
  return {
    hits: Number(saved?.hits) || 0,
    attempts: Number(saved?.attempts) || 0,
    bestStreak: Number(saved?.bestStreak) || 0,
  };
}

export const saveQuizStats = (stats: QuizStats) => write(KEY, stats);
