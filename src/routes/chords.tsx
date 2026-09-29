import { ToneSelect } from '@/components/audio/tone-select';
import { ChordDiagram } from '@/components/chord-diagram/chord-diagram';
import { Fretboard } from '@/components/fretboard/fretboard';
import {
  CatalogSelect,
  LabelModeSelect,
  RootTabs,
} from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useMemo } from 'react';

const route = getRouteApi('/chords/$id');
const FRETS = 22;
const CHORDS = listChords();
const VIEWS = { notes: 'Notas do acorde', shape: 'Forma' } as const;
type View = keyof typeof VIEWS;

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

      <div className="flex flex-wrap gap-6">
        <RootTabs
          id="chord-root"
          value={root}
          onChange={(root) => setSearch({ root, shape: undefined })}
        />
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
        <LabelModeSelect
          id="chord-label-mode"
          value={labelMode}
          onChange={(labels) => setSearch({ labels })}
        />
        <ToneSelect id="chord-tone" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Label id="chord-view-label">Braço</Label>
          <Tabs
            value={view}
            onValueChange={(v: View) => setSearch({ view: v })}
          >
            <TabsList aria-labelledby="chord-view-label">
              {Object.entries(VIEWS).map(([value, label]) => (
                <TabsTrigger key={value} value={value} className="px-3">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {view === 'shape' && shapeTab && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {shapeTab}
            </span>
          )}
        </div>

        {positions && (
          <Fretboard
            positions={positions}
            frets={FRETS}
            barre={view === 'shape' ? shape?.barre : null}
            label={
              view === 'shape'
                ? `Forma ${shapeTab} de ${chord.symbol} no braço`
                : `Braço com as notas de ${chord.symbol}`
            }
          />
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Formas</h2>
        {guitar.failed && (
          <p className="text-muted-foreground">
            Não foi possível carregar o som.
          </p>
        )}
        {voicings.length === 0 && (
          <p className="text-muted-foreground">
            Nenhuma forma com a tônica no baixo cabe numa mão para este acorde.
          </p>
        )}
        <div className="flex flex-wrap gap-6">
          {voicings.map((v) => {
            const key = shapeKey(v.frets);
            const selected = view === 'shape' && v === shape;
            const name = `${chord.symbol} ${v.frets.map((f) => f ?? 'x').join(' ')}`;
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <button
                  type="button"
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
