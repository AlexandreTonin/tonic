import { ViewToggle } from '@/components/theory/view-toggle';
import { listChords, listIntervals, listScales } from '@/lib/theory/engine';
import { getRouteApi, Link } from '@tanstack/react-router';

type GalleryItem = {
  id: string;
  name: string;
  category: string;
  detail: string;
};

type GalleryProps = {
  title: string;
  items: GalleryItem[];
  to: '/scales/$id' | '/chords/$id' | '/arpeggios/$id' | '/intervals/$id';
  root: string;
  onExplore: () => void;
};

const CARD =
  'flex w-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none';

function CatalogGallery({ title, items, to, root, onExplore }: GalleryProps) {
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <ViewToggle value="gallery" onChange={onExplore} />
      </div>
      {categories.map((category) => (
        <section key={category} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{category}</h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
            {items
              .filter((i) => i.category === category)
              .map((i) => (
                <li key={i.id}>
                  <Link
                    to={to}
                    params={{ id: i.id }}
                    search={{ root }}
                    className={CARD}
                  >
                    <span className="font-medium">{i.name}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {i.detail}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const withFormula = <T extends { formula: string[] }>(items: T[]) =>
  items.map((i) => ({ ...i, detail: i.formula.join(' ') }));

const scalesApi = getRouteApi('/scales');
const SCALE_ITEMS = withFormula(listScales());

export function ScalesGallery() {
  const { root } = scalesApi.useSearch();
  const navigate = scalesApi.useNavigate();
  return (
    <CatalogGallery
      title="Escalas"
      items={SCALE_ITEMS}
      to="/scales/$id"
      root={root}
      onExplore={() => navigate({ to: '/scales', search: { root } })}
    />
  );
}

const chordsApi = getRouteApi('/chords');
const CHORD_ITEMS = withFormula(listChords());

export function ChordsGallery() {
  const { root } = chordsApi.useSearch();
  const navigate = chordsApi.useNavigate();
  return (
    <CatalogGallery
      title="Acordes"
      items={CHORD_ITEMS}
      to="/chords/$id"
      root={root}
      onExplore={() => navigate({ to: '/chords', search: { root } })}
    />
  );
}

const arpeggiosApi = getRouteApi('/arpeggios');

export function ArpeggiosGallery() {
  const { root } = arpeggiosApi.useSearch();
  const navigate = arpeggiosApi.useNavigate();
  return (
    <CatalogGallery
      title="Arpejos"
      items={CHORD_ITEMS}
      to="/arpeggios/$id"
      root={root}
      onExplore={() => navigate({ to: '/arpeggios', search: { root } })}
    />
  );
}

const intervalsApi = getRouteApi('/intervals');
const INTERVAL_ITEMS = listIntervals().map((i) => ({
  ...i,
  detail: `${i.label} · ${i.semitones} ${i.semitones === 1 ? 'semitom' : 'semitons'}`,
}));

export function IntervalsGallery() {
  const { root } = intervalsApi.useSearch();
  const navigate = intervalsApi.useNavigate();
  return (
    <CatalogGallery
      title="Intervalos"
      items={INTERVAL_ITEMS}
      to="/intervals/$id"
      root={root}
      onExplore={() => navigate({ to: '/intervals', search: { root } })}
    />
  );
}
