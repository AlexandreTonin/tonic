import { ToneMenu } from '@/components/audio/tone-select';
import { ExportButtons } from '@/components/fretboard/export-buttons';
import { Fretboard } from '@/components/fretboard/fretboard';
import { PrintableFretboard } from '@/components/fretboard/printable-fretboard';
import { TabSvg } from '@/components/fretboard/tab-svg';
import { LABEL_NAMES } from '@/lib/labels';
import {
  CatalogSelect,
  PositionTabs,
  RootTabs,
} from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { audioContext, startNote, useGuitar } from '@/hooks/use-guitar';
import { useProgressionPlayer } from '@/hooks/use-progression-player';
import type { Track } from '@/lib/backing';
import {
  getChord,
  getFretboard,
  getLick,
  getScale,
  LICK_SCALES,
  listScales,
} from '@/lib/theory/engine';
import {
  beatLabel,
  type Lick,
  LICK_BARS,
  LICK_STYLES,
  newLickSeed,
} from '@/lib/theory/lick';
import { FRETBOARD_LAYOUT } from '@/lib/fretboard-export';
import {
  favoriteId,
  type LickFavorite,
  loadFavorites,
  toggleFavorite,
} from '@/lib/lick-favorites';
import { cn } from '@/lib/utils';
import { getRouteApi, Link } from '@tanstack/react-router';
import {
  ChevronDown,
  Drum,
  Eye,
  Gauge,
  Play,
  Repeat,
  Shuffle,
  SlidersHorizontal,
  Square,
  Star,
  Type,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

const route = getRouteApi('/scales/$id');
const FRETS = 22;
const SCALES = listScales();
const LICK_TEMPOS = [60, 80, 100, 120] as const;
const LEGATO_VELOCITY = 70;
const BEATS_PER_BAR = 4;
const MAX_BPM = 200;
const EPSILON = 1e-6;
const BACKING_MUTED = new Set<Track>(['guitar', 'click']);
const ACCELERATE_STEPS = [0, 2, 5] as const;
const LICK_VIEWS = {
  tab: 'Tab',
  explain: 'Explicação',
  ear: 'Treino de ouvido',
} as const;
type LickView = keyof typeof LICK_VIEWS;
const AUTO_STYLE = 'auto';
const STYLE_OPTIONS = [AUTO_STYLE, ...LICK_STYLES.map((s) => s.id)];
const STYLE_NAMES: Record<string, string> = {
  [AUTO_STYLE]: 'Variado',
  ...Object.fromEntries(LICK_STYLES.map((s) => [s.id, s.name])),
};
const TAB_LEGEND =
  'h hammer-on · p pull-off · / \\ slide · b bend · r release · b¼ curl · ~ vibrato';

function ChoiceTabs<T extends string | number>({
  id,
  label,
  options,
  value,
  onChange,
  format = String,
}: {
  id: string;
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label id={`${id}-label`}>{label}</Label>
      <Tabs
        value={String(value)}
        onValueChange={(v: string) => {
          const option = options.find((o) => String(o) === v);
          if (option !== undefined) onChange(option);
        }}
      >
        <TabsList aria-labelledby={`${id}-label`}>
          {options.map((o) => (
            <TabsTrigger key={o} value={String(o)} className="min-w-9 px-3">
              {format(o)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export function ScalePage() {
  const { id: scaleId } = route.useParams();
  const search = route.useSearch();
  const {
    root,
    labels: labelMode,
    position,
    lick: lickSeed,
    bars,
    style: lickStyle,
    easy,
    span,
  } = search;
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
      allPositions: getFretboard({
        item: `scale:${scaleId}`,
        root,
        labelMode,
        frets: FRETS,
      }),
      lick:
        lickSeed && LICK_SCALES.includes(scaleId)
          ? getLick(scaleId, root, activePosition ?? 1, bars, lickSeed, {
              style: lickStyle,
              easy,
              span,
            })
          : undefined,
    };
  }, [
    scaleId,
    root,
    labelMode,
    activePosition,
    bars,
    lickSeed,
    lickStyle,
    easy,
    span,
  ]);

  const guitar = useGuitar();
  const [playingMidi, setPlayingMidi] = useState<number | null>(null);
  const [playingNote, setPlayingNote] = useState<number | null>(null);
  const [lickBpm, setLickBpm] = useState(80);
  const [lickLoop, setLickLoop] = useState(false);
  const [countIn, setCountIn] = useState(false);
  const [accelerate, setAccelerate] = useState(0);
  const [playingBpm, setPlayingBpm] = useState<number | null>(null);
  const [withBacking, setWithBacking] = useState(false);
  const [lickView, setLickView] = useState<LickView>('tab');
  const explain = lickView === 'explain';
  const earTraining = lickView === 'ear';
  const [revealed, setRevealed] = useState<string>();
  const [lickOnly, setLickOnly] = useState(false);
  const [favorites, setFavorites] = useState(loadFavorites);
  const lickExport = useRef<HTMLDivElement>(null);
  const cues = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lickStart = useRef<{ lick?: Lick; beat: number }>({ beat: 0 });

  const lickBeats = bars * BEATS_PER_BAR;
  const tempoAt = (beat: number) =>
    Math.min(
      MAX_BPM,
      lickBpm +
        accelerate * Math.floor(Math.max(0, beat - BEATS_PER_BAR) / lickBeats),
    );
  const cue = (time: number, run: () => void) =>
    cues.current.push(
      setTimeout(run, Math.max(0, (time - audioContext().currentTime) * 1000)),
    );
  const vamp = useMemo(() => {
    const chord = getChord('dom7', root);
    return { root: chord.root, notes: chord.notes, intervals: chord.intervals };
  }, [root]);
  const backing = useProgressionPlayer({
    bars: Array.from({ length: bars }, () => ({ ...vamp, strum: [] })),
    bpm: tempoAt,
    beats: BEATS_PER_BAR,
    strums: 1,
    groove: 'shuffle',
    muted: BACKING_MUTED,
    onBeat: (beat, time, instrument) => {
      const lick = view?.lick;
      if (!lick || beat < BEATS_PER_BAR) return;
      if (lickStart.current.lick !== lick || beat === BEATS_PER_BAR) {
        if (beat % BEATS_PER_BAR) return;
        lickStart.current = { lick, beat };
      }
      const beatLength = 60 / tempoAt(beat);
      const offset = (beat - lickStart.current.beat) % lick.beats;
      if (offset === 0) cue(time, () => setPlayingBpm(tempoAt(beat)));
      lick.notes.forEach((n, index) => {
        if (n.start < offset - EPSILON || n.start >= offset + 1 - EPSILON)
          return;
        const at = time + (n.start - offset) * beatLength;
        if (instrument)
          startNote(
            instrument,
            {
              ...n,
              velocity: n.technique ? LEGATO_VELOCITY : undefined,
            },
            at,
            n.duration * beatLength,
          );
        cue(at, () => {
          setPlayingMidi(n.midi);
          setPlayingNote(index);
        });
      });
    },
  });

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

  const { scale, positions, lick: currentLick } = view;
  const lickPosition = activePosition ?? 1;
  const answerHidden = earTraining && !!currentLick && revealed !== lickSeed;
  const lickFrets = new Set(
    currentLick?.notes.map((n) => `${n.string}:${n.fret}`),
  );
  const boardPositions =
    lickOnly && currentLick && !answerHidden
      ? view.allPositions.map((p) =>
          lickFrets.has(`${p.string}:${p.fret}`)
            ? p
            : { ...p, role: 'outside' as const },
        )
      : positions;
  const favorite: LickFavorite | undefined =
    currentLick && lickSeed
      ? {
          scale: scaleId,
          root,
          position: lickPosition,
          bars,
          lick: lickSeed,
          style: lickStyle,
          easy,
          span,
          title: `${scale.root} ${scale.name} · posição ${lickPosition}${span ? `-${(lickPosition % 5) + 1}` : ''} · ${bars} comp. · ${currentLick.style}${easy ? ' · iniciante' : ''}`,
        }
      : undefined;
  const saved =
    !!favorite && favorites.some((f) => favoriteId(f) === favoriteId(favorite));
  const appendix =
    currentLick && explain
      ? [
          {
            heading: 'Como o lick foi construído',
            lines: [currentLick.summary],
          },
          ...currentLick.bars.map((b) => ({
            heading: b.label,
            lines: [b.text],
          })),
          {
            heading: 'Nota a nota',
            lines: currentLick.notes.map(
              (n) =>
                `${beatLabel(n.start)} · ${n.note} (${n.degree}) · ${n.role}: ${n.why}`,
            ),
          },
        ]
      : undefined;

  const playLick = (
    l: Lick,
    { bpm = lickBpm, loop = lickLoop, count = countIn, step = accelerate } = {},
  ) =>
    guitar.sequence(
      l.notes.map((n) => ({
        ...n,
        velocity: n.technique ? LEGATO_VELOCITY : undefined,
      })),
      {
        bpm,
        loop,
        countIn: count ? BEATS_PER_BAR : 0,
        accelerate: loop ? step : 0,
        onPass: setPlayingBpm,
        onNote: (midi, index) => {
          setPlayingMidi(midi);
          setPlayingNote(index ?? null);
        },
      },
    );

  const lickPlaying = withBacking ? backing.playing : guitar.sequencing;
  const replay = (options: Parameters<typeof playLick>[1]) => {
    if (guitar.sequencing && currentLick) playLick(currentLick, options);
  };

  const stopLoop = () => {
    if (backing.playing) backing.stop();
    if (guitar.sequencing) guitar.stop();
    cues.current.forEach(clearTimeout);
    cues.current = [];
    setPlayingMidi(null);
    setPlayingNote(null);
  };

  const startLick = (l: Lick) => {
    if (!withBacking) return playLick(l);
    if (!backing.playing) void backing.start();
  };

  const setLick = (patch: Partial<typeof search>) => {
    if (!withBacking) stopLoop();
    setSearch(patch);
  };

  const generateLick = () => {
    const seed = newLickSeed();
    setSearch({ position: lickPosition, lick: seed });
    startLick(
      getLick(scaleId, root, lickPosition, bars, seed, {
        style: lickStyle,
        easy,
        span,
      }),
    );
  };
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
        <div className="flex flex-col text-muted-foreground">
          <span>Graus: {scale.intervals.join(' ')}</span>
          <span>Notas: {scale.notes.join(' ')}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CatalogSelect
            id="scale-id"
            label="Escala"
            items={SCALES}
            value={scaleId}
            onChange={(id) => {
              stopLoop();
              navigate({ to: '/scales/$id', params: { id }, search });
            }}
          />
          <RootTabs
            id="scale-root"
            value={root}
            onChange={(root) => {
              stopLoop();
              setSearch({ root });
            }}
          />
        </div>

        <PrintableFretboard
          toolbar={
            positionCount > 0 && (
              <PositionTabs
                id="scale-position"
                count={positionCount}
                value={activePosition}
                onChange={(position) => {
                  stopLoop();
                  setSearch({ position });
                }}
              />
            )
          }
          actions={
            <>
              {guitar.failed && (
                <span role="status" className="text-sm text-muted-foreground">
                  Não foi possível carregar o som.
                </span>
              )}
              <Button
                variant="outline"
                disabled={!scaleMidis.length || guitar.loading}
                onClick={() => {
                  stopLoop();
                  void guitar.upAndDown(scaleMidis, setPlayingMidi);
                }}
              >
                <Play data-icon="inline-start" />
                {guitar.loading ? (
                  'Carregando som…'
                ) : (
                  <>
                    Tocar<span className="sr-only"> escala</span>
                  </>
                )}
              </Button>
              <ToneMenu />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      aria-label={`Exibição: ${LABEL_NAMES[labelMode]}`}
                    />
                  }
                >
                  <Type data-icon="inline-start" />
                  <span className="capitalize">{LABEL_NAMES[labelMode]}</span>
                  <ChevronDown
                    data-icon="inline-end"
                    className="text-muted-foreground"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Rótulo das notas</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={labelMode}
                      onValueChange={(labels: typeof labelMode) =>
                        setSearch({ labels })
                      }
                    >
                      <DropdownMenuRadioItem value="notes">
                        Notas
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="intervals">
                        Intervalos
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                  {currentLick && !answerHidden && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Lick</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                          checked={lickOnly}
                          onCheckedChange={setLickOnly}
                        >
                          Só as notas do lick
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuGroup>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
          title={`${scale.root} ${scale.name}${activePosition ? ` · posição ${activePosition}` : ''}`}
          details={`Notas: ${scale.notes.join(' ')} · Graus: ${scale.intervals.join(' ')} · Rótulo: ${LABEL_NAMES[labelMode]}`}
          positions={boardPositions}
          frets={FRETS}
          activeMidi={answerHidden ? null : playingMidi}
          label={`Braço com ${scale.root} ${scale.name}${activePosition ? `, posição ${activePosition}` : ''}`}
        />
      </div>

      {LICK_SCALES.includes(scaleId) && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight">Lick</h2>
            <p className="text-muted-foreground">
              Uma frase de blues nova a cada clique,{' '}
              {span
                ? `entre as posições ${lickPosition} e ${(lickPosition % 5) + 1}`
                : `dentro da posição ${lickPosition}`}
              , terminando numa nota do acorde.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="lick-style">Estilo</Label>
                <Select
                  value={lickStyle ?? AUTO_STYLE}
                  items={STYLE_NAMES}
                  onValueChange={(style) =>
                    style &&
                    setLick({
                      style: style === AUTO_STYLE ? undefined : style,
                    })
                  }
                >
                  <SelectTrigger id="lick-style" className="min-w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map((style) => (
                      <SelectItem key={style} value={style}>
                        {STYLE_NAMES[style]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ChoiceTabs
                id="lick-bars"
                label="Compassos"
                options={LICK_BARS}
                value={bars}
                onChange={(bars) => setLick({ bars })}
              />
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" />}>
                    <SlidersHorizontal data-icon="inline-start" />
                    Ajustes
                    {(easy || span) && (
                      <span className="text-muted-foreground tabular-nums">
                        ({Number(easy) + Number(span)})
                      </span>
                    )}
                    <ChevronDown
                      data-icon="inline-end"
                      className="text-muted-foreground"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-auto min-w-64">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Como gerar</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem
                        checked={easy}
                        onCheckedChange={(easy) => setLick({ easy })}
                      >
                        Modo iniciante
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={span}
                        onCheckedChange={(span) => setLick({ span })}
                      >
                        Atravessar para a posição {(lickPosition % 5) + 1}
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  disabled={guitar.loading || backing.loading}
                  onClick={generateLick}
                >
                  <Shuffle data-icon="inline-start" />
                  Gerar lick
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <Tabs
                  value={lickView}
                  onValueChange={(view: LickView) => setLickView(view)}
                >
                  <TabsList aria-label="Como ver o lick">
                    {(Object.keys(LICK_VIEWS) as LickView[]).map((view) => (
                      <TabsTrigger key={view} value={view} className="px-3">
                        {LICK_VIEWS[view]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className="flex flex-wrap items-center gap-1">
                  <span
                    aria-live="polite"
                    className="text-sm text-muted-foreground tabular-nums"
                  >
                    {lickPlaying && accelerate > 0 && playingBpm
                      ? `Tocando a ${playingBpm} BPM`
                      : ''}
                  </span>
                  {lickPlaying ? (
                    <Button variant="outline" onClick={stopLoop}>
                      <Square data-icon="inline-start" />
                      Parar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={
                        !currentLick || guitar.loading || backing.loading
                      }
                      onClick={() => currentLick && startLick(currentLick)}
                    >
                      <Play data-icon="inline-start" />
                      {backing.loading ? (
                        'Carregando base…'
                      ) : (
                        <>
                          Tocar<span className="sr-only"> lick</span>
                        </>
                      )}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          aria-label={`Andamento: ${lickBpm} BPM`}
                        />
                      }
                    >
                      <Gauge data-icon="inline-start" />
                      <span className="tabular-nums">{lickBpm} BPM</span>
                      <ChevronDown
                        data-icon="inline-end"
                        className="text-muted-foreground"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-auto min-w-64"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Andamento</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={lickBpm}
                          onValueChange={(bpm: number) => {
                            setLickBpm(bpm);
                            replay({ bpm });
                          }}
                        >
                          {LICK_TEMPOS.map((bpm) => (
                            <DropdownMenuRadioItem key={bpm} value={bpm}>
                              {bpm} BPM
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>
                          Acelerar a cada volta
                          {!(lickLoop || withBacking) && ' (com loop ou base)'}
                        </DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={accelerate}
                          onValueChange={(step: number) => {
                            setAccelerate(step);
                            replay({ step });
                          }}
                        >
                          {ACCELERATE_STEPS.map((step) => (
                            <DropdownMenuRadioItem
                              key={step}
                              value={step}
                              disabled={!(lickLoop || withBacking)}
                            >
                              {step ? `+${step} BPM` : 'Manter o andamento'}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          aria-label={`Acompanhamento: ${withBacking ? `base de blues ${vamp.root}7` : 'sem base'}`}
                        />
                      }
                    >
                      <Drum data-icon="inline-start" />
                      {withBacking ? `Base ${vamp.root}7` : 'Sem base'}
                      <ChevronDown
                        data-icon="inline-end"
                        className="text-muted-foreground"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-auto min-w-64"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Acompanhamento</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={withBacking}
                          onValueChange={(on: boolean) => {
                            stopLoop();
                            setWithBacking(on);
                          }}
                        >
                          <DropdownMenuRadioItem value={false}>
                            Sem base
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value={true}>
                            Base de blues ({vamp.root}7)
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          aria-label={`Repetição: ${withBacking || lickLoop ? 'em loop' : 'uma vez'}${!withBacking && countIn ? ', com contagem' : ''}`}
                        />
                      }
                    >
                      <Repeat data-icon="inline-start" />
                      {withBacking || lickLoop ? 'Loop' : 'Uma vez'}
                      {!withBacking && countIn && (
                        <span className="text-muted-foreground">
                          · Contagem
                        </span>
                      )}
                      <ChevronDown
                        data-icon="inline-end"
                        className="text-muted-foreground"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-auto min-w-64"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>
                          Repetição
                          {withBacking && ' (a base já repete e conta)'}
                        </DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                          checked={withBacking || lickLoop}
                          disabled={withBacking}
                          onCheckedChange={(loop) => {
                            setLickLoop(loop);
                            if (!loop) stopLoop();
                          }}
                        >
                          Loop
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={withBacking || countIn}
                          disabled={withBacking}
                          onCheckedChange={(count) => {
                            setCountIn(count);
                            replay({ count });
                          }}
                        >
                          Contagem de 1 compasso
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {currentLick && !answerHidden && (
                    <>
                      {favorite && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Salvar lick"
                                aria-pressed={saved}
                                onClick={() =>
                                  setFavorites(toggleFavorite(favorite))
                                }
                              />
                            }
                          >
                            <Star className={cn(saved && 'fill-current')} />
                          </TooltipTrigger>
                          <TooltipContent>
                            {saved ? 'Salvo' : 'Salvar'}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <ExportButtons
                        compact
                        target={lickExport}
                        layout={FRETBOARD_LAYOUT}
                        appendix={appendix}
                        title={`Lick em ${scale.root} ${scale.name} · posição ${lickPosition}`}
                        details={`Estilo: ${currentLick.style} · Forma: ${currentLick.form} · ${currentLick.bars.length} compasso${currentLick.bars.length > 1 ? 's' : ''} · ${lickBpm} BPM`}
                      />
                    </>
                  )}
                </div>
              </div>
              {currentLick && answerHidden && (
                <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
                  <span className="text-muted-foreground">
                    Ouça o lick e tente tocar antes de ver a tab.
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setRevealed(lickSeed)}
                  >
                    <Eye data-icon="inline-start" />
                    Mostrar resposta
                  </Button>
                </div>
              )}
              {!currentLick && (
                <p className="text-muted-foreground">
                  Clique em Gerar lick para criar uma frase.
                </p>
              )}
              {currentLick && !answerHidden && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">
                    Estilo: {currentLick.style} · {TAB_LEGEND}
                  </span>
                  <div ref={lickExport} className="hidden">
                    <div data-export-item data-caption={TAB_LEGEND}>
                      <TabSvg
                        lines={currentLick.tab}
                        label={`Tab do lick em ${scale.root} ${scale.name}`}
                      />
                    </div>
                    <div
                      data-export-item
                      data-caption={`${scale.root} ${scale.name} · posição ${lickPosition}`}
                    >
                      <Fretboard
                        positions={boardPositions}
                        frets={FRETS}
                        label={`Posição ${lickPosition} de ${scale.root} ${scale.name}`}
                      />
                    </div>
                  </div>
                  <pre className="w-fit max-w-full overflow-x-auto rounded-xl border p-4 font-mono text-sm leading-relaxed">
                    {currentLick.tab.map((line, s) => {
                      const cell =
                        playingNote !== null &&
                        currentLick.notes[playingNote]?.string === s + 1
                          ? currentLick.cells[playingNote]
                          : undefined;
                      const end = cell ? cell.column + cell.width : 0;
                      return (
                        <span key={s}>
                          {cell ? (
                            <>
                              {line.slice(0, cell.column)}
                              <mark className="rounded-sm bg-highlight text-highlight-foreground">
                                {line.slice(cell.column, end)}
                              </mark>
                              {line.slice(end)}
                            </>
                          ) : (
                            line
                          )}
                          {'\n'}
                        </span>
                      );
                    })}
                  </pre>
                </div>
              )}
            </div>
          </div>
          {currentLick && explain && !answerHidden && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold tracking-tight">
                Como o lick foi construído
              </h3>
              <p className="max-w-prose">{currentLick.summary}</p>
              <ul className="flex max-w-prose flex-col gap-3">
                {currentLick.bars.map((bar) => (
                  <li key={bar.label} className="flex flex-col">
                    <span className="font-medium">{bar.label}</span>
                    <span className="text-muted-foreground">{bar.text}</span>
                  </li>
                ))}
              </ul>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="p-2 font-medium">Onde</th>
                      <th className="p-2 font-medium">Nota</th>
                      <th className="p-2 font-medium">Grau</th>
                      <th className="p-2 font-medium">Função</th>
                      <th className="p-2 font-medium">Por quê</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLick.notes.map((n, i) => (
                      <tr
                        key={n.start}
                        className={cn(
                          'border-b last:border-0',
                          i === playingNote && 'bg-muted',
                        )}
                      >
                        <td className="p-2 whitespace-nowrap tabular-nums">
                          {beatLabel(n.start)}
                        </td>
                        <td className="p-2">{n.note}</td>
                        <td className="p-2">{n.degree}</td>
                        <td
                          className={cn(
                            'p-2',
                            n.role === 'Repouso' && 'text-highlight',
                            n.role === 'Tensão' && 'font-semibold',
                          )}
                        >
                          {n.role}
                        </td>
                        <td className="min-w-64 p-2 text-muted-foreground">
                          {n.why}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {favorites.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold tracking-tight">
                Licks salvos
              </h3>
              <ul className="flex flex-col gap-1">
                {favorites.map((f) => (
                  <li key={favoriteId(f)} className="flex items-center gap-1">
                    <Button
                      variant="link"
                      className="h-auto px-0"
                      onClick={() => {
                        stopLoop();
                        navigate({
                          to: '/scales/$id',
                          params: { id: f.scale },
                          search: {
                            ...search,
                            root: f.root as typeof root,
                            position: f.position,
                            bars: f.bars,
                            lick: f.lick,
                            style: f.style,
                            easy: f.easy,
                            span: f.span ?? false,
                          },
                        });
                      }}
                    >
                      {f.title}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remover ${f.title}`}
                      onClick={() => setFavorites(toggleFavorite(f))}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
