import { ExportButtons } from '@/components/fretboard/export-buttons';
import { Fretboard } from '@/components/fretboard/fretboard';
import { TabSvg } from '@/components/fretboard/tab-svg';
import { TabText } from '@/components/fretboard/tab-text';
import { ChoiceTabs } from '@/components/theory/theory-controls';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { MenuButton } from '@/components/ui/menu-button';
import type { useGuitar } from '@/hooks/use-guitar';
import { FRETBOARD_LAYOUT } from '@/lib/fretboard-export';
import { TUNINGS, type LabelMode } from '@/lib/theory/core';
import {
  getFretboard,
  getHorizontalRun,
  RUN_DIRECTIONS,
  type RunDirection,
} from '@/lib/theory/engine';
import { Gauge, Play, Repeat, Square } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

const MIN_FRETS = 22;
const RUN_TEMPOS = [60, 80, 100, 120, 140] as const;
const LEGATO_VELOCITY = 70;
const DIRECTION_NAMES: Record<RunDirection, string> = {
  up: 'Subida',
  down: 'Descida',
  both: 'Ida e volta',
};
const TAB_LEGEND = '/ \\ slide';

export function HorizontalRun({
  scaleId,
  root,
  start,
  direction,
  labelMode,
  tuning,
  guitar,
  active,
  onPlay,
  onChange,
}: {
  scaleId: string;
  root: string;
  start: number;
  direction: RunDirection;
  labelMode: Exclude<LabelMode, 'degrees'>;
  tuning: string;
  guitar: ReturnType<typeof useGuitar>;
  active: boolean;
  onPlay: () => void;
  onChange: (patch: { run?: number; direction?: RunDirection }) => void;
}) {
  const [bpm, setBpm] = useState(80);
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const view = useMemo(() => {
    const run = getHorizontalRun(scaleId, root, start, direction, tuning);
    const frets = Math.max(MIN_FRETS, run.highFret);
    const onRun = new Set(run.notes.map((n) => `${n.string}:${n.fret}`));
    const board = getFretboard({
      item: `scale:${scaleId}`,
      root,
      labelMode,
      tuning,
      frets,
    }).map((p) =>
      onRun.has(`${p.string}:${p.fret}`)
        ? p
        : { ...p, role: 'outside' as const },
    );
    return { run, board, frets };
  }, [scaleId, root, start, direction, labelMode, tuning]);
  const { run, board, frets } = view;

  const isPlaying = active && guitar.sequencing;
  const current = isPlaying && playing !== null ? run.notes[playing] : null;
  const first = run.starts[start - 1];
  const title = `${run.root} ${run.name} na horizontal · a partir de ${first.note} (${first.degree})`;
  const details = `${DIRECTION_NAMES[direction]} · casas ${run.lowFret} a ${run.highFret} · ${bpm} BPM`;

  const play = (options: { bpm?: number; loop?: boolean } = {}) => {
    onPlay();
    void guitar.sequence(
      run.notes.map((n) => ({
        ...n,
        velocity: n.technique ? LEGATO_VELOCITY : undefined,
      })),
      {
        bpm: options.bpm ?? bpm,
        loop: options.loop ?? loop,
        onNote: (_, index) => setPlaying(index ?? null),
      },
    );
  };
  const replay = (options: { bpm?: number; loop?: boolean }) => {
    if (isPlaying) play(options);
  };
  const change = (patch: { run?: number; direction?: RunDirection }) => {
    if (isPlaying) guitar.stop();
    onChange(patch);
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Escala horizontal
        </h2>
        <p className="text-muted-foreground">
          A escala atravessando o braço: três notas numa corda e duas na
          seguinte, com um slide para mudar de região, até voltar à nota de
          partida na última corda.
          {run.notes.some((n) => n.blue) &&
            ' A blue note entra logo depois da nota abaixo dela, na mesma corda.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <ChoiceTabs
          id="run-start"
          label="Começar em"
          options={run.starts.map((_, i) => i + 1)}
          value={start}
          format={(i) => {
            const s = run.starts[i - 1];
            return `${s.degree} · ${s.note}`;
          }}
          onChange={(run) => change({ run })}
        />
        <ChoiceTabs
          id="run-direction"
          label="Direção"
          options={RUN_DIRECTIONS}
          value={direction}
          format={(d) => DIRECTION_NAMES[d]}
          onChange={(direction) => change({ direction })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <span className="text-sm text-muted-foreground">
            Casas {run.lowFret} a {run.highFret} · {TAB_LEGEND}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {isPlaying ? (
              <Button variant="outline" onClick={() => guitar.stop()}>
                <Square data-icon="inline-start" />
                Parar
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={guitar.loading}
                onClick={() => play()}
              >
                <Play data-icon="inline-start" />
                {guitar.loading ? (
                  'Carregando som…'
                ) : (
                  <>
                    Tocar<span className="sr-only"> escala horizontal</span>
                  </>
                )}
              </Button>
            )}
            <DropdownMenu>
              <MenuButton icon={Gauge} label={`Andamento: ${bpm} BPM`}>
                <span className="tabular-nums">{bpm} BPM</span>
              </MenuButton>
              <DropdownMenuContent align="end" className="w-auto min-w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Andamento</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={bpm}
                    onValueChange={(bpm: number) => {
                      setBpm(bpm);
                      replay({ bpm });
                    }}
                  >
                    {RUN_TEMPOS.map((t) => (
                      <DropdownMenuRadioItem key={t} value={t}>
                        {t} BPM
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <MenuButton
                icon={Repeat}
                label={`Repetição: ${loop ? 'em loop' : 'uma vez'}`}
              >
                {loop ? 'Loop' : 'Uma vez'}
              </MenuButton>
              <DropdownMenuContent align="end" className="w-auto min-w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Repetição</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={loop}
                    onCheckedChange={(loop) => {
                      setLoop(loop);
                      if (loop) replay({ loop });
                      else if (isPlaying) guitar.stop();
                    }}
                  >
                    Loop
                  </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ExportButtons
              compact
              target={exportRef}
              layout={FRETBOARD_LAYOUT}
              title={title}
              details={details}
            />
          </div>
        </div>

        <TabText
          lines={run.tab}
          active={
            current && playing !== null
              ? { string: current.string, ...run.cells[playing] }
              : undefined
          }
        />

        <Fretboard
          positions={board}
          frets={frets}
          strings={TUNINGS[tuning].length}
          activeMidi={current?.midi ?? null}
          label={`Braço com ${title}`}
        />

        <div ref={exportRef} className="hidden">
          <div data-export-item data-caption={TAB_LEGEND}>
            <TabSvg lines={run.tab} label={`Tab de ${title}`} />
          </div>
          <div data-export-item data-caption={title}>
            <Fretboard
              positions={board}
              frets={frets}
              strings={TUNINGS[tuning].length}
              label={`Braço com ${title}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
