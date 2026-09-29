import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EXERCISES, SUBDIVISIONS, UNITS } from '@/lib/technique/catalog';
import { getRouteApi, Link } from '@tanstack/react-router';

const route = getRouteApi('/technique');
const ALL = 'all';
const CATEGORIES = [...new Set(EXERCISES.map((e) => e.category))];
const CARD =
  'flex h-full flex-col gap-3 rounded-xl border p-4 transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none';

export function TechniquePage() {
  const { category = ALL } = route.useSearch();
  const navigate = route.useNavigate();
  const shown = EXERCISES.filter(
    (e) => category === ALL || e.category === category,
  );
  const categories = [...new Set(shown.map((e) => e.category))];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Técnica</h1>
        <p className="text-muted-foreground">
          Exercícios com metrônomo. Comece no tempo sugerido e suba aos poucos
          até o alvo, só quando sair limpo.
        </p>
      </div>

      <Tabs
        value={category}
        onValueChange={(value: string) =>
          navigate({
            to: '.',
            search: { category: value === ALL ? undefined : value },
            replace: true,
          })
        }
      >
        <TabsList
          aria-label="Categoria"
          className="max-w-full justify-start overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
        >
          <TabsTrigger value={ALL} className="px-3">
            Todas
          </TabsTrigger>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c} className="px-3">
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-10">
        {categories.map((c) => (
          <section key={c} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">{c}</h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
              {shown
                .filter((e) => e.category === c)
                .map((e) => (
                  <li key={e.id}>
                    <Link
                      to="/technique/$id"
                      params={{ id: e.id }}
                      className={CARD}
                    >
                      <span className="font-medium">{e.name}</span>
                      <span className="whitespace-nowrap tabular-nums">
                        <span className="text-3xl font-semibold">
                          {e.start} → {e.target}
                        </span>{' '}
                        <span className="text-sm text-muted-foreground">
                          {UNITS[e.metric]}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {e.metric === 'bpm'
                          ? SUBDIVISIONS[e.subdivision]
                          : 'uma troca por clique'}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
