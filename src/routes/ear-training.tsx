import { ToneMenu } from '@/components/audio/tone-select';
import { ChoiceTabs } from '@/components/theory/theory-controls';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useGuitar } from '@/hooks/use-guitar';
import {
  EAR_EXERCISES,
  EAR_OPTIONS,
  type EarExercise,
  type EarQuestion,
  type EarStats,
  earNotes,
  INTERVAL_DIRECTIONS,
  type IntervalDirection,
  loadEarStats,
  loadEnabled,
  nextEarQuestion,
  saveEarStats,
  saveEnabled,
} from '@/lib/ear-training';
import { cn } from '@/lib/utils';
import { getRouteApi } from '@tanstack/react-router';
import { Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const route = getRouteApi('/ear-training');
const BPM = 90;
const EXERCISES: Record<EarExercise, string> = {
  intervals: 'Intervalos',
  chords: 'Acordes',
  scales: 'Escalas',
  degrees: 'Graus',
};
const DIRECTIONS: Record<IntervalDirection, string> = {
  up: 'Subindo',
  down: 'Descendo',
  harmonic: 'Juntos',
};
const HINTS: Record<EarExercise, string> = {
  intervals: 'Duas notas: qual é o intervalo entre elas?',
  chords: 'Um acorde: qual é o tipo?',
  scales: 'Uma escala subindo da tônica à oitava: qual é?',
  degrees:
    'O acorde I do tom e depois outro acorde do campo harmônico maior: qual é o grau do segundo?',
};

type Feedback = { correct: boolean; text: string };

export function EarTrainingPage() {
  const { exercise, direction } = route.useSearch();
  const navigate = route.useNavigate();
  const guitar = useGuitar();

  const [current, setCurrent] = useState(exercise);
  const [enabled, setEnabled] = useState(() => loadEnabled(exercise));
  const [stats, setStats] = useState<EarStats>(() => loadEarStats(exercise));
  const [question, setQuestion] = useState<EarQuestion>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);

  if (current !== exercise) {
    setCurrent(exercise);
    setEnabled(loadEnabled(exercise));
    setStats(loadEarStats(exercise));
    setQuestion(undefined);
    setFeedback(undefined);
    setStreak(0);
  }

  const options = EAR_OPTIONS[exercise];
  const nameOf = (id: string) => options.find((o) => o.id === id)?.name ?? id;

  const play = (q: EarQuestion) =>
    void guitar.sequence(earNotes(exercise, q.answer, q.root, direction), {
      bpm: BPM,
    });

  const ask = () => {
    const next = nextEarQuestion(enabled, question);
    setQuestion(next);
    setFeedback(undefined);
    setRevealed(false);
    if (next) play(next);
  };

  const answer = (id: string) => {
    if (!question || feedback?.correct || revealed) return;
    const correct = id === question.answer;
    const nextStreak = correct ? streak + 1 : 0;
    const next = {
      hits: stats.hits + (correct ? 1 : 0),
      attempts: stats.attempts + 1,
      bestStreak: Math.max(stats.bestStreak, nextStreak),
    };
    setStreak(nextStreak);
    setStats(next);
    saveEarStats(exercise, next);
    setFeedback({
      correct,
      text: correct
        ? `Certo: ${nameOf(id)}.`
        : `Não é ${nameOf(id)}. Ouça de novo e tente outra vez.`,
    });
  };

  const toggleOption = (id: string) => {
    const next = enabled.includes(id)
      ? enabled.filter((e) => e !== id)
      : options.map((o) => o.id).filter((o) => o === id || enabled.includes(o));
    if (next.length < 2) return;
    setEnabled(next);
    saveEnabled(exercise, next);
    if (question && !next.includes(question.answer)) setQuestion(undefined);
  };

  const accuracy = stats.attempts
    ? Math.round((stats.hits / stats.attempts) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Treino de ouvido
        </h1>
        <p className="text-muted-foreground">{HINTS[exercise]}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ChoiceTabs
          id="ear-exercise"
          label="Exercício"
          options={EAR_EXERCISES}
          value={exercise}
          onChange={(exercise) =>
            navigate({ to: '.', search: (s) => ({ ...s, exercise }) })
          }
          format={(e) => EXERCISES[e]}
        />
        {exercise === 'intervals' && (
          <ChoiceTabs
            id="ear-direction"
            label="Notas"
            options={INTERVAL_DIRECTIONS}
            value={direction}
            onChange={(direction) =>
              navigate({
                to: '.',
                search: (s) => ({ ...s, direction }),
                replace: true,
              })
            }
            format={(d) => DIRECTIONS[d]}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span id="ear-options-label" className="text-sm font-medium">
          Opções no sorteio
        </span>
        <div
          role="group"
          aria-labelledby="ear-options-label"
          className="flex flex-wrap gap-1"
        >
          {options.map((o) => (
            <Toggle
              key={o.id}
              variant="outline"
              size="sm"
              pressed={enabled.includes(o.id)}
              onPressedChange={() => toggleOption(o.id)}
            >
              {o.name}
            </Toggle>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={guitar.loading}
            onClick={
              feedback?.correct || revealed || !question
                ? ask
                : () => play(question)
            }
          >
            {question && !feedback?.correct && !revealed ? (
              <RotateCcw data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            {guitar.loading
              ? 'Carregando som…'
              : !question
                ? 'Começar'
                : feedback?.correct || revealed
                  ? 'Próxima'
                  : 'Ouvir de novo'}
          </Button>
          {question && !feedback?.correct && !revealed && (
            <Button variant="ghost" onClick={() => setRevealed(true)}>
              Mostrar resposta
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1">
            {guitar.failed && (
              <span role="status" className="text-sm text-muted-foreground">
                Não foi possível carregar o som.
              </span>
            )}
            <ToneMenu />
          </div>
        </div>

        {question && (
          <div className="flex flex-wrap gap-2">
            {options
              .filter((o) => enabled.includes(o.id))
              .map((o) => (
                <Button
                  key={o.id}
                  variant="outline"
                  className={cn(
                    (revealed || feedback?.correct) &&
                      o.id === question.answer &&
                      'border-highlight',
                  )}
                  onClick={() => answer(o.id)}
                >
                  {o.name}
                </Button>
              ))}
          </div>
        )}

        <p role="status" className="min-h-6 text-muted-foreground">
          {revealed && question
            ? `Resposta: ${nameOf(question.answer)}, com tônica ${question.root}.`
            : feedback?.text}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Placar · {EXERCISES[exercise]}
        </h2>
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
