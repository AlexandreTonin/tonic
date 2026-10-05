import { ToneMenu } from '@/components/audio/tone-select';
import { ChordDiagram } from '@/components/chord-diagram/chord-diagram';
import { ExportButtons } from '@/components/fretboard/export-buttons';
import { PrintableFretboard } from '@/components/fretboard/printable-fretboard';
import type { ExportLayout } from '@/lib/fretboard-export';
import { LABEL_NAMES } from '@/lib/labels';
import {
  CatalogSelect,
  ChoiceTabs,
  LabelMenu,
  RootTabs,
} from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import { useGuitar } from '@/hooks/use-guitar';
import {
  getChord,
  getChordVoicings,
  getFretboard,
  listChords,
} from '@/lib/theory/engine';
import { cn } from '@/lib/utils';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Play } from 'lucide-react';
import { useMemo, useRef } from 'react';

const route = getRouteApi('/chords/$id');
const FRETS = 22;
const CHORDS = listChords();
const VIEWS = { notes: 'Notas do acorde', shape: 'Forma' } as const;
const SHAPE_LAYOUT: ExportLayout = {
  columns: 1,
  itemScale: 2.5,
  printMaxWidth: '70mm',
};
const SHAPES_LAYOUT: ExportLayout = {
  columns: 4,
  itemScale: 1.5,
  printMaxWidth: '100%',
};
type View = keyof typeof VIEWS;
const VIEW_IDS = Object.keys(VIEWS) as View[];

const shapeKey = (frets: (number | null)[]) =>
  frets.map((f) => f ?? 'x').join('-');

export function ChordPage() {
  const { id: chordId } = route.useParams();
  const search = route.useSearch();
  const { root, labels: labelMode, view, shape: selectedShape } = search;
  const navigate = route.useNavigate();

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({
      to: '.',
      search: { ...search, ...patch },
      replace: true,
    });

  const data = useMemo(() => {
    if (!CHORDS.some((c) => c.id === chordId)) return undefined;
    return {
      chord: getChord(chordId, root),
      voicings: getChordVoicings(chordId, { root, labelMode }),
      positions: getFretboard({
        item: `chord:${chordId}`,
        root,
        labelMode,
        frets: FRETS,
      }),
    };
  }, [chordId, root, labelMode]);

  const guitar = useGuitar();
  const shapesRef = useRef<HTMLDivElement>(null);

  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Acorde não encontrado
        </h1>
        <Link
          to="/chords"
          search={{ root, view: 'gallery' }}
          className="hover:underline"
        >
          Ver todos os acordes
        </Link>
      </div>
    );
  }

  const { chord, voicings } = data;
  const shape =
    voicings.find((v) => shapeKey(v.frets) === selectedShape) ?? voicings[0];
  const shapeTab = shape?.frets.map((f) => f ?? 'x').join(' ');
  const positions = view === 'shape' ? shape?.positions : data.positions;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Acordes</h1>
          <ViewToggle
            value="explore"
            onChange={() =>
              navigate({ to: '/chords', search: { root, view: 'gallery' } })
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-1 text-muted-foreground">
          <div className="flex flex-col">
            <span>
              Acorde: {chord.symbol} ({chord.name})
            </span>
            <span>Tônica: {chord.root}</span>
          </div>

          <div className="flex flex-col">
            <span>Fórmula: {chord.intervals.join(' ')}</span>
            <span>Notas: {chord.notes.join(' ')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CatalogSelect
            id="chord-id"
            label="Acorde"
            items={CHORDS}
            value={chordId}
            onChange={(id) =>
              navigate({
                to: '/chords/$id',
                params: { id },
                search: { ...search, shape: undefined },
              })
            }
          />
          <RootTabs
            id="chord-root"
            value={root}
            onChange={(root) => setSearch({ root, shape: undefined })}
          />
        </div>

        {positions && (
          <PrintableFretboard
            toolbar={
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <ChoiceTabs
                  id="chord-view"
                  label="Braço"
                  options={VIEW_IDS}
                  value={view}
                  onChange={(view) => setSearch({ view })}
                  format={(view) => VIEWS[view]}
                />
                {view === 'shape' && shapeTab && (
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {shapeTab}
                  </span>
                )}
              </div>
            }
            actions={
              <>
                {guitar.failed && (
                  <span role="status" className="text-sm text-muted-foreground">
                    Não foi possível carregar o som.
                  </span>
                )}
                {view === 'shape' && shape && (
                  <Button
                    variant="outline"
                    disabled={guitar.loading}
                    onClick={() =>
                      guitar.strum(shape.positions.map((p) => p.midi))
                    }
                  >
                    <Play data-icon="inline-start" />
                    {guitar.loading ? (
                      'Carregando som…'
                    ) : (
                      <>
                        Tocar<span className="sr-only"> forma</span>
                      </>
                    )}
                  </Button>
                )}
                <ToneMenu />
                <LabelMenu
                  value={labelMode}
                  onChange={(labels) => setSearch({ labels })}
                />
              </>
            }
            title={
              view === 'shape'
                ? `${chord.symbol} · forma ${shapeTab}`
                : `${chord.symbol} (${chord.name}) · notas do acorde`
            }
            details={`Notas: ${chord.notes.join(' ')} · Fórmula: ${chord.intervals.join(' ')} · Rótulo: ${LABEL_NAMES[labelMode]}`}
            positions={positions}
            frets={FRETS}
            barre={view === 'shape' ? shape?.barre : null}
            exportContent={
              view === 'shape' &&
              shape && (
                <div data-export-item data-caption={shapeTab}>
                  <ChordDiagram voicing={shape} label={chord.symbol} />
                </div>
              )
            }
            exportLayout={SHAPE_LAYOUT}
            label={
              view === 'shape'
                ? `Forma ${shapeTab} de ${chord.symbol} no braço`
                : `Braço com as notas de ${chord.symbol}`
            }
          />
        )}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Formas</h2>
          {voicings.length > 0 && (
            <ExportButtons
              target={shapesRef}
              layout={SHAPES_LAYOUT}
              title={`${chord.symbol} (${chord.name}) · todas as formas`}
              details={`Notas: ${chord.notes.join(' ')} · Fórmula: ${chord.intervals.join(' ')} · Rótulo: ${LABEL_NAMES[labelMode]}`}
              printLabel="Imprimir todas"
              downloadLabel="Baixar todas"
            />
          )}
        </div>
        {voicings.length === 0 && (
          <p className="text-muted-foreground">
            Nenhuma forma com a tônica no baixo cabe numa mão para este acorde.
          </p>
        )}
        <div ref={shapesRef} className="flex flex-wrap gap-6">
          {voicings.map((v) => {
            const key = shapeKey(v.frets);
            const selected = view === 'shape' && v === shape;
            const name = `${chord.symbol} ${v.frets.map((f) => f ?? 'x').join(' ')}`;
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  data-export-item
                  data-caption={v.frets.map((f) => f ?? 'x').join(' ')}
                  aria-pressed={selected}
                  onClick={() => setSearch({ shape: key, view: 'shape' })}
                  className={cn(
                    'w-52 rounded-xl border border-transparent p-2 transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none',
                    selected && 'border-highlight',
                  )}
                >
                  <ChordDiagram voicing={v} label={chord.symbol} />
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Tocar ${name}`}
                  disabled={guitar.loading}
                  onClick={() => guitar.strum(v.positions.map((p) => p.midi))}
                >
                  <Play />
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
