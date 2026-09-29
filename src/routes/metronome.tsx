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
import { Switch } from '@/components/ui/switch';
import { useMetronome } from '@/hooks/use-metronome';
import { CLICK_LABELS, type ClickSound, prepareClick } from '@/lib/clicks';
import {
  barState,
  BEATS,
  defaultAccents,
  deletePreset,
  duration,
  loadLastSettings,
  loadPresets,
  METERS,
  type Meter,
  type MetronomeSettings,
  nextAccent,
  saveLastSettings,
  savePreset,
  tapTempo,
} from '@/lib/metronome';
import { cn } from '@/lib/utils';
import { Minus, Play, Plus, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const SUBDIVISIONS = {
  1: 'Nenhuma',
  2: 'Colcheias',
  3: 'Tercinas',
  4: 'Semicolcheias',
} as const;
const ACCENT_NAMES = { accent: 'acentuado', normal: 'normal', mute: 'mudo' };

const clampBpm = (bpm: number) => Math.min(300, Math.max(20, Math.round(bpm)));

export function MetronomePage() {
  const [settings, setSettings] = useState(loadLastSettings);
  const update = (patch: Partial<MetronomeSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));
  const [seconds, setSeconds] = useState(0);
  const taps = useRef<number[]>([]);

  const metronome = useMetronome({
    bpm: (beat) => barState(settings, beat).bpm,
    beats: BEATS[settings.meter],
    accents: settings.accents,
    subdivision: settings.subdivision,
    sound: settings.sound,
    silent: (beat) => barState(settings, beat).muted,
  });
  const running = metronome.running;
  const state = running ? barState(settings, metronome.beat!) : null;
  const shownBpm =
    state?.bpm ??
    (settings.trainer.enabled ? settings.trainer.from : settings.bpm);

  useEffect(() => {
    saveLastSettings(settings);
  }, [settings]);
  useEffect(() => {
    void prepareClick(settings.sound).catch(() => {});
  }, [settings.sound]);

  const toggle = () => {
    if (running) return metronome.stop();
    setSeconds(0);
    void metronome.start();
  };

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const limit = settings.timerMinutes * 60;
  useEffect(() => {
    if (running && limit && seconds >= limit) metronome.stop();
  });

  const setBpm = (bpm: number) => update({ bpm: clampBpm(bpm) });
  const tap = () => {
    taps.current = [...taps.current, performance.now()].slice(-5);
    const bpm = tapTempo(taps.current);
    if (bpm) setBpm(bpm);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [role=listbox], [role=combobox]',
        )
      )
        return;
      const step = event.shiftKey ? 5 : 1;
      if (event.code === 'Space') {
        event.preventDefault();
        toggle();
      } else if (event.key === 't' || event.key === 'T') tap();
      else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setBpm(settings.bpm + step);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setBpm(settings.bpm - step);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const status = !state
    ? 'Parado'
    : state.countingIn
      ? 'Contando um compasso…'
      : state.muted
        ? `Compasso ${state.bar + 1} · silêncio`
        : `Compasso ${state.bar + 1}`;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">Metrônomo</h1>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="flex flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Diminuir 1 BPM"
              disabled={settings.trainer.enabled}
              onClick={() => setBpm(settings.bpm - 1)}
            >
              <Minus />
            </Button>
            <div className="flex flex-col items-center">
              <span
                className="text-8xl font-semibold tracking-tight tabular-nums"
                aria-live="polite"
              >
                {shownBpm}
              </span>
              <span className="text-muted-foreground">BPM</span>
            </div>
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Aumentar 1 BPM"
              disabled={settings.trainer.enabled}
              onClick={() => setBpm(settings.bpm + 1)}
            >
              <Plus />
            </Button>
          </div>

          <div
            className="flex flex-wrap justify-center gap-3"
            role="group"
            aria-label="Acentos por tempo"
          >
            {settings.accents.map((accent, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Tempo ${i + 1}: ${ACCENT_NAMES[accent]}. Clique para mudar.`}
                onClick={() =>
                  update({
                    accents: settings.accents.map((a, j) =>
                      j === i ? nextAccent(a) : a,
                    ),
                  })
                }
                className={cn(
                  'flex size-11 items-center justify-center rounded-full border-2 border-transparent focus-visible:border-ring focus-visible:outline-none',
                  state?.beatInBar === i && !state.muted && 'border-highlight',
                )}
              >
                <span
                  className={cn(
                    'rounded-full',
                    accent === 'accent' && 'size-7 bg-foreground',
                    accent === 'normal' && 'size-5 bg-muted-foreground/60',
                    accent === 'mute' &&
                      'size-5 border-2 border-muted-foreground/40',
                  )}
                />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="h-14 min-w-44 text-lg"
              disabled={metronome.loading}
              onClick={toggle}
            >
              {running ? (
                <Square data-icon="inline-start" />
              ) : (
                <Play data-icon="inline-start" />
              )}
              {metronome.loading ? 'Carregando…' : running ? 'Parar' : 'Tocar'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 min-w-32 text-lg"
              onClick={tap}
            >
              Tap
            </Button>
          </div>

          <p className="text-muted-foreground tabular-nums" aria-live="polite">
            {status}
            {running &&
              (limit
                ? ` · restam ${duration(Math.max(0, limit - seconds))}`
                : ` · ${duration(seconds)}`)}
            {settings.trainer.enabled &&
              ` · speed trainer até ${settings.trainer.to} BPM`}
          </p>
          {metronome.failed && (
            <p className="text-sm text-muted-foreground">
              Não foi possível iniciar o áudio.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Atalhos: espaço toca e para, T marca o tap, setas mudam 1 BPM (com
            Shift, 5). Clique num tempo para trocar entre acentuado, normal e
            mudo.
          </p>
        </section>

        <aside className="flex flex-col gap-6 lg:border-l lg:pl-8">
          <Field label="Compasso" htmlFor="meter">
            <Select
              value={settings.meter}
              items={Object.fromEntries(METERS.map((m) => [m, m]))}
              onValueChange={(value) =>
                value &&
                update({
                  meter: value as Meter,
                  accents: defaultAccents(value as Meter),
                })
              }
            >
              <SelectTrigger id="meter" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METERS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Subdivisão" htmlFor="subdivision">
            <Select
              value={String(settings.subdivision)}
              items={SUBDIVISIONS}
              onValueChange={(value) =>
                value &&
                update({
                  subdivision: Number(
                    value,
                  ) as MetronomeSettings['subdivision'],
                })
              }
            >
              <SelectTrigger id="subdivision" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUBDIVISIONS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Som" htmlFor="click-sound">
            <Select
              value={settings.sound}
              items={CLICK_LABELS}
              onValueChange={(value) =>
                value && update({ sound: value as ClickSound })
              }
            >
              <SelectTrigger id="click-sound" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLICK_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Toggle
            id="count-in"
            label="Contagem de um compasso"
            checked={settings.countIn}
            onChange={(countIn) => update({ countIn })}
          />

          <div className="flex flex-col gap-3 border-t pt-6">
            <Toggle
              id="gap"
              label="Gap click"
              checked={settings.gap.enabled}
              onChange={(enabled) =>
                update({ gap: { ...settings.gap, enabled } })
              }
            />
            {settings.gap.enabled && (
              <p className="flex flex-wrap items-center gap-2 text-sm">
                Toca
                <NumberField
                  label="Compassos tocando"
                  value={settings.gap.play}
                  min={1}
                  max={16}
                  onChange={(play) =>
                    update({ gap: { ...settings.gap, play } })
                  }
                />
                compassos, silencia
                <NumberField
                  label="Compassos em silêncio"
                  value={settings.gap.mute}
                  min={1}
                  max={16}
                  onChange={(mute) =>
                    update({ gap: { ...settings.gap, mute } })
                  }
                />
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t pt-6">
            <Toggle
              id="trainer"
              label="Speed trainer"
              checked={settings.trainer.enabled}
              onChange={(enabled) =>
                update({ trainer: { ...settings.trainer, enabled } })
              }
            />
            {settings.trainer.enabled && (
              <p className="flex flex-wrap items-center gap-2 text-sm">
                De
                <NumberField
                  label="BPM inicial"
                  value={settings.trainer.from}
                  min={20}
                  max={300}
                  onChange={(from) =>
                    update({ trainer: { ...settings.trainer, from } })
                  }
                />
                sobe
                <NumberField
                  label="Quanto subir"
                  value={settings.trainer.step}
                  min={1}
                  max={40}
                  onChange={(step) =>
                    update({ trainer: { ...settings.trainer, step } })
                  }
                />
                a cada
                <NumberField
                  label="Compassos por degrau"
                  value={settings.trainer.every}
                  min={1}
                  max={64}
                  onChange={(every) =>
                    update({ trainer: { ...settings.trainer, every } })
                  }
                />
                compassos até
                <NumberField
                  label="BPM final"
                  value={settings.trainer.to}
                  min={20}
                  max={300}
                  onChange={(to) =>
                    update({ trainer: { ...settings.trainer, to } })
                  }
                />
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-6 text-sm">
            <Label htmlFor="timer">Timer</Label>
            <NumberField
              id="timer"
              label="Minutos do timer, 0 sem timer"
              value={settings.timerMinutes}
              min={0}
              max={180}
              onChange={(timerMinutes) => update({ timerMinutes })}
            />
            minutos (0 = sem timer)
          </div>

          <Presets settings={settings} onApply={setSettings} />
        </aside>
      </div>
    </div>
  );
}

function Presets({
  settings,
  onApply,
}: {
  settings: MetronomeSettings;
  onApply: (settings: MetronomeSettings) => void;
}) {
  const [presets, setPresets] = useState(loadPresets);
  const [selected, setSelected] = useState<string>('');
  const [name, setName] = useState('');
  const [failed, setFailed] = useState(false);
  const current = presets.find((p) => p.id === selected);

  return (
    <div className="flex flex-col gap-3 border-t pt-6">
      <Label htmlFor="preset">Predefinições</Label>
      {presets.length ? (
        <div className="flex gap-2">
          <Select
            value={selected}
            items={Object.fromEntries(presets.map((p) => [p.id, p.name]))}
            onValueChange={(id) => {
              const preset = presets.find((p) => p.id === id);
              if (!preset) return;
              setSelected(preset.id);
              setName(preset.name);
              onApply(preset.settings);
            }}
          >
            <SelectTrigger id="preset" className="min-w-0 flex-1">
              <SelectValue placeholder="Escolher…" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            disabled={!current}
            onClick={() => {
              if (!current) return;
              const next = deletePreset(current.id);
              setFailed(!next);
              if (!next) return;
              setPresets(next);
              setSelected('');
            }}
          >
            Excluir
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhuma ainda. Salve a configuração atual com um nome.
        </p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          const saved = savePreset(name.trim(), settings);
          setFailed(!saved);
          if (!saved) return;
          setPresets(saved.presets);
          setSelected(saved.preset.id);
        }}
      >
        <Input
          aria-label="Nome da predefinição"
          placeholder="Nome"
          value={name}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" variant="outline" disabled={!name.trim()}>
          Salvar
        </Button>
      </form>
      {failed && (
        <p className="text-sm text-muted-foreground">
          Não foi possível salvar neste navegador.
        </p>
      )}
      {current?.name === name.trim() && (
        <p className="text-sm text-muted-foreground">
          Salvar com o mesmo nome atualiza esta predefinição.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Guardadas só neste navegador.
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const commit = (raw: string) => {
    const n = Math.round(Number(raw));
    onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : value);
  };
  return (
    <Input
      key={value}
      id={id}
      type="number"
      min={min}
      max={max}
      defaultValue={value}
      aria-label={label}
      className="inline-flex w-16 tabular-nums"
      onBlur={(event) => commit(event.currentTarget.value)}
      onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
    />
  );
}
