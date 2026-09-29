import { LinkRow, Related } from '@/components/theory/related';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMetronome } from '@/hooks/use-metronome';
import {
  type ExerciseLink,
  findExercise,
  SUBDIVISIONS,
  UNITS,
} from '@/lib/technique/catalog';
import { listChords, listScales } from '@/lib/theory/engine';
import { cn } from '@/lib/utils';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Play, Square } from 'lucide-react';
import { useState } from 'react';

const route = getRouteApi('/technique/$id');
const BEATS = 4;
const MIN_BPM = 20;
const MAX_BPM = 400;
const SCALES = listScales();
const CHORDS = listChords();

export function TechniqueExercisePage() {
  const { id } = route.useParams();
  const exercise = findExercise(id);

  if (!exercise) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Exercício não encontrado
        </h1>
        <Link to="/technique" className="hover:underline">
          Ver todos os exercícios
        </Link>
      </div>
    );
  }

  const e = exercise;
  const unit = UNITS[e.metric];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Link
          to="/technique"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Técnica
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{e.name}</h1>
        <p className="text-muted-foreground">
          {e.category} ·{' '}
          {e.metric === 'bpm'
            ? SUBDIVISIONS[e.subdivision]
            : 'uma troca por clique'}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-x-12 gap-y-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Início sugerido</span>
          <span className="text-4xl font-semibold tabular-nums">
            {e.start} <span className="text-lg font-normal">{unit}</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Alvo</span>
          <span className="text-4xl font-semibold tabular-nums">
            {e.target} <span className="text-lg font-normal">{unit}</span>
          </span>
        </div>
      </div>

      <Practice key={e.id} start={e.start} unit={unit} chords={e.chords} />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Padrão</h2>
        <pre className="w-fit max-w-full overflow-x-auto rounded-xl border p-4 font-mono text-sm leading-relaxed">
          {e.tab.join('\n')}
        </pre>
        {e.chords && (
          <p className="text-muted-foreground tabular-nums">
            {e.chords.map((c) => `${c.symbol}: ${c.frets}`).join(' · ')}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Como praticar</h2>
        <ul className="flex max-w-prose list-disc flex-col gap-2 pl-5">
          {e.howTo.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      {e.links.length > 0 && (
        <Related title="Relacionado na biblioteca">
          <LinkRow>
            {e.links.map((link) => (
              <LibraryLink
                key={`${link.kind}:${link.id}@${link.root}`}
                link={link}
              />
            ))}
          </LinkRow>
        </Related>
      )}
    </div>
  );
}

function Practice({
  start,
  unit,
  chords = [],
}: {
  start: number;
  unit: string;
  chords?: { symbol: string }[];
}) {
  const [bpm, setBpm] = useState(start);
  const metronome = useMetronome({ bpm, beats: BEATS });
  const beat = metronome.beat ?? 0;
  const apply = (value: number) =>
    setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value) || start)));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <Button
          disabled={metronome.loading}
          onClick={() =>
            metronome.running ? metronome.stop() : metronome.start()
          }
        >
          {metronome.running ? (
            <Square data-icon="inline-start" />
          ) : (
            <Play data-icon="inline-start" />
          )}
          {metronome.loading
            ? 'Carregando…'
            : metronome.running
              ? 'Parar'
              : 'Metrônomo'}
        </Button>
        <div className="flex items-center gap-2">
          <Label htmlFor="technique-bpm">{unit}</Label>
          <Input
            key={bpm}
            id="technique-bpm"
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            defaultValue={bpm}
            className="w-20 tabular-nums"
            onBlur={(event) => apply(Number(event.currentTarget.value))}
            onKeyDown={(event) =>
              event.key === 'Enter' && apply(Number(event.currentTarget.value))
            }
          />
        </div>
        <div className="flex gap-2" aria-hidden>
          {Array.from({ length: BEATS }, (_, i) => (
            <span
              key={i}
              className={cn(
                'size-2.5 rounded-full bg-muted',
                metronome.running && beat % BEATS === i && 'bg-foreground',
              )}
            />
          ))}
        </div>
        {metronome.failed && (
          <span className="text-sm text-muted-foreground">
            Não foi possível iniciar o áudio.
          </span>
        )}
      </div>

      {chords.length > 0 && (
        <p className="text-3xl font-semibold" aria-live="polite">
          {chords[beat % chords.length].symbol}
          <span className="ml-4 text-xl font-normal text-muted-foreground">
            depois {chords[(beat + 1) % chords.length].symbol}
          </span>
        </p>
      )}
    </section>
  );
}

function LibraryLink({ link }: { link: ExerciseLink }) {
  const position = link.position ? `, posição ${link.position}` : '';
  const suffix = CHORDS.find((c) => c.id === link.id)?.suffix ?? '';

  if (link.kind === 'scale') {
    const scale = SCALES.find((s) => s.id === link.id);
    return (
      <Link
        to="/scales/$id"
        params={{ id: link.id }}
        search={{ root: link.root, position: link.position }}
      >
        {scale?.name ?? link.id} de {link.root}
        {position}
      </Link>
    );
  }
  if (link.kind === 'arpeggio') {
    return (
      <Link
        to="/arpeggios/$id"
        params={{ id: link.id }}
        search={{ root: link.root, position: link.position }}
      >
        Arpejo de {link.root}
        {suffix}
        {position}
      </Link>
    );
  }
  return (
    <Link
      to="/chords/$id"
      params={{ id: link.id }}
      search={{ root: link.root }}
    >
      Acorde {link.root}
      {suffix}
    </Link>
  );
}
