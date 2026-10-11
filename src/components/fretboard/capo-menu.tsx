import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { MenuButton } from '@/components/ui/menu-button';
import { CAPO_FRETS } from '@/router/search';
import { Grip } from 'lucide-react';

const capoLabel = (fret: number) => (fret ? `Capo ${fret}` : 'Sem capo');

export function CapoMenu({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <DropdownMenu>
      <MenuButton icon={Grip} label={`Capotraste: ${capoLabel(value)}`}>
        {capoLabel(value)}
      </MenuButton>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Capotraste</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={String(value)}
            onValueChange={(v: string) => onChange(Number(v))}
          >
            {CAPO_FRETS.map((fret) => (
              <DropdownMenuRadioItem key={fret} value={String(fret)}>
                {fret ? `Casa ${fret}` : 'Sem capo'}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
