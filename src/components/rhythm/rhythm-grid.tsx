import { BeatNotation } from '@/components/rhythm/beat-notation';
import type { BeatFigures, RhythmStep } from '@/lib/theory/rhythm';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

type RhythmGridProps = {
  grid: RhythmStep[];
  figures: BeatFigures[];
  meter: string;
  stepsPerBeat: number;
  current?: number | null;
  offsets?: (number | null)[];
};

const signed = (ms: number) => (ms > 0 ? `+${ms}` : String(ms));

export function RhythmGrid({
  grid,
  figures,
  meter,
  stepsPerBeat,
  current,
  offsets,
}: RhythmGridProps) {
  const [top, bottom] = meter.split('/');
  return (
    <div
      className="flex flex-wrap items-start gap-y-6"
      role="img"
      aria-label={`${describe(grid)}. Figuras: ${figures
        .map(
          (b, i) => `tempo ${i + 1}: ${b.events.map((e) => e.name).join(', ')}`,
        )
        .join('; ')}`}
    >
      <div
        className="mt-10 mr-3 flex flex-col text-center text-2xl leading-6 font-semibold tabular-nums"
        aria-hidden
      >
        <span>{top}</span>
        <span>{bottom}</span>
      </div>
      {figures.map((figure, beat) => (
        <div
          key={beat}
          className="flex flex-col border-l px-2 [&:nth-child(2)]:border-l-0"
        >
          <span className="h-4 text-sm leading-4 text-muted-foreground">
            {beat + 1}
          </span>
          <BeatNotation beat={figure} stepsPerBeat={stepsPerBeat} />
          <div className="flex">
            {grid.map((step, i) =>
              step.beat !== beat ? null : (
                <div key={i} className="flex w-11 flex-col items-center gap-1">
                  <span
                    className="h-4 text-sm leading-4 font-semibold"
                    aria-hidden
                  >
                    {step.accent ? '>' : ''}
                  </span>
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md border border-transparent',
                      i === current && 'border-highlight',
                    )}
                  >
                    {step.state === 'hit' && (
                      <span className="size-5 rounded-sm bg-foreground" />
                    )}
                    {step.state === 'sustain' && (
                      <span className="h-1.5 w-full rounded-full bg-foreground" />
                    )}
                    {step.state === 'rest' && (
                      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </span>
                  {step.stroke === 'down' ? (
                    <ArrowDown className={arrowClass(step)} />
                  ) : (
                    <ArrowUp className={arrowClass(step)} />
                  )}
                  {offsets && (
                    <span className="h-4 text-xs leading-4 text-muted-foreground tabular-nums">
                      {step.state !== 'hit'
                        ? ''
                        : offsets[i] === null || offsets[i] === undefined
                          ? '—'
                          : signed(offsets[i]!)}
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const arrowClass = (step: RhythmStep) =>
  cn(
    'size-4',
    step.state === 'hit' ? 'text-foreground' : 'text-muted-foreground/40',
  );

function describe(grid: RhythmStep[]) {
  const words = { hit: 'toca', sustain: 'sustenta', rest: 'pausa' };
  return grid
    .map(
      (s) =>
        `${s.sub === 0 ? `tempo ${s.beat + 1}: ` : ''}${words[s.state]}${
          s.state === 'hit'
            ? ` para ${s.stroke === 'down' ? 'baixo' : 'cima'}${s.accent ? ' com acento' : ''}`
            : ''
        }`,
    )
    .join(', ');
}
