import { Fretboard } from '@/components/fretboard/fretboard';
import { TuningMenu } from '@/components/fretboard/tuning-menu';
import { ChoiceTabs } from '@/components/theory/theory-controls';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useGuitar } from '@/hooks/use-guitar';
import { useTuning } from '@/hooks/use-tuning';
import {
  type Cell,
  chromaAt,
  isFound,
  loadStats,
  now,
  nextQuestion,
  type Question,
  resetStats,
  rootFor,
  saveStats,
  TRAINER_MODES,
  TRAINER_REGIONS,
  type TrainerMode,
  type TrainerRegion,
  type TrainerScope,
  type TrainerStats,
} from '@/lib/fretboard-trainer';
import { ROOTS, type Root } from '@/lib/roots';
import { type FretPosition, openMidis, TUNINGS } from '@/lib/theory/core';
import { cn } from '@/lib/utils';
import { getRouteApi } from '@tanstack/react-router';
import { useMemo, useRef, useState } from 'react';

const route = getRouteApi('/fretboard-trainer');
const FRETS = 12;
const MODES: Record<TrainerMode, string> = {
  find: 'Encontrar a nota',
  name: 'Dizer a nota',
};
const REGIONS = Object.keys(TRAINER_REGIONS) as TrainerRegion[];

type Feedback = { correct: boolean; cell: Cell; text: string };

export function FretboardTrainerPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ to: '.', search: { ...search, ...patch }, replace: true });

  const [tuningId] = useTuning();
  const scope: TrainerScope = useMemo(() => {
    const tuning = TUNINGS[tuningId];
    return {
      tuning,
      strings: [...new Set(search.strings)]
        .map(Number)
        .filter((s) => s <= tuning.length),
      region: search.region,
    };
  }, [tuningId, search.strings, search.region]);
  const { tuning, strings } = scope;
  const stringCount = tuning.length;
  const scopeKey = `${tuningId}|${search.strings}|${search.region}`;

  const [question, setQuestion] = useState<Question | undefined>();
  const [questionKey, setQuestionKey] = useState('');
  const [feedback, setFeedback] = useState<Feedback>();
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<TrainerStats>(loadStats);
  const askedAt = useRef(0);
  const guitar = useGuitar();

  if (questionKey !== scopeKey) {
    setQuestionKey(scopeKey);
    setQuestion(nextQuestion(scope));
    setFeedback(undefined);
  }

  const record = (correct: boolean) => {
    const ms = now() - askedAt.current;
    const nextStreak = correct ? streak + 1 : 0;
    const next: TrainerStats = {
      hits: stats.hits + (correct ? 1 : 0),
      attempts: stats.attempts + 1,
      bestStreak: Math.max(stats.bestStreak, nextStreak),
      bestMs:
        correct &&
        askedAt.current &&
        (stats.bestMs === null || ms < stats.bestMs)
          ? ms
          : stats.bestMs,
    };
    setStreak(nextStreak);
    setStats(next);
    saveStats(next);
    if (correct) {
      setQuestion(nextQuestion(scope, question));
      askedAt.current = now();
    }
  };

  const midiAt = (cell: Cell) =>
    openMidis(tuning)[stringCount - cell.string] + cell.fret;

  const answerFind = (string: number, fret: number) => {
    if (!question) return;
    const cell = { string, fret };
    const note = rootFor(chromaAt(tuning, cell));
    const correct = isFound(scope, question.note, cell);
    void guitar.melody([midiAt(cell)]);
    setFeedback({
      correct,
      cell,
      text: correct
        ? `Certo: ${note} na corda ${string}, casa ${fret}.`
        : `Essa é ${note}. Procure ${question.note}${scope.strings.includes(string) ? '' : ' nas cordas escolhidas'}.`,
    });
    record(correct);
  };

  const answerName = (note: Root) => {
    if (!question) return;
    const correct = note === question.note;
    void guitar.melody([midiAt(question)]);
    setFeedback({
      correct,
      cell: question,
      text: correct
        ? `Certo: ${question.note}.`
        : `Não é ${note}. Tente de novo.`,
    });
    record(correct);
  };

  const toggleString = (string: number) => {
    const next = strings.includes(string)
      ? strings.filter((s) => s !== string)
      : [...strings, string];
    if (!next.length) return;
    setSearch({ strings: next.sort().join('') });
  };

  const changeMode = (mode: TrainerMode) => {
    setSearch({ mode });
    setFeedback(undefined);
    setQuestion(nextQuestion(scope));
    askedAt.current = 0;
  };

  const positions: FretPosition[] = [];
  if (search.mode === 'name' && question) {
    positions.push({
      ...question,
      note: question.note,
      label: '?',
      role: 'chord-tone',
      midi: midiAt(question),
    });
  }
  if (search.mode === 'find' && feedback) {
    positions.push({
      ...feedback.cell,
      note: '',
      label: rootFor(chromaAt(tuning, feedback.cell)),
      role: feedback.correct ? 'root' : 'outside',
      midi: midiAt(feedback.cell),
    });
  }

  const accuracy = stats.attempts
    ? Math.round((stats.hits / stats.attempts) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Notas no braço
        </h1>
        <p className="text-muted-foreground">
          {search.mode === 'find'
            ? 'Clique numa casa com a nota pedida, dentro das cordas e da região escolhidas.'
            : 'Diga qual nota está na casa marcada.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ChoiceTabs
          id="trainer-mode"
          label="Modo"
          options={TRAINER_MODES}
          value={search.mode}
          onChange={changeMode}
          format={(mode) => MODES[mode]}
        />
        <ChoiceTabs
          id="trainer-region"
          label="Casas"
          options={REGIONS}
          value={search.region}
          onChange={(region) => setSearch({ region })}
          format={(region) => region.replace('-', '–')}
        />
        <div className="flex items-center gap-2">
          <span id="trainer-strings-label" className="text-sm font-medium">
            Cordas
          </span>
          <div
            role="group"
            aria-labelledby="trainer-strings-label"
            className="flex gap-1"
          >
            {Array.from({ length: stringCount }, (_, i) => i + 1).map((s) => (
              <Toggle
                key={s}
                variant="outline"
                size="sm"
                pressed={strings.includes(s)}
                onPressedChange={() => toggleString(s)}
                aria-label={`Corda ${s}`}
                className="min-w-8 tabular-nums"
              >
                {s}
              </Toggle>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-2xl font-semibold" aria-live="polite">
            {question
              ? search.mode === 'find'
                ? `Encontre ${question.note}`
                : 'Qual é esta nota?'
              : 'Escolha ao menos uma corda.'}
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-1">
            {guitar.failed && (
              <span role="status" className="text-sm text-muted-foreground">
                Não foi possível carregar o som.
              </span>
            )}
            <TuningMenu />
          </div>
        </div>
        <Fretboard
          positions={positions}
          frets={FRETS}
          strings={stringCount}
          label={
            search.mode === 'find'
              ? `Braço para encontrar ${question?.note ?? ''}`
              : `Braço com a corda ${question?.string}, casa ${question?.fret} marcada`
          }
          onSelect={search.mode === 'find' ? answerFind : undefined}
        />
        {search.mode === 'name' && question && (
          <div className="grid grid-cols-6 gap-2 sm:flex sm:flex-wrap">
            {ROOTS.map((note) => (
              <Button
                key={note}
                variant="outline"
                className="min-w-12"
                onClick={() => answerName(note)}
              >
                {note}
              </Button>
            ))}
          </div>
        )}
        <p
          role="status"
          className={cn(
            'min-h-6',
            feedback?.correct ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {feedback?.text}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Placar</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStats(resetStats());
              setStreak(0);
            }}
          >
            Zerar placar
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            ['Sequência', streak],
            ['Melhor sequência', stats.bestStreak],
            ['Acertos', `${stats.hits}/${stats.attempts}`],
            ['Precisão', `${accuracy}%`],
            [
              'Melhor tempo',
              stats.bestMs === null
                ? '—'
                : `${(stats.bestMs / 1000).toFixed(1)} s`,
            ],
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
