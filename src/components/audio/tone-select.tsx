import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTone } from '@/hooks/use-guitar';
import { TONE_LABELS, type ToneId } from '@/lib/tone';
import { ChevronDown, Guitar } from 'lucide-react';

export function ToneSelect({ id }: { id: string }) {
  const [tone, setTone] = useTone();
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id}>Timbre</Label>
      <Select
        value={tone}
        items={TONE_LABELS}
        onValueChange={(value) => value && setTone(value as ToneId)}
      >
        <SelectTrigger id={id} className="min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TONE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ToneMenu() {
  const [tone, setTone] = useTone();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" aria-label={`Timbre: ${TONE_LABELS[tone]}`} />
        }
      >
        <Guitar data-icon="inline-start" />
        {TONE_LABELS[tone]}
        <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
      </DropdownMenuTrigger>
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
