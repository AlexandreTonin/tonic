import { searchCommands, type CommandItem } from '@/lib/command-search';
import { cn } from '@/lib/utils';
import { Dialog } from '@base-ui/react/dialog';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const { root, items } = searchCommands(query);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const go = (item: CommandItem) => {
    onOpenChange(false);
    setQuery('');
    setActive(0);
    const path = item.id
      ? item.to.replace('$id', encodeURIComponent(item.id))
      : item.to;
    const query =
      item.rooted && root ? `?root=${encodeURIComponent(root)}` : '';
    navigate({ href: path + query });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && items[active]) {
      e.preventDefault();
      go(items[active]);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-[12vh] left-1/2 z-50 flex max-h-[70vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 flex-col overflow-hidden rounded-2xl border bg-background shadow-lg outline-none">
          <Dialog.Title className="sr-only">Buscar</Dialog.Title>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Escala, acorde, progressão… (ex.: A dórico)"
              aria-label="Buscar"
              aria-controls="command-results"
              aria-activedescendant={
                items[active] ? `command-${active}` : undefined
              }
              role="combobox"
              aria-expanded
              className="h-12 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <ul
            id="command-results"
            role="listbox"
            aria-label="Resultados"
            className="overflow-y-auto p-2"
          >
            {items.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nada encontrado.
              </li>
            )}
            {items.map((item, i) => (
              <li
                key={`${item.group}-${item.to}-${item.id ?? ''}`}
                id={`command-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm',
                  i === active && 'bg-muted',
                )}
              >
                <span>
                  {item.rooted && root ? `${root} ` : ''}
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.group}
                </span>
              </li>
            ))}
          </ul>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
