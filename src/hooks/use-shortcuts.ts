import { useEffect, useRef, useSyncExternalStore } from 'react';

export type Shortcut = {
  key: string;
  display: string;
  label: string;
  shift?: boolean;
  run: () => void;
};

type ShortcutHelp = Pick<Shortcut, 'display' | 'label'>;

let active: ShortcutHelp[] = [];
const listeners = new Set<() => void>();

const setActive = (help: ShortcutHelp[]) => {
  active = help;
  listeners.forEach((listener) => listener());
};

export const usePageShortcuts = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => active,
  );

const TYPING =
  'input, textarea, select, [role=listbox], [role=combobox], [role=dialog]';

export function isTyping(event: KeyboardEvent) {
  const target = event.target;
  return target instanceof Element && !!target.closest(TYPING);
}

export function useShortcuts(shortcuts: Shortcut[]) {
  const latest = useRef(shortcuts);
  const help = useRef(
    shortcuts.map(({ display, label }) => ({ display, label })),
  );

  useEffect(() => {
    latest.current = shortcuts;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event)) {
        return;
      }
      const shortcut = latest.current.find(
        (s) =>
          (s.key === 'Space' ? event.code === 'Space' : event.key === s.key) &&
          (s.shift === undefined || s.shift === event.shiftKey),
      );
      if (!shortcut) return;
      event.preventDefault();
      shortcut.run();
    };
    window.addEventListener('keydown', onKey);
    setActive(help.current);
    return () => {
      window.removeEventListener('keydown', onKey);
      setActive([]);
    };
  }, []);
}
