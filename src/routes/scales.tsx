import { ToneSelect } from '@/components/audio/tone-select';
import { PrintableFretboard } from '@/components/fretboard/printable-fretboard';
import { LABEL_NAMES } from '@/lib/labels';
import {
  CatalogSelect,
  LabelModeSelect,
  PositionTabs,
  RootTabs,
} from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import { useGuitar } from '@/hooks/use-guitar';
import { getFretboard, getScale, listScales } from '@/lib/theory/engine';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { useMemo, useState } from 'react';

const route = getRouteApi('/scales/$id');
const FRETS = 22;
const SCALES = listScales();

export function ScalePage() {
  const { id: scaleId } = route.useParams();
  const search = route.useSearch();
  const { root, labels: labelMode, position } = search;
  const navigate = route.useNavigate();

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({
      to: '.',
      search: { ...search, ...patch },
      replace: true,
    });

  const positionCount = SCALES.find((s) => s.id === scaleId)?.positions ?? 0;
  const activePosition =
    position && position <= positionCount ? position : undefined;

  const view = useMemo(() => {
    if (!SCALES.some((s) => s.id === scaleId)) return undefined;
    return {
      scale: getScale(scaleId, root),
      positions: getFretboard({
        item: `scale:${scaleId}`,
        root,
        labelMode,
        frets: FRETS,
        position: activePosition,
      }),
    };
  }, [scaleId, root, labelMode, activePosition]);

  const guitar = useGuitar();
  const [playingMidi, setPlayingMidi] = useState<number | null>(null);

  if (!view) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Escala não encontrada
        </h1>
        <Link
          to="/scales"
          search={{ root, view: 'gallery' }}
          className="hover:underline"
        >
          Ver todas as escalas
        </Link>
      </div>
    );
  }

  const { scale, positions } = view;
  const scaleMidis = activePosition
    ? positions
        .filter((p) => p.role !== 'outside')
        .map((p) => p.midi)
        .sort((a, b) => a - b)
    : scale.midi;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Escalas</h1>
          <ViewToggle
            value="explore"
            onChange={() =>
              navigate({ to: '/scales', search: { root, view: 'gallery' } })
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-1 text-muted-foreground">
          <div className="flex flex-col">
            <span>Escala: {scale.name}</span>
            <span>Tônica: {scale.root}</span>
          </div>

          <div className="flex flex-col">
            <span>Graus: {scale.intervals.join(' ')}</span>
            <span>Notas: {scale.notes.join(' ')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <RootTabs
          id="scale-root"
          value={root}
          onChange={(root) => setSearch({ root })}
        />
        <CatalogSelect
          id="scale-id"
          label="Escala"
          items={SCALES}
          value={scaleId}
          onChange={(id) =>
            navigate({ to: '/scales/$id', params: { id }, search })
          }
        />
        <LabelModeSelect
          id="scale-label-mode"
          value={labelMode}
          onChange={(labels) => setSearch({ labels })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {positionCount > 0 && (
          <PositionTabs
            id="scale-position"
            count={positionCount}
            value={activePosition}
            onChange={(position) => setSearch({ position })}
          />
        )}
        <Button
          variant="outline"
          disabled={!scaleMidis.length || guitar.loading}
          onClick={() => guitar.upAndDown(scaleMidis, setPlayingMidi)}
        >
          <Play data-icon="inline-start" />
          {guitar.loading ? 'Carregando som…' : 'Tocar escala'}
        </Button>
        <ToneSelect id="scale-tone" />
        {guitar.failed && (
          <span className="text-sm text-muted-foreground">
            Não foi possível carregar o som.
          </span>
        )}
      </div>

      <PrintableFretboard
        title={`${scale.root} ${scale.name}${activePosition ? ` · posição ${activePosition}` : ''}`}
        details={`Notas: ${scale.notes.join(' ')} · Graus: ${scale.intervals.join(' ')} · Rótulo: ${LABEL_NAMES[labelMode]}`}
        positions={positions}
        frets={FRETS}
        activeMidi={playingMidi}
        label={`Braço com ${scale.root} ${scale.name}${activePosition ? `, posição ${activePosition}` : ''}`}
      />
    </div>
  );
}
