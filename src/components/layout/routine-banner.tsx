import { Button } from '@/components/ui/button';
import { audioContext } from '@/hooks/use-guitar';
import { useElapsed } from '@/hooks/use-practice';
import { useRoutineTimer } from '@/hooks/use-routine-timer';
import { playClick } from '@/lib/clicks';
import { formatDuration } from '@/lib/practice-log';
import {
  skipRoutineBlock,
  stopRoutine,
  tickRoutine,
} from '@/lib/routine-timer';
import { Link, useRouter } from '@tanstack/react-router';
import { SkipForward, Square } from 'lucide-react';
import { useEffect } from 'react';

function beep() {
  const context = audioContext();
  void context.resume();
  playClick(context, 'beep', 'accent', context.currentTime);
}

export function RoutineBanner() {
  const timer = useRoutineTimer();
  const router = useRouter();
  const blockStart = timer
    ? timer.endsAt - timer.blocks[timer.index].minutes * 60_000
    : undefined;
  const elapsed = useElapsed(blockStart);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => {
      if (tickRoutine()) beep();
    }, 500);
    return () => clearInterval(id);
  }, [timer]);

  if (!timer) return null;
  const block = timer.blocks[timer.index];
  const remaining = Math.max(0, block.minutes * 60 - elapsed);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-muted/50 px-6 py-2 text-sm md:px-10">
      <Link to="/practice-routine" className="font-medium hover:underline">
        Rotina {timer.index + 1}/{timer.blocks.length}
      </Link>
      <button
        type="button"
        onClick={() => router.history.push(block.href)}
        className="hover:underline"
      >
        {block.kind}: {block.title}
      </button>
      <span className="font-semibold tabular-nums">
        {formatDuration(remaining)}
      </span>
      <div className="ml-auto flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => skipRoutineBlock()}>
          <SkipForward data-icon="inline-start" />
          Pular
        </Button>
        <Button variant="ghost" size="sm" onClick={stopRoutine}>
          <Square data-icon="inline-start" />
          Parar
        </Button>
      </div>
    </div>
  );
}
