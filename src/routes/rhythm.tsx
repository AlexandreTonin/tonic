import { RhythmGrid } from '@/components/rhythm/rhythm-grid';
import { CatalogSelect } from '@/components/theory/theory-controls';
import { ViewToggle } from '@/components/theory/view-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMetronome } from '@/hooks/use-metronome';
import {
  loadVoice,
  SOUND_LABELS,
  type SoundId,
  type Voice,
} from '@/lib/rhythm-sounds';
import { getRhythm, listRhythms, scoreRhythmTest } from '@/lib/theory/engine';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Play, Square, Timer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const route = getRouteApi('/rhythm/$id');
const TEST_BARS = 4;
const RHYTHMS = listRhythms();

type Mode = 'idle' | 'play' | 'test';
type Rhythm = ReturnType<typeof getRhythm>;
type TestResult = ReturnType<typeof scoreRhythmTest>;

export function RhythmPage() {
  const { id } = route.useParams();
  const search = route.useSearch();
  const { bpm, sound } = search;
  const navigate = route.useNavigate();
  const data = useMemo(
    () => (RHYTHMS.some((r) => r.id === id) ? getRhythm(id) : undefined),
    [id],
  );

  const [mode, setMode] = useState<Mode>('idle');
  const [step, setStep] = useState<number | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const taps = useRef<number[]>([]);
  const testStart = useRef<number | null>(null);
  const clock = useRef<AudioContext | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const voice = useRef<Voice | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceFailed, setVoiceFailed] = useState(false);

  const beats = data?.beats ?? 4;
  const stepsPerBeat = data?.stepsPerBeat ?? 1;

  const metronome = useMetronome({
    bpm,
    beats,
    onBeat: (beat, time, context) => {
      clock.current = context;
      if (!data) return;
      const stepSec = 60 / bpm / stepsPerBeat;
      const cue = (at: number, fn: () => void) =>
        timers.current.push(
          setTimeout(fn, Math.max(0, (at - context.currentTime) * 1000)),
        );
      for (let sub = 0; sub < stepsPerBeat; sub++) {
        const index = (beat % beats) * stepsPerBeat + sub;
        const at = time + sub * stepSec;
        cue(at, () => setStep(index));
        if (mode === 'play' && voice.current) {
          voice.current.step(at);
          if (data.grid[index].state === 'hit') {
            voice.current.hit(
              at,
              ringingSteps(data, index) * stepSec * 0.95,
              data.grid[index].accent,
            );
          }
        }
      }
      if (mode !== 'test') return;
      if (beat === beats) testStart.current = time;
      if (beat === beats * (1 + TEST_BARS)) cue(time, finishTest);
    },
  });

  const stop = () => {
    metronome.stop();
    voice.current?.stop();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStep(null);
    setMode('idle');
  };

  const play = async () => {
    stop();
    setVoiceLoading(true);
    try {
      voice.current = await loadVoice(sound);
      setVoiceFailed(false);
    } catch {
      setVoiceFailed(true);
      return;
    } finally {
      setVoiceLoading(false);
    }
    setMode('play');
    void metronome.start();
  };

  const startTest = () => {
    stop();
    taps.current = [];
    testStart.current = null;
    setTapCount(0);
    setResult(null);
    setMode('test');
    void metronome.start();
  };

  function finishTest() {
    stop();
    setResult(
      scoreRhythmTest(id, { bpm, bars: TEST_BARS, taps: taps.current }),
    );
  }

  const tap = () => {
    const context = clock.current;
    if (mode !== 'test' || testStart.current === null || !context) return;
    const latency = context.outputLatency || context.baseLatency || 0;
    taps.current.push(
      Math.round((context.currentTime - latency - testStart.current) * 1000),
    );
    setTapCount((n) => n + 1);
  };

  useEffect(() => {
    if (mode !== 'test') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;
      event.preventDefault();
      tap();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Padrão não encontrado
        </h1>
        <Link
          to="/rhythm"
          search={{ view: 'gallery' }}
          className="hover:underline"
        >
          Ver todos os padrões
        </Link>
      </div>
    );
  }

  const recording =
    mode === 'test' && metronome.beat !== null && metronome.beat >= beats;
  const bar = metronome.beat === null ? 0 : Math.floor(metronome.beat / beats);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Ritmo</h1>
          <ViewToggle
            value="explore"
            onChange={() =>
              navigate({ to: '/rhythm', search: { view: 'gallery' } })
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-1 text-muted-foreground">
          <div className="flex flex-col">
            <span>Padrão: {data.name}</span>
            <span>Compasso: {data.meter}</span>
          </div>
          <div className="flex flex-col">
            <span>{data.category}</span>
            <span>
              {stepsPerBeat === 1
                ? 'Um ataque por tempo'
                : `${stepsPerBeat} divisões por tempo`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <CatalogSelect
          id="rhythm-id"
          label="Padrão"
          items={RHYTHMS}
          value={id}
          onChange={(id) => {
            stop();
            setResult(null);
            navigate({ to: '/rhythm/$id', params: { id }, search });
          }}
        />
        <div className="flex items-center gap-2">
          <Label htmlFor="rhythm-bpm">BPM</Label>
          <Input
            key={bpm}
            id="rhythm-bpm"
            type="number"
            min={40}
            max={240}
            defaultValue={bpm}
            className="w-20 tabular-nums"
            onBlur={(e) =>
              navigate({
                to: '.',
                search: { ...search, bpm: Number(e.currentTarget.value) },
                replace: true,
              })
            }
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="rhythm-sound">Som</Label>
          <Select
            value={sound}
            items={SOUND_LABELS}
            onValueChange={(value) => {
              if (!value) return;
              stop();
              navigate({
                to: '.',
                search: { ...search, sound: value as SoundId },
                replace: true,
              });
            }}
          >
            <SelectTrigger id="rhythm-sound" className="min-w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SOUND_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <RhythmGrid
        grid={data.grid}
        figures={data.figures}
        meter={data.meter}
        stepsPerBeat={data.stepsPerBeat}
        current={step}
        offsets={result ? offsetsByStep(data, result) : undefined}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={metronome.loading || voiceLoading}
          onClick={() => (mode === 'play' ? stop() : void play())}
        >
          {mode === 'play' ? (
            <Square data-icon="inline-start" />
          ) : (
            <Play data-icon="inline-start" />
          )}
          {mode === 'play' ? 'Parar' : 'Tocar em loop'}
        </Button>
        <Button
          variant="outline"
          disabled={metronome.loading}
          onClick={() => (mode === 'test' ? stop() : startTest())}
        >
          <Timer data-icon="inline-start" />
          {mode === 'test' ? 'Cancelar teste' : 'Testar precisão'}
        </Button>
        {(metronome.loading || voiceLoading) && (
          <span className="text-sm text-muted-foreground">Carregando som…</span>
        )}
        {voiceFailed && (
          <span className="text-sm text-muted-foreground">
            Não foi possível carregar o som escolhido.
          </span>
        )}
        {metronome.failed && (
          <span className="text-sm text-muted-foreground">
            Não foi possível iniciar o áudio.
          </span>
        )}
      </div>

      {mode === 'test' && (
        <section className="flex flex-col items-start gap-4 rounded-xl border p-6">
          <p aria-live="polite">
            {recording
              ? `Compasso ${bar} de ${TEST_BARS}: toque junto com cada ataque.`
              : 'Contando um compasso… o teste começa no próximo 1.'}
          </p>
          <Button
            size="lg"
            className="h-20 w-full max-w-sm text-lg"
            onPointerDown={tap}
          >
            Toque (ou barra de espaço)
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {tapCount} toques
          </span>
        </section>
      )}

      {result ? (
        <TestSummary result={result} />
      ) : (
        mode !== 'test' && (
          <p className="text-muted-foreground">
            Teste de precisão: toque junto com o clique por {TEST_BARS}{' '}
            compassos e veja quantos ataques caem dentro de ±30 ms.
          </p>
        )
      )}
    </div>
  );
}

function TestSummary({ result }: { result: TestResult }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">Resultado</h2>
      <dl className="grid max-w-2xl grid-cols-2 gap-6 tabular-nums sm:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">No tempo (±30 ms)</dt>
          <dd className="text-2xl font-semibold">{result.onTimePct}%</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Tendência</dt>
          <dd className="text-2xl font-semibold">
            {tendency(result.meanOffsetMs)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Desvio absoluto</dt>
          <dd className="text-2xl font-semibold">
            {result.meanAbsOffsetMs} ms
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Perdidos / extras</dt>
          <dd className="text-2xl font-semibold">
            {result.missed} / {result.extra}
          </dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">
        Na grade, o número sob cada ataque é o desvio médio nos {result.bars}{' '}
        compassos: negativo adiantado, positivo atrasado, — sem toque.
      </p>
    </section>
  );
}

function tendency(ms: number) {
  if (Math.abs(ms) <= 5) return 'no tempo';
  return `${Math.abs(ms)} ms ${ms < 0 ? 'adiantado' : 'atrasado'}`;
}

function ringingSteps(rhythm: Rhythm, index: number) {
  let steps = 1;
  while (rhythm.grid[index + steps]?.state === 'sustain') steps++;
  return steps;
}

function offsetsByStep(rhythm: Rhythm, result: TestResult) {
  const hitSteps = rhythm.grid.flatMap((s, i) =>
    s.state === 'hit' ? [i] : [],
  );
  const byStep: (number | null)[] = rhythm.grid.map(() => null);
  hitSteps.forEach((stepIndex, k) => {
    const values = Array.from(
      { length: result.bars },
      (_, bar) => result.offsets[bar * hitSteps.length + k],
    ).filter((o): o is number => o !== null && o !== undefined);
    byStep[stepIndex] = values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : null;
  });
  return byStep;
}
