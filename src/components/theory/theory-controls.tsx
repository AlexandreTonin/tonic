import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { MenuButton } from '@/components/ui/menu-button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROOTS, type Root } from '@/lib/roots';
import type { LabelMode } from '@/lib/theory/core';
import { Type } from 'lucide-react';
import type { ReactNode } from 'react';

const LABEL_MODES: Record<Exclude<LabelMode, 'degrees'>, string> = {
  notes: 'Notas',
  intervals: 'Intervalos',
};

type ControlProps<T> = { id: string; value: T; onChange: (value: T) => void };

export function RootTabs({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: Root) => void;
}) {
  return (
    <div className="flex max-w-full flex-wrap items-center gap-2">
      <Label id={`${id}-label`}>Tônica</Label>
      <Tabs
        value={value}
        onValueChange={(v: Root) => onChange(v)}
        className="min-w-0"
      >
        <TabsList
          aria-labelledby={`${id}-label`}
          className="grid h-auto! w-full grid-cols-6 sm:inline-flex sm:h-8! sm:w-fit sm:max-w-full"
        >
          {ROOTS.map((r) => (
            <TabsTrigger key={r} value={r} className="min-w-9 py-1 sm:py-0.5">
              {r}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

type CatalogItem = { id: string; name: string; category: string };

export function CatalogSelect({
  id,
  label,
  items = [],
  value,
  onChange,
}: ControlProps<string> & {
  label: string;
  items?: CatalogItem[];
}) {
  const categories = [...new Set(items.map((i) => i.category))];
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        items={items.map((i) => ({ label: i.name, value: i.id }))}
        onValueChange={(v) => v && onChange(v)}
      >
        <SelectTrigger id={id} className="min-w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectGroup key={c}>
              <SelectLabel>{c}</SelectLabel>
              {items
                .filter((i) => i.category === c)
                .map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function LabelMenu({
  value,
  onChange,
  children,
}: Omit<ControlProps<Exclude<LabelMode, 'degrees'>>, 'id'> & {
  children?: ReactNode;
}) {
  return (
    <DropdownMenu>
      <MenuButton icon={Type} label={`Rótulo: ${LABEL_MODES[value]}`}>
        {LABEL_MODES[value]}
      </MenuButton>
      <DropdownMenuContent align="end" className="w-auto min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Rótulo das notas</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(v: Exclude<LabelMode, 'degrees'>) => onChange(v)}
          >
            {Object.entries(LABEL_MODES).map(([v, label]) => (
              <DropdownMenuRadioItem key={v} value={v}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ChoiceTabs<T extends string | number>({
  id,
  label,
  options,
  value,
  onChange,
  format = String,
}: ControlProps<T> & {
  label: string;
  options: readonly T[];
  format?: (value: T) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label id={`${id}-label`}>{label}</Label>
      <Tabs
        value={String(value)}
        onValueChange={(v: string) => {
          const option = options.find((o) => String(o) === v);
          if (option !== undefined) onChange(option);
        }}
      >
        <TabsList aria-labelledby={`${id}-label`}>
          {options.map((o) => (
            <TabsTrigger key={o} value={String(o)} className="px-3">
              {format(o)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export function PositionTabs({
  id,
  count,
  value,
  onChange,
}: {
  id: string;
  count: number;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label id={`${id}-label`}>Posição</Label>
      <Tabs
        value={value ? String(value) : 'all'}
        onValueChange={(v: string) =>
          onChange(v === 'all' ? undefined : Number(v))
        }
      >
        <TabsList aria-labelledby={`${id}-label`}>
          <TabsTrigger value="all" className="px-3">
            Todas
          </TabsTrigger>
          {Array.from({ length: count }, (_, i) => (
            <TabsTrigger key={i} value={String(i + 1)} className="min-w-9">
              {i + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
