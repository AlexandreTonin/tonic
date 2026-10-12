import { Button } from '@/components/ui/button';
import { useGuitar } from '@/hooks/use-guitar';
import {
  getCustomProgression,
  progressionSubstitutions,
  type Substitution,
} from '@/lib/theory/engine';
import { Play } from 'lucide-react';

const KINDS: Record<Substitution['kind'], { name: string; about: string }> = {
  tritone: {
    name: 'Substituto de trítono',
    about:
      'Dominante a um trítono de distância: mesmo trítono interno, baixo descendo por semitom.',
  },
  relative: {
    name: 'Relativa',
    about: 'Troca pelo acorde relativo, que divide duas notas com o original.',
  },
  borrowed: {
    name: 'Empréstimo modal',
    about: 'O mesmo grau no modo paralelo: muda a cor sem mudar a função.',
  },
  secondary: {
    name: 'Dominante secundário antes',
    about:
      'Prepara o acorde com o seu próprio V7, criando tensão que resolve nele.',
  },
  'two-five': {
    name: 'ii–V antes',
    about: 'Prepara o acorde com o ii–V dele, como no jazz.',
  },
};
const BEATS_PER_CHORD = 2;
const PREVIEW_BPM = 90;

export function Substitutions({
  tokens,
  index,
  mode,
  root,
  tuning,
  onApply,
}: {
  tokens: string[];
  index: number;
  mode: 'major' | 'minor';
  root: string;
  tuning: string;
  onApply: (result: string[]) => void;
}) {
  const guitar = useGuitar();
  const options = progressionSubstitutions(tokens, index, mode).map((o) => ({
    ...o,
    bars: getCustomProgression(o.chords, mode, root, tuning).bars,
  }));
  const current = getCustomProgression([tokens[index]], mode, root).bars[0];

  if (!options.length) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">
        Substituições para {current?.symbol} ({tokens[index]})
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => (
          <li
            key={o.kind}
            className="flex flex-col gap-2 rounded-xl border p-4"
          >
            <span className="font-semibold">{KINDS[o.kind].name}</span>
            <span className="text-lg">
              {o.bars.map((b) => b.symbol).join(' → ')}
              <span className="ml-2 text-sm text-muted-foreground">
                {o.chords.join(' ')}
              </span>
            </span>
            <span className="text-sm text-muted-foreground">
              {KINDS[o.kind].about}
            </span>
            <div className="mt-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={guitar.loading}
                aria-label={`Ouvir ${KINDS[o.kind].name}`}
                onClick={() =>
                  void guitar.sequence(
                    o.bars.flatMap((b, i) =>
                      (b.voicing?.positions ?? []).map((p, k) => ({
                        midi: p.midi,
                        sound: p.midi,
                        start: i * BEATS_PER_CHORD + k * 0.02,
                        duration: BEATS_PER_CHORD,
                      })),
                    ),
                    { bpm: PREVIEW_BPM },
                  )
                }
              >
                <Play data-icon="inline-start" />
                Ouvir
              </Button>
              <Button size="sm" onClick={() => onApply(o.result)}>
                Aplicar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
