import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { MenuButton } from '@/components/ui/menu-button';
import { useTuning } from '@/hooks/use-tuning';
import { TUNING_IDS, TUNING_LABELS, TUNING_SHORT_LABELS } from '@/lib/tuning';
import { SlidersVertical } from 'lucide-react';

export function TuningMenu() {
  const [tuning, setTuning] = useTuning();
  return (
    <DropdownMenu>
      <MenuButton
        icon={SlidersVertical}
        label={`Afinação: ${TUNING_LABELS[tuning]}`}
      >
        {TUNING_SHORT_LABELS[tuning]}
      </MenuButton>
      <DropdownMenuContent align="end" className="w-auto min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Afinação</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={tuning}
            onValueChange={(value: string) => setTuning(value)}
          >
            {TUNING_IDS.map((id) => (
              <DropdownMenuRadioItem key={id} value={id}>
                {TUNING_LABELS[id]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
