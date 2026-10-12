import { useElapsed, usePractice } from '@/hooks/use-practice';
import {
  formatDuration,
  startPractice,
  stopPractice,
} from '@/lib/practice-log';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Square, Timer } from 'lucide-react';

export function PracticeTimer({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const { running } = usePractice();
  const elapsed = useElapsed(running?.session);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => (running ? stopPractice() : startPractice(path, title))}
        className={cn(
          'flex h-8 flex-1 items-center gap-2 rounded-xl border px-2 text-sm transition-colors hover:bg-muted',
          running ? 'border-highlight' : 'text-muted-foreground',
        )}
      >
        {running ? <Square className="size-4" /> : <Timer className="size-4" />}
        {running ? (
          <span className="tabular-nums" aria-live="off">
            Praticando · {formatDuration(elapsed)}
          </span>
        ) : (
          'Iniciar prática'
        )}
      </button>
      <Link
        to="/practice-log"
        className="rounded-xl px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
      >
        Diário
      </Link>
    </div>
  );
}
