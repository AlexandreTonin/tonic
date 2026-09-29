import { Fretboard } from '@/components/fretboard/fretboard';
import { LinkRow, Related } from '@/components/theory/related';
import { RootTabs } from '@/components/theory/theory-controls';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFretboard, getHarmonicField } from '@/lib/theory/engine';
import { cn } from '@/lib/utils';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useMemo } from 'react';

const route = getRouteApi('/harmonic-field');
const FRETS = 22;
const MODES = { major: 'Maior', minor: 'Menor' } as const;
const SIZES = { sevenths: 'Tétrades', triads: 'Tríades' } as const;

export function HarmonicFieldPage() {
  const search = route.useSearch();
  const { root, mode, size, dominant, degree } = search;
  const navigate = route.useNavigate();

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ to: '.', search: { ...search, ...patch }, replace: true });

  const field = useMemo(
    () => getHarmonicField({ root, mode, size, dominant }),
    [root, mode, size, dominant],
  );
  const chord = field.chords[degree - 1];
  const positions = useMemo(
    () =>
      getFretboard({
        item: `chord:${chord.chordId}`,
        root: chord.root,
        labelMode: 'degrees',
        context: field.root,
        frets: FRETS,
      }),
    [chord.chordId, chord.root, field.root],
  );

  const keyRoot = field.root;
  const keyName = `${keyRoot} ${mode === 'major' ? 'maior' : 'menor'}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Campo harmônico
        </h1>
        <p className="text-muted-foreground">
          {`Os acordes de ${keyName}, empilhando terças sobre cada grau da escala.`}
          {mode === 'minor' &&
            (field.dominant
              ? ' O V vem da menor harmônica (sétima maior), criando a dominante.'
              : ' Na menor natural o V é menor: sem sensível.')}
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <RootTabs
          id="field-root"
          value={root}
          onChange={(root) => setSearch({ root })}
        />
        <Tabs
          value={mode}
          onValueChange={(mode: typeof search.mode) => setSearch({ mode })}
        >
          <TabsList aria-label="Modo">
            {Object.entries(MODES).map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="px-3">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs
          value={size}
          onValueChange={(size: typeof search.size) => setSearch({ size })}
        >
          <TabsList aria-label="Acordes">
            {Object.entries(SIZES).map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="px-3">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {mode === 'minor' && (
          <div className="flex items-center gap-2">
            <Switch
              id="field-dominant"
              checked={dominant}
              onCheckedChange={(dominant) => setSearch({ dominant })}
            />
            <Label htmlFor="field-dominant">V7 da menor harmônica</Label>
          </div>
        )}
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {field.chords.map((c, i) => {
          const selected = i + 1 === degree;
          return (
            <li key={c.degree}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setSearch({ degree: i + 1 })}
                className={cn(
                  'flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none',
                  selected && 'border-highlight',
                )}
              >
                <span className="text-lg font-semibold">{c.degree}</span>
                <span>{c.symbol}</span>
                <span className="text-sm text-muted-foreground">
                  {c.notes.join(' ')}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {chord.symbol} em graus de {keyName}
        </h2>
        <Fretboard
          positions={positions}
          frets={FRETS}
          label={`Braço com ${chord.symbol} em graus de ${keyName}`}
        />
      </div>

      <Related title="Relacionado">
        <LinkRow>
          <Link
            to="/chords/$id"
            params={{ id: chord.chordId }}
            search={{ root: chord.root }}
          >
            Acorde {chord.symbol}
          </Link>
          <Link
            to="/arpeggios/$id"
            params={{ id: chord.chordId }}
            search={{ root: chord.root }}
          >
            Arpejo de {chord.symbol}
          </Link>
          <Link
            to="/scales/$id"
            params={{ id: mode === 'major' ? 'ionian' : 'aeolian' }}
            search={{ root: keyRoot }}
          >
            Escala de {keyName}
          </Link>
          {field.dominant && (
            <Link
              to="/scales/$id"
              params={{ id: 'harmonic-minor' }}
              search={{ root: keyRoot }}
            >
              {keyRoot} menor harmônica
            </Link>
          )}
        </LinkRow>
      </Related>
    </div>
  );
}
