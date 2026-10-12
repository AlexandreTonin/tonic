import { ChoiceTabs } from '@/components/theory/theory-controls';
import { Button } from '@/components/ui/button';
import {
  loadProgressionFavorites,
  progressionFavoriteId,
  toggleProgressionFavorite,
} from '@/lib/progression-favorites';
import { customProgressionPalette } from '@/lib/theory/engine';
import { Link } from '@tanstack/react-router';
import { Copy, Star, X } from 'lucide-react';
import { useState } from 'react';

const MODES = { major: 'Maior', minor: 'Menor' } as const;
const MODE_IDS = Object.keys(MODES) as (keyof typeof MODES)[];
const GROUPS = {
  diatonic: 'Do campo harmônico',
  borrowed: 'Empréstimos modais',
  dominants: 'Dominantes secundários',
} as const;
const MAX_BARS = 32;

type Mode = keyof typeof MODES;

export function ProgressionBuilder({
  mode,
  chords,
  symbols,
  onChange,
}: {
  mode: Mode;
  chords: string[];
  symbols: string[];
  onChange: (patch: { mode?: Mode; chords?: string[] }) => void;
}) {
  const [favorites, setFavorites] = useState(loadProgressionFavorites);
  const palette = customProgressionPalette(mode);
  const current = { mode, chords: chords.join(',') };
  const saved = favorites.some(
    (f) => progressionFavoriteId(f) === progressionFavoriteId(current),
  );

  const edit = (change: (list: string[]) => void) => {
    const next = [...chords];
    change(next);
    if (next.length) onChange({ chords: next });
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Monte a progressão
        </h2>
        <ChoiceTabs
          id="custom-mode"
          label="Tom"
          options={MODE_IDS}
          value={mode}
          onChange={(mode) => onChange({ mode })}
          format={(m) => MODES[m]}
        />
      </div>

      <ol className="flex flex-wrap gap-2" aria-label="Compassos">
        {chords.map((token, i) => (
          <li
            key={i}
            className="flex items-center gap-1 rounded-xl border py-1 pr-1 pl-3"
          >
            <span className="font-medium">{token}</span>
            <span className="text-sm text-muted-foreground">{symbols[i]}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Repetir ${token} no compasso seguinte`}
              disabled={chords.length >= MAX_BARS}
              onClick={() => edit((list) => list.splice(i + 1, 0, token))}
            >
              <Copy />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remover o compasso ${i + 1} (${token})`}
              disabled={chords.length === 1}
              onClick={() => edit((list) => list.splice(i, 1))}
            >
              <X />
            </Button>
          </li>
        ))}
      </ol>

      {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((group) => (
        <div key={group} className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">{GROUPS[group]}</span>
          <div className="flex flex-wrap gap-1">
            {palette[group].map((token) => (
              <Button
                key={token}
                variant="outline"
                size="sm"
                disabled={chords.length >= MAX_BARS}
                onClick={() => onChange({ chords: [...chords, token] })}
              >
                {token}
              </Button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="self-start"
          aria-pressed={saved}
          onClick={() =>
            setFavorites(
              toggleProgressionFavorite({
                ...current,
                title: chords.join(' – '),
              }),
            )
          }
        >
          <Star
            data-icon="inline-start"
            className={saved ? 'fill-current' : undefined}
          />
          {saved ? 'Salva' : 'Salvar progressão'}
        </Button>
        {favorites.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Progressões salvas">
            {favorites.map((f) => (
              <li key={progressionFavoriteId(f)}>
                <Link
                  to="/progressions/$id"
                  params={{ id: 'custom' }}
                  search={(s) => ({ ...s, mode: f.mode, chords: f.chords })}
                  className="block rounded-xl border px-3 py-1 text-sm hover:bg-muted"
                >
                  {f.title} ({MODES[f.mode].toLowerCase()})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
