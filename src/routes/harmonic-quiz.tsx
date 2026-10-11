import { ChoiceTabs } from '@/components/theory/theory-controls';
import { Button } from '@/components/ui/button';
import {
  loadQuizStats,
  nextQuizQuestion,
  QUIZ_SIZES,
  type QuizQuestion,
  type QuizSize,
  type QuizStats,
  saveQuizStats,
} from '@/lib/harmonic-quiz';
import { cn } from '@/lib/utils';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useState } from 'react';

const route = getRouteApi('/harmonic-quiz');
const SIZES: Record<QuizSize, string> = {
  triads: 'Tríades',
  sevenths: 'Tétrades',
};

export function HarmonicQuizPage() {
  const { size } = route.useSearch();
  const navigate = route.useNavigate();

  const [current, setCurrent] = useState(size);
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    nextQuizQuestion(size),
  );
  const [picked, setPicked] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<QuizStats>(loadQuizStats);

  if (current !== size) {
    setCurrent(size);
    setQuestion(nextQuizQuestion(size));
    setPicked([]);
  }

  const solved = picked.includes(question.answer);

  const answer = (option: string) => {
    if (solved || picked.includes(option)) return;
    const correct = option === question.answer;
    const nextStreak = correct && !picked.length ? streak + 1 : 0;
    const next = {
      hits: stats.hits + (correct && !picked.length ? 1 : 0),
      attempts: stats.attempts + (picked.length ? 0 : 1),
      bestStreak: Math.max(stats.bestStreak, nextStreak),
    };
    setPicked([...picked, option]);
    setStreak(nextStreak);
    setStats(next);
    saveQuizStats(next);
  };

  const next = () => {
    setQuestion(nextQuizQuestion(size));
    setPicked([]);
  };

  const accuracy = stats.attempts
    ? Math.round((stats.hits / stats.attempts) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Tons e graus</h1>
        <p className="text-muted-foreground">
          Perguntas sobre o campo harmônico maior e os tons relativos. Vale o
          acerto na primeira tentativa. Para revisar, abra o{' '}
          <Link to="/harmonic-field" className="underline">
            campo harmônico
          </Link>
          .
        </p>
      </div>

      <ChoiceTabs
        id="quiz-size"
        label="Acordes"
        options={QUIZ_SIZES}
        value={size}
        onChange={(size) =>
          navigate({ to: '.', search: (s) => ({ ...s, size }), replace: true })
        }
        format={(s) => SIZES[s]}
      />

      <div className="flex flex-col gap-4">
        <p className="text-2xl font-semibold" aria-live="polite">
          {question.prompt}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {question.options.map((option) => {
            const tried = picked.includes(option);
            const right = option === question.answer;
            return (
              <Button
                key={option}
                variant="outline"
                aria-pressed={tried}
                className={cn(
                  'min-w-24',
                  tried && right && 'border-highlight',
                  tried && !right && 'text-muted-foreground line-through',
                )}
                onClick={() => answer(option)}
              >
                {option}
              </Button>
            );
          })}
        </div>
        <div className="flex min-h-9 flex-wrap items-center gap-3">
          <p role="status" className="text-muted-foreground">
            {solved
              ? picked.length === 1
                ? `Certo: ${question.answer}.`
                : `É ${question.answer}.`
              : picked.length
                ? 'Não. Tente outra opção.'
                : ''}
          </p>
          {solved && <Button onClick={next}>Próxima</Button>}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Placar</h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Sequência', streak],
            ['Melhor sequência', stats.bestStreak],
            ['Acertos', `${stats.hits}/${stats.attempts}`],
            ['Precisão', `${accuracy}%`],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col rounded-xl border p-3">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
