import { ToneMenu } from '@/components/audio/tone-select';
import { ChordDiagram } from '@/components/chord-diagram/chord-diagram';
import { Fretboard } from '@/components/fretboard/fretboard';
import { TuningMenu } from '@/components/fretboard/tuning-menu';
import { Button } from '@/components/ui/button';
import { useGuitar } from '@/hooks/use-guitar';
import { useTuning } from '@/hooks/use-tuning';
import { ROOTS } from '@/lib/roots';
import {
  findBarre,
  type FretPosition,
  openMidis,
  sameNote,
  TUNINGS,
} from '@/lib/theory/core';
import { findChords } from '@/lib/theory/engine';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Eraser, Play } from 'lucide-react';
import { Chord } from 'tonal';

const route = getRouteApi('/chord-finder');
const FRETS = 15;

const parseFrets = (value: string | undefined, strings: number) => {
  const parsed = (value ?? '')
    .split('-')
    .map((f) => (f === 'x' || f === '' ? null : Number(f)));
  return Array.from({ length: strings }, (_, i) =>
    parsed.length === strings && parsed[i] !== undefined ? parsed[i] : null,
  );
};

export function ChordFinderPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const [tuningId] = useTuning();
  const tuning = TUNINGS[tuningId];
  const opens = openMidis(tuning);
  const guitar = useGuitar();

  const frets = parseFrets(search.frets, tuning.length);
  const setFrets = (next: (number | null)[]) =>
    navigate({
      to: '.',
      search: (s) => ({
        ...s,
        frets: next.some((f) => f !== null)
          ? next.map((f) => f ?? 'x').join('-')
          : undefined,
      }),
      replace: true,
    });

  const select = (string: number, fret: number) => {
    const idx = tuning.length - string;
    setFrets(frets.map((f, i) => (i === idx ? (f === fret ? null : fret) : f)));
  };

  const played = frets.flatMap((fret, idx) =>
    fret === null
      ? []
      : [
          {
            idx,
            fret,
            midi: opens[idx] + fret,
            note: ROOTS[(opens[idx] + fret) % 12],
          },
        ],
  );
  const positions: FretPosition[] = played.map(({ idx, fret, midi, note }) => ({
    string: tuning.length - idx,
    fret,
    note,
    label: note,
    role: 'chord-tone',
    midi,
  }));
  const ordered = [...played].sort((a, b) => a.midi - b.midi);
  const found = findChords(ordered.map((p) => p.note));
  const others = Chord.detect(ordered.map((p) => p.note)).filter((name) => {
    const tonic = Chord.get(name).tonic;
    return !tonic || !found.some((f) => sameNote(f.root, tonic));
  });
  const fretted = played.map((p) => p.fret).filter((f) => f > 0);
  const maxFret = Math.max(0, ...fretted);
  const voicing = {
    frets,
    baseFret: maxFret <= 4 ? 1 : Math.min(...fretted),
    barre: findBarre(frets),
    positions,
  };
  const tab = frets.map((f) => f ?? 'x').join(' ');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Identificador de acordes
        </h1>
        <p className="text-muted-foreground">
          Clique numa casa para marcar a nota da corda; clique de novo para
          abafar a corda.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <span className="text-sm text-muted-foreground tabular-nums">
            {played.length ? tab : 'Nenhuma casa marcada'}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1">
            {guitar.failed && (
              <span role="status" className="text-sm text-muted-foreground">
                Não foi possível carregar o som.
              </span>
            )}
            <Button
              variant="outline"
              disabled={!played.length || guitar.loading}
              onClick={() => guitar.strum(ordered.map((p) => p.midi))}
            >
              <Play data-icon="inline-start" />
              {guitar.loading ? 'Carregando som…' : 'Tocar'}
            </Button>
            <Button
              variant="ghost"
              disabled={!played.length}
              onClick={() => setFrets(frets.map(() => null))}
            >
              <Eraser data-icon="inline-start" />
              Limpar
            </Button>
            <TuningMenu />
            <ToneMenu />
          </div>
        </div>
        <Fretboard
          positions={positions}
          frets={FRETS}
          strings={tuning.length}
          label="Braço para marcar as notas do acorde"
          onSelect={select}
        />
      </div>

      <section className="flex flex-col gap-4" aria-live="polite">
        <h2 className="text-xl font-semibold tracking-tight">Resultado</h2>
        {played.length < 2 ? (
          <p className="text-muted-foreground">Marque ao menos duas notas.</p>
        ) : (
          <div className="flex flex-wrap items-start gap-8">
            {played.length >= 3 && (
              <div className="w-48">
                <ChordDiagram
                  voicing={voicing}
                  label={found[0]?.symbol ?? 'Acorde marcado'}
                />
              </div>
            )}
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground">
                Notas: {ordered.map((p) => p.note).join(' ')}
              </p>
              {found.length ? (
                <ul className="flex flex-col gap-2">
                  {found.map((f) => (
                    <li key={f.symbol} className="flex flex-col">
                      <Link
                        to="/chords/$id"
                        params={{ id: f.chordId }}
                        search={{ root: f.root }}
                        className="text-2xl font-semibold hover:underline"
                      >
                        {f.symbol}
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {f.name}
                        {f.inversion ? `, com ${f.bass} no baixo` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum acorde da biblioteca tem exatamente essas notas.</p>
              )}
              {others.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Outros nomes possíveis: {others.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
