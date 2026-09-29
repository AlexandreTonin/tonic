import { ToneSelect } from '@/components/audio/tone-select';
import { PrintableFretboard } from '@/components/fretboard/printable-fretboard';
import { LinkRow, Related } from '@/components/theory/related';
import { CatalogSelect, RootTabs } from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import { useGuitar } from '@/hooks/use-guitar';
import type { Consonance } from '@/lib/theory/core';
import { getFretboard, getInterval, listIntervals } from '@/lib/theory/engine';
import { getRouteApi, Link } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, Play } from 'lucide-react';
import { useMemo } from 'react';

const route = getRouteApi('/intervals/$id');
const FRETS = 22;
const INTERVALS = listIntervals();
const CONSONANCE: Record<Consonance, string> = {
  perfect: 'Consonância perfeita',
  imperfect: 'Consonância imperfeita',
  dissonant: 'Dissonância',
};

export function IntervalPage() {
  const { id } = route.useParams();
  const { root } = route.useSearch();
  const navigate = route.useNavigate();

  const data = useMemo(() => {
    if (!INTERVALS.some((i) => i.id === id)) return undefined;
    return {
      interval: getInterval(id, root),
      positions: getFretboard({
        item: `interval:${id}`,
        root,
        labelMode: 'intervals',
        frets: FRETS,
      }),
    };
  }, [id, root]);

  const guitar = useGuitar();

  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Intervalo não encontrado
        </h1>
        <Link
          to="/intervals"
          search={{ root, view: 'gallery' }}
          className="hover:underline"
        >
          Ver todos os intervalos
        </Link>
      </div>
    );
  }

  const { interval, positions } = data;
  const inversion = INTERVALS.find((i) => i.label === interval.inversion);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Intervalos</h1>
          <ViewToggle
            value="explore"
            onChange={() =>
              navigate({ to: '/intervals', search: { root, view: 'gallery' } })
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-1 text-muted-foreground">
          <div className="flex flex-col">
            <span>
              Intervalo: {interval.name} ({interval.label})
            </span>
            <span>Tônica: {interval.root}</span>
          </div>
          <div className="flex flex-col">
            <span>Notas: {interval.notes.join(' – ')}</span>
            <span className="tabular-nums">
              Tamanho: {interval.semitones}{' '}
              {interval.semitones === 1 ? 'semitom' : 'semitons'}
            </span>
          </div>
          <div className="flex flex-col">
            <span>{CONSONANCE[interval.consonance]}</span>
            <span>Inversão: {interval.inversion}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <RootTabs
          id="interval-root"
          value={root}
          onChange={(root) =>
            navigate({ to: '.', search: { root }, replace: true })
          }
        />
        <CatalogSelect
          id="interval-id"
          label="Intervalo"
          items={INTERVALS}
          value={id}
          onChange={(id) =>
            navigate({ to: '/intervals/$id', params: { id }, search: { root } })
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          disabled={guitar.loading}
          onClick={() => guitar.melody(interval.midi)}
        >
          <ArrowUp data-icon="inline-start" />
          Subindo
        </Button>
        <Button
          variant="outline"
          disabled={guitar.loading}
          onClick={() => guitar.melody([...interval.midi].reverse())}
        >
          <ArrowDown data-icon="inline-start" />
          Descendo
        </Button>
        <Button
          variant="outline"
          disabled={guitar.loading}
          onClick={() => guitar.strum(interval.midi)}
        >
          <Play data-icon="inline-start" />
          Junto
        </Button>
        <ToneSelect id="interval-tone" />
        {guitar.loading && (
          <span className="text-sm text-muted-foreground">Carregando som…</span>
        )}
        {guitar.failed && (
          <span className="text-sm text-muted-foreground">
            Não foi possível carregar o som.
          </span>
        )}
      </div>

      <PrintableFretboard
        title={`${interval.name} (${interval.label}) a partir de ${interval.root}`}
        details={`Notas: ${interval.notes.join(' – ')} · ${interval.semitones} ${interval.semitones === 1 ? 'semitom' : 'semitons'} · Rótulo: intervalos`}
        positions={positions}
        frets={FRETS}
        label={`Braço com ${interval.notes.join(' e ')}`}
      />

      {inversion && (
        <Related title="Relacionado">
          <LinkRow>
            <Link
              to="/intervals/$id"
              params={{ id: inversion.id }}
              search={{ root }}
            >
              Inversão: {inversion.name} ({inversion.label})
            </Link>
          </LinkRow>
        </Related>
      )}
    </div>
  );
}
