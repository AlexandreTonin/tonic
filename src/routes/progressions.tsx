import { ToneMenu } from '@/components/audio/tone-select';
import { ChordDiagram } from '@/components/chord-diagram/chord-diagram';
import { PrintableFretboard } from '@/components/fretboard/printable-fretboard';
import { LABEL_NAMES } from '@/lib/labels';
import { LinkRow, Related } from '@/components/theory/related';
import {
  CatalogSelect,
  ChoiceTabs,
  LabelMenu,
  RootTabs,
} from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { MenuButton } from '@/components/ui/menu-button';
import { useProgressionPlayer } from '@/hooks/use-progression-player';
import { grooveFor, type Track, TRACK_LABELS, TRACKS } from '@/lib/backing';
import type { HarmonicFunction } from '@/lib/theory/core';
import {
  getFretboard,
  getProgression,
  listProgressions,
} from '@/lib/theory/engine';
import { cn } from '@/lib/utils';
import { PROGRESSION_STRUMS } from '@/router/search';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Layers, Play, Square } from 'lucide-react';
import { useMemo, useState } from 'react';

const route = getRouteApi('/progressions/$id');
const FRETS = 22;
const BEATS = 4;
const PROGRESSIONS = listProgressions();
const FUNCTIONS: Record<HarmonicFunction, string> = {
  tonic: 'Tônica',
  subdominant: 'Subdominante',
  dominant: 'Dominante',
  'secondary-dominant': 'Dominante secundária',
};
const SCALE_MODES = { key: 'Do tom', chord: 'Por acorde' } as const;
const SCALE_MODE_IDS = Object.keys(SCALE_MODES) as (keyof typeof SCALE_MODES)[];

const uniqueBy = <T,>(items: T[], key: (item: T) => string) => [
  ...new Map(items.map((i) => [key(i), i])).values(),
];

export function ProgressionPage() {
  const { id } = route.useParams();
  const search = route.useSearch();
  const { root, labels, bpm, scales, strums } = search;
  const navigate = route.useNavigate();

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ to: '.', search: { ...search, ...patch }, replace: true });

  const progression = useMemo(
    () =>
      PROGRESSIONS.some((p) => p.id === id)
        ? getProgression(id, root)
        : undefined,
    [id, root],
  );
  const bars = progression?.bars ?? [];

  const [selected, setSelected] = useState(0);
  const [muted, setMuted] = useState<Set<Track>>(() => new Set());
  const toggleTrack = (track: Track) =>
    setMuted((current) => {
      const next = new Set(current);
      if (next.has(track)) next.delete(track);
      else next.add(track);
      return next;
    });
  const player = useProgressionPlayer({
    bars: bars.map((b) => ({
      ...b,
      strum: b.voicing?.positions.map((p) => p.midi) ?? [],
    })),
    bpm,
    beats: BEATS,
    strums,
    groove: grooveFor(progression?.category ?? ''),
    muted,
  });
  const current =
    player.bar !== null && player.bar >= 0 ? player.bar : selected;
  const bar = bars[Math.min(current, bars.length - 1)];
  const scale =
    scales === 'chord'
      ? (bar?.scale ?? progression?.scale)
      : progression?.scale;

  const positions = useMemo(
    () =>
      scale &&
      bar &&
      getFretboard({
        item: `scale:${scale.id}`,
        root: scale.root,
        labelMode: labels,
        frets: FRETS,
        highlight: bar.symbol,
      }),
    [scale, bar, labels],
  );

  if (!progression) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Progressão não encontrada
        </h1>
        <Link
          to="/progressions"
          search={{ root, view: 'gallery' }}
          className="hover:underline"
        >
          Ver todas as progressões
        </Link>
      </div>
    );
  }

  const keyName = `${progression.root} ${progression.mode === 'major' ? 'maior' : 'menor'}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Progressões</h1>
          <ViewToggle
            value="explore"
            onChange={() =>
              navigate({
                to: '/progressions',
                search: { root, view: 'gallery' },
              })
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-1 text-muted-foreground">
          <div className="flex flex-col">
            <span>Progressão: {progression.name}</span>
            <span>Tom: {keyName}</span>
          </div>
          <div className="flex flex-col">
            <span>
              Escala: {progression.scale.name} de {progression.scale.root}
            </span>
            <span>{progression.bars.length} compassos</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CatalogSelect
            id="progression-id"
            label="Progressão"
            items={PROGRESSIONS}
            value={id}
            onChange={(id) => {
              player.stop();
              setSelected(0);
              navigate({ to: '/progressions/$id', params: { id }, search });
            }}
          />
          <RootTabs
            id="progression-root"
            value={root}
            onChange={(root) => setSearch({ root })}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ChoiceTabs
              id="progression-strums"
              label="Batidas por compasso"
              options={PROGRESSION_STRUMS}
              value={strums}
              onChange={(strums) => setSearch({ strums })}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="progression-bpm">BPM</Label>
              <Input
                key={bpm}
                id="progression-bpm"
                type="number"
                min={40}
                max={240}
                defaultValue={bpm}
                className="w-20 tabular-nums"
                onBlur={(e) =>
                  setSearch({ bpm: Number(e.currentTarget.value) })
                }
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  setSearch({ bpm: Number(e.currentTarget.value) })
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {player.bar === -1 && (
              <span role="status" className="text-sm text-muted-foreground">
                Contando…
              </span>
            )}
            {player.failed && (
              <span role="status" className="text-sm text-muted-foreground">
                Não foi possível carregar o som.
              </span>
            )}
            <Button
              disabled={player.loading}
              onClick={() => (player.playing ? player.stop() : player.start())}
            >
              {player.playing ? (
                <Square data-icon="inline-start" />
              ) : (
                <Play data-icon="inline-start" />
              )}
              {player.loading
                ? 'Carregando som…'
                : player.playing
                  ? 'Parar'
                  : 'Tocar em loop'}
            </Button>
            <DropdownMenu>
              <MenuButton icon={Layers}>
                Faixas
                {muted.size > 0 && (
                  <span className="text-muted-foreground tabular-nums">
                    ({TRACKS.length - muted.size}/{TRACKS.length})
                  </span>
                )}
              </MenuButton>
              <DropdownMenuContent align="end" className="w-auto min-w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Faixas</DropdownMenuLabel>
                  {TRACKS.map((track) => (
                    <DropdownMenuCheckboxItem
                      key={track}
                      checked={!muted.has(track)}
                      onCheckedChange={() => toggleTrack(track)}
                    >
                      {TRACK_LABELS[track]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ToneMenu />
          </div>
        </div>
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {bars.map((b, i) => {
          const active = i === current;
          return (
            <li key={i}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={`Compasso ${i + 1}: ${b.symbol}, ${FUNCTIONS[b.function]}`}
                onClick={() => setSelected(i)}
                className={cn(
                  'flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none',
                  active && 'border-highlight',
                )}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-semibold">{b.symbol}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                </span>
                <span className="text-sm">{b.degree}</span>
                <span className="text-sm text-muted-foreground">
                  {FUNCTIONS[b.function]}
                </span>
                {b.voicing && (
                  <span className="mt-1 hidden sm:block">
                    <ChordDiagram voicing={b.voicing} label={b.symbol} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {bar && scale && positions && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {scale.name} de {scale.root} sobre {bar.symbol}
          </h2>
          <PrintableFretboard
            toolbar={
              <ChoiceTabs
                id="progression-scales"
                label="Escala"
                options={SCALE_MODE_IDS}
                value={scales}
                onChange={(scales) => setSearch({ scales })}
                format={(mode) => SCALE_MODES[mode]}
              />
            }
            actions={
              <LabelMenu
                value={labels}
                onChange={(labels) => setSearch({ labels })}
              />
            }
            title={`${scale.name} de ${scale.root} sobre ${bar.symbol}`}
            details={`${progression.name} em ${keyName} · compasso ${Math.min(current, bars.length - 1) + 1} (${bar.degree}) · Rótulo: ${LABEL_NAMES[labels]}`}
            positions={positions}
            frets={FRETS}
            label={`${scale.name} de ${scale.root} com as notas de ${bar.symbol} destacadas`}
          />
        </div>
      )}

      <Related title="Escalas por acorde">
        <dl className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-3">
          {uniqueBy(progression.bars, (b) => b.symbol).map((b) => (
            <div key={b.symbol} className="contents">
              <dt className="font-medium">{b.symbol}</dt>
              <dd>
                <LinkRow>
                  {b.scale && (
                    <Link
                      to="/scales/$id"
                      params={{ id: b.scale.id }}
                      search={{ root: b.scale.root }}
                    >
                      {b.scale.root} {b.scale.name}
                    </Link>
                  )}
                  <Link
                    to="/chords/$id"
                    params={{ id: b.chordId }}
                    search={{ root: b.root }}
                  >
                    Acorde
                  </Link>
                  <Link
                    to="/arpeggios/$id"
                    params={{ id: b.chordId }}
                    search={{ root: b.root }}
                  >
                    Arpejo
                  </Link>
                </LinkRow>
              </dd>
            </div>
          ))}
        </dl>
      </Related>

      <Related title="Relacionado">
        <LinkRow>
          <Link
            to="/harmonic-field"
            search={{ root: progression.root, mode: progression.mode }}
          >
            Campo harmônico de {keyName}
          </Link>
          <Link
            to="/scales/$id"
            params={{ id: progression.scale.id }}
            search={{ root: progression.scale.root }}
          >
            {progression.scale.name} de {progression.scale.root}
          </Link>
        </LinkRow>
      </Related>
    </div>
  );
}
