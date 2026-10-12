import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ROOTS } from '@/lib/roots';
import { findScales } from '@/lib/theory/engine';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Eraser } from 'lucide-react';
import { useMemo, useState } from 'react';

const route = getRouteApi('/scale-finder');
const SHOWN = 20;

export function ScaleFinderPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const [showAll, setShowAll] = useState(false);

  const notes = useMemo(
    () => (search.notes ? search.notes.split(',') : []),
    [search.notes],
  );
  const setNotes = (next: string[]) =>
    navigate({
      to: '.',
      search: (s) => ({
        ...s,
        notes: next.length
          ? ROOTS.filter((r) => next.includes(r)).join(',')
          : undefined,
      }),
      replace: true,
    });

  const toggle = (note: string) =>
    setNotes(
      notes.includes(note) ? notes.filter((n) => n !== note) : [...notes, note],
    );

  const scales = useMemo(() => findScales(notes, ROOTS), [notes]);
  const shown = showAll ? scales : scales.slice(0, SHOWN);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Identificador de escalas
        </h1>
        <p className="text-muted-foreground">
          Escolha as notas que você tem (de um riff, de uma melodia, de um
          acorde) e veja as escalas que contêm todas elas.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span id="scale-finder-notes" className="text-sm font-medium">
          Notas
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-labelledby="scale-finder-notes"
            className="grid grid-cols-6 gap-1 sm:flex"
          >
            {ROOTS.map((note) => (
              <Toggle
                key={note}
                variant="outline"
                pressed={notes.includes(note)}
                onPressedChange={() => toggle(note)}
                className="min-w-10"
              >
                {note}
              </Toggle>
            ))}
          </div>
          <Button
            variant="ghost"
            disabled={!notes.length}
            onClick={() => setNotes([])}
          >
            <Eraser data-icon="inline-start" />
            Limpar
          </Button>
        </div>
      </div>

      <section className="flex flex-col gap-4" aria-live="polite">
        <h2 className="text-xl font-semibold tracking-tight">
          {notes.length
            ? `${scales.length} ${scales.length === 1 ? 'escala' : 'escalas'}`
            : 'Escalas'}
        </h2>
        {!notes.length ? (
          <p className="text-muted-foreground">Escolha ao menos uma nota.</p>
        ) : !scales.length ? (
          <p className="text-muted-foreground">
            Nenhuma escala da biblioteca contém todas essas notas.
          </p>
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((s) => (
                <li key={`${s.scaleId}:${s.root}`}>
                  <Link
                    to="/scales/$id"
                    params={{ id: s.scaleId }}
                    search={{ root: s.root }}
                    className="flex h-full flex-col gap-1 rounded-xl border p-4 transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
                  >
                    <span className="font-semibold">
                      {s.root} {s.name}
                    </span>
                    <span className="text-sm tabular-nums">
                      {s.notes.join(' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {s.extra === 0
                        ? 'Exatamente essas notas'
                        : `${s.extra} ${s.extra === 1 ? 'nota a mais' : 'notas a mais'}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {scales.length > SHOWN && (
              <Button
                variant="outline"
                className="self-start"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Mostrar menos' : `Mostrar todas (${scales.length})`}
              </Button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
