import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { MenuButton } from '@/components/ui/menu-button';
import { useTone } from '@/hooks/use-guitar';
import { TONE_LABELS, type ToneId } from '@/lib/tone';
import { Guitar } from 'lucide-react';

export function ToneMenu() {
  const [tone, setTone] = useTone();
  return (
    <DropdownMenu>
      <MenuButton icon={Guitar} label={`Timbre: ${TONE_LABELS[tone]}`}>
        {TONE_LABELS[tone]}
      </MenuButton>
      <DropdownMenuContent align="end" className="w-auto min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Timbre</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={tone}
            onValueChange={(value: ToneId) => setTone(value)}
          >
            {Object.entries(TONE_LABELS).map(([value, label]) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
