import { ToneSelect } from '@/components/audio/tone-select';
import { Fretboard } from '@/components/fretboard/fretboard';
import { LinkRow, Related } from '@/components/theory/related';
import {
  CatalogSelect,
  LabelModeSelect,
  PositionTabs,
  RootTabs,
} from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import { useGuitar } from '@/hooks/use-guitar';
import {
  getArpeggio,
  getArpeggioOverlays,
  getFretboard,
  listChords,
} from '@/lib/theory/engine';
import { cn } from '@/lib/utils';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { useMemo, useState } from 'react';

const route = getRouteApi('/arpeggios/$id');
const FRETS = 22;
const CHORDS = listChords();
const PENTATONIC_NAMES = {
  'minor-pentatonic': 'Pentatônica menor',
  'major-pentatonic': 'Pentatônica maior',
};
const ROLES = { 3: 'a partir da 3ª', 5: 'a partir da 5ª', 7: 'a partir da 7ª' };

export function ArpeggioPage() {
  const { id } = route.useParams();
  const search = route.useSearch();
  const { root, labels, over: selectedOver, position } = search;
  const navigate = route.useNavigate();

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ to: '.', search: { ...search, ...patch }, replace: true });

  const base = useMemo(() => {
    if (!CHORDS.some((c) => c.id === id)) return undefined;
    return {
      arpeggio: getArpeggio(id, root),
      overlays: getArpeggioOverlays(id, root),
    };
  }, [id, root]);

  const over = base?.overlays.some((o) => o.symbol === selectedOver)
    ? selectedOver
    : undefined;

  const positions = useMemo(
    () =>
      base &&
      getFretboard({
        item: `arpeggio:${id}`,
        root,
        labelMode: over ? 'degrees' : labels,
        context: over,
        frets: FRETS,
        position,
      }),
    [base, id, root, labels, over, position],
  );

  const guitar = useGuitar();
  const [playingMidi, setPlayingMidi] = useState<number | null>(null);

  if (!base || !positions) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Arpejo não encontrado
        </h1>
        <Link
          to="/arpeggios"
          search={{ root, view: 'gallery' }}
          className="hover:underline"
        >
          Ver todos os arpejos
        </Link>
      </div>
    );
  }

  const { arpeggio, overlays } = base;
  const midis = position
    ? positions
        .filter((p) => p.role !== 'outside')
        .map((p) => p.midi)
        .sort((a, b) => a - b)
    : arpeggio.midi;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Arpejos</h1>
          <ViewToggle
            value="explore"
            onChange={() =>
              navigate({ to: '/arpeggios', search: { root, view: 'gallery' } })
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-1 text-muted-foreground">
          <div className="flex flex-col">
            <span>
              Arpejo: {arpeggio.symbol} ({arpeggio.name})
            </span>
            <span>Tônica: {arpeggio.root}</span>
          </div>
          <div className="flex flex-col">
            <span>Fórmula: {arpeggio.intervals.join(' ')}</span>
            <span>Notas: {arpeggio.notes.join(' ')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <RootTabs
          id="arpeggio-root"
          value={root}
          onChange={(root) => setSearch({ root, over: undefined })}
        />
        <CatalogSelect
          id="arpeggio-id"
          label="Arpejo"
          items={CHORDS}
          value={id}
          onChange={(id) =>
            navigate({
              to: '/arpeggios/$id',
              params: { id },
              search: { ...search, over: undefined },
            })
          }
        />
        {!over && (
          <LabelModeSelect
            id="arpeggio-label-mode"
            value={labels}
            onChange={(labels) => setSearch({ labels })}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <PositionTabs
          id="arpeggio-position"
          count={arpeggio.positions}
          value={position}
          onChange={(position) => setSearch({ position })}
        />
        <Button
          variant="outline"
          disabled={!midis.length || guitar.loading}
          onClick={() => guitar.upAndDown(midis, setPlayingMidi)}
        >
          <Play data-icon="inline-start" />
          {guitar.loading ? 'Carregando som…' : 'Tocar arpejo'}
        </Button>
        <ToneSelect id="arpeggio-tone" />
        {guitar.failed && (
          <span className="text-sm text-muted-foreground">
            Não foi possível carregar o som.
          </span>
        )}
        {over && (
          <span className="text-muted-foreground">
            Graus sobre {over}{' '}
            <button
              type="button"
              className="text-foreground underline-offset-4 hover:underline"
              onClick={() => setSearch({ over: undefined })}
            >
              Limpar
            </button>
          </span>
        )}
      </div>

      <Fretboard
        positions={positions}
        frets={FRETS}
        activeMidi={playingMidi}
        label={`Braço com o arpejo de ${arpeggio.symbol}${position ? `, posição ${position}` : ''}${over ? ` em graus sobre ${over}` : ''}`}
      />

      <Related
        title="Toque sobre"
        isEmpty={overlays.length === 0}
        empty="Este arpejo não pertence a nenhum tom maior: sem sobreposições diatônicas."
      >
        <ul className="flex flex-col">
          {overlays.map((o) => {
            const selected = o.symbol === over;
            return (
              <li key={o.symbol}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setSearch({ over: selected ? undefined : o.symbol })
                  }
                  className={cn(
                    'grid w-full grid-cols-[6rem_1fr] items-baseline gap-4 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none sm:grid-cols-[6rem_9rem_1fr]',
                    selected && 'border-highlight',
                  )}
                >
                  <span className="font-medium">{o.symbol}</span>
                  <span className="hidden text-sm text-muted-foreground sm:inline">
                    {ROLES[o.role]}
                  </span>
                  <span className="tabular-nums">{o.degrees.join(' ')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Related>

      <Related title="Relacionado">
        <LinkRow>
          <Link to="/chords/$id" params={{ id }} search={{ root }}>
            Acorde {arpeggio.symbol}
          </Link>
          <Link
            to="/scales/$id"
            params={{ id: arpeggio.pentatonic }}
            search={{ root: arpeggio.root, position }}
          >
            {PENTATONIC_NAMES[arpeggio.pentatonic]} de {arpeggio.root}
            {position ? `, posição ${position}` : ''}
          </Link>
        </LinkRow>
      </Related>
    </div>
  );
}
