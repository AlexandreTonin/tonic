import { ChoiceTabs } from '@/components/theory/theory-controls';
import { Button } from '@/components/ui/button';
import { useRoutineTimer } from '@/hooks/use-routine-timer';
import { dayKey, startPractice } from '@/lib/practice-log';
import { generateRoutine, ROUTINE_MINUTES } from '@/lib/practice-routine';
import {
  routineFinished,
  startRoutine,
  stopRoutine,
} from '@/lib/routine-timer';
import { newLickSeed } from '@/lib/theory/lick';
import { cn } from '@/lib/utils';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import { Play, RefreshCw, Square } from 'lucide-react';

const route = getRouteApi('/practice-routine');
const todaySeed = () => dayKey(new Date()).replaceAll('-', '');

export function PracticeRoutinePage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const router = useRouter();
  const timer = useRoutineTimer();
  const blocks = generateRoutine(search.minutes, search.seed ?? todaySeed());
  const running = timer !== null;

  const change = (patch: { minutes?: number; seed?: string }) => {
    stopRoutine();
    navigate({ to: '.', search: (s) => ({ ...s, ...patch }), replace: true });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Rotina de estudo
        </h1>
        <p className="text-muted-foreground">
          {search.seed
            ? 'Uma rotina sorteada. '
            : 'A rotina de hoje: a mesma o dia todo, outra amanhã. '}
          Comece o timer e abra cada bloco: ele já vem configurado, e a barra no
          topo acompanha o tempo em qualquer tela.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ChoiceTabs
          id="routine-minutes"
          label="Duração"
          options={ROUTINE_MINUTES}
          value={search.minutes}
          onChange={(minutes) => change({ minutes })}
          format={(m) => `${m} min`}
        />
        <Button variant="ghost" onClick={() => change({ seed: newLickSeed() })}>
          <RefreshCw data-icon="inline-start" />
          Nova rotina
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {running ? (
          <Button variant="outline" onClick={stopRoutine}>
            <Square data-icon="inline-start" />
            Parar rotina
          </Button>
        ) : (
          <Button
            onClick={() => {
              startPractice('/practice-routine', 'Rotina de estudo');
              startRoutine(blocks);
            }}
          >
            <Play data-icon="inline-start" />
            Começar rotina
          </Button>
        )}
        {!running && routineFinished() && (
          <p role="status" className="text-muted-foreground">
            Rotina concluída. Bom trabalho!
          </p>
        )}
      </div>

      <ol className="flex flex-col gap-3">
        {blocks.map((block, i) => {
          const active = timer?.index === i;
          return (
            <li
              key={block.kind}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4',
                active && 'border-highlight',
              )}
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  {i + 1}. {block.kind} · {block.minutes} min
                </span>
                <span className="font-semibold">{block.title}</span>
                <span className="text-sm text-muted-foreground">
                  {block.detail}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => router.history.push(block.href)}
              >
                Abrir
              </Button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
