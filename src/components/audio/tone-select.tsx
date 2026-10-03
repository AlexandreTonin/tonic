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
