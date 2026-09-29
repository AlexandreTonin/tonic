import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CatalogView = 'explore' | 'gallery';

const VIEWS: Record<CatalogView, string> = {
  explore: 'Explorar',
  gallery: 'Galeria',
};

export function ViewToggle({
  value,
  onChange,
}: {
  value: CatalogView;
  onChange: (value: CatalogView) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v: CatalogView) => onChange(v)}>
      <TabsList aria-label="Modo de visualização">
        {Object.entries(VIEWS).map(([v, label]) => (
          <TabsTrigger key={v} value={v} className="px-3">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
