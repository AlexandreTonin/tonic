import { TuningMenu } from '@/components/fretboard/tuning-menu';
import { Button } from '@/components/ui/button';
import { useTuner } from '@/hooks/use-tuner';
import { useTuning } from '@/hooks/use-tuning';
import { midiFromFrequency, nearestString } from '@/lib/pitch';
import { ROOTS } from '@/lib/roots';
import { openMidis, TUNINGS } from '@/lib/theory/core';
import { cn } from '@/lib/utils';
import { Mic, MicOff } from 'lucide-react';

const IN_TUNE_CENTS = 5;
const METER_CENTS = 50;

const STATUS_MESSAGES = {
  denied:
    'Sem acesso ao microfone. Libere a permissão nas configurações do navegador e tente de novo.',
  unsupported: 'Este navegador não dá acesso ao microfone.',
  error: 'Não foi possível abrir o microfone.',
} as const;

const noteName = (midi: number) =>
  `${ROOTS[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;

export function TunerPage() {
  const tuner = useTuner();
  const [tuningId] = useTuning();
  const tuning = TUNINGS[tuningId];
  const opens = openMidis(tuning);

  const midi =
    tuner.frequency === null ? null : midiFromFrequency(tuner.frequency);
  const nearest = midi === null ? null : Math.round(midi);
  const cents = midi === null ? 0 : Math.round((midi - nearest!) * 100);
  const stringIndex = midi === null ? null : nearestString(midi, opens);
  const stringCents =
    midi === null || stringIndex === null
      ? 0
      : Math.round((midi - opens[stringIndex]) * 100);
  const inTune = midi !== null && Math.abs(cents) <= IN_TUNE_CENTS;
  const needle =
    50 +
    (Math.max(-METER_CENTS, Math.min(METER_CENTS, cents)) / METER_CENTS) * 50;
  const listening = tuner.status === 'listening';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Afinador</h1>
        <p className="text-muted-foreground">
          Toque uma corda solta perto do microfone. O áudio é analisado no
          navegador e não é enviado para lugar nenhum.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={listening ? tuner.stop : tuner.start}>
          {listening ? (
            <MicOff data-icon="inline-start" />
          ) : (
            <Mic data-icon="inline-start" />
          )}
          {listening ? 'Parar' : 'Ligar microfone'}
        </Button>
        <div className="ml-auto">
          <TuningMenu />
        </div>
      </div>

      {tuner.status in STATUS_MESSAGES && (
        <p role="alert" className="text-muted-foreground">
          {STATUS_MESSAGES[tuner.status as keyof typeof STATUS_MESSAGES]}
        </p>
      )}

      <section
        aria-label="Leitura do afinador"
        className="flex flex-col items-center gap-6 rounded-xl border p-6"
      >
        <div className="flex flex-col items-center gap-1" aria-live="polite">
          <span
            className={cn(
              'text-6xl font-semibold tabular-nums',
              inTune && 'text-highlight',
            )}
          >
            {nearest === null ? '—' : noteName(nearest)}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {midi === null
              ? listening
                ? 'Toque uma nota'
                : 'Microfone desligado'
              : `${cents > 0 ? '+' : ''}${cents} cents · ${tuner.frequency!.toFixed(1)} Hz${inTune ? ' · afinado' : ''}`}
          </span>
        </div>

        <div className="relative h-10 w-full max-w-md" aria-hidden>
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <div className="absolute top-1 bottom-1 left-1/2 w-px bg-foreground" />
          {[-25, 25].map((c) => (
            <div
              key={c}
              className="absolute top-3 bottom-3 w-px bg-border"
              style={{ left: `${50 + (c / METER_CENTS) * 50}%` }}
            />
          ))}
          {midi !== null && (
            <div
              className={cn(
                'absolute top-0 bottom-0 w-1 -translate-x-1/2 rounded-full transition-[left] duration-100 motion-reduce:transition-none',
                inTune ? 'bg-highlight' : 'bg-muted-foreground',
              )}
              style={{ left: `${needle}%` }}
            />
          )}
          <span className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
            −50
          </span>
          <span className="absolute right-0 -bottom-5 text-xs text-muted-foreground">
            +50
          </span>
        </div>

        <ol className="mt-4 flex flex-wrap justify-center gap-2">
          {tuning.map((note, i) => {
            const active = i === stringIndex;
            return (
              <li
                key={i}
                className={cn(
                  'flex min-w-14 flex-col items-center rounded-xl border px-3 py-2',
                  active && 'border-highlight',
                )}
              >
                <span className="text-xs text-muted-foreground">
                  Corda {tuning.length - i}
                </span>
                <span className="font-semibold">{note}</span>
              </li>
            );
          })}
        </ol>
        {stringIndex !== null && (
          <p className="text-muted-foreground tabular-nums">
            Corda {tuning.length - stringIndex} ({tuning[stringIndex]}):{' '}
            {Math.abs(stringCents) <= IN_TUNE_CENTS
              ? 'afinada'
              : stringCents < 0
                ? `${-stringCents} cents abaixo, aperte`
                : `${stringCents} cents acima, afrouxe`}
          </p>
        )}
      </section>
    </div>
  );
}
