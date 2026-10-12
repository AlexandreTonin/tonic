import { isTyping, usePageShortcuts } from '@/hooks/use-shortcuts';
import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useState } from 'react';

const GLOBAL = [
  { display: 'Ctrl K', label: 'Buscar' },
  { display: '?', label: 'Mostrar os atalhos' },
];

function Rows({ items }: { items: { display: string; label: string }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      {items.map(({ display, label }) => (
        <div key={`${display}-${label}`} className="contents">
          <dt>
            <kbd className="rounded-md border px-1.5 py-0.5 font-sans text-xs">
              {display}
            </kbd>
          </dt>
          <dd className="text-muted-foreground">{label}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const page = usePageShortcuts();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '?' && !isTyping(event)) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-[15vh] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-4 rounded-2xl border bg-background p-6 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold">Atalhos</Dialog.Title>
          {page.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Nesta tela</h3>
              <Rows items={page} />
            </section>
          )}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Em qualquer tela</h3>
            <Rows items={GLOBAL} />
          </section>
          <Dialog.Close className="self-end rounded-xl border px-3 py-1 text-sm hover:bg-muted">
            Fechar
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
