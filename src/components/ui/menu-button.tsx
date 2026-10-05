import { Button } from '@/components/ui/button';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function MenuButton({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label?: string;
  children: ReactNode;
}) {
  return (
    <DropdownMenuTrigger render={<Button variant="ghost" aria-label={label} />}>
      <Icon data-icon="inline-start" />
      {children}
      <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
    </DropdownMenuTrigger>
  );
}
