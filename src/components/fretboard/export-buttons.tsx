import { Button } from '@/components/ui/button';
import {
  downloadSvgsPng,
  type ExportCaption,
  type ExportLayout,
  fileSlug,
  printSvgs,
} from '@/lib/fretboard-export';
import { ImageDown, Printer } from 'lucide-react';
import { type RefObject, useState } from 'react';

type ExportButtonsProps = ExportCaption & {
  target: RefObject<HTMLElement | null>;
  layout: ExportLayout;
  printLabel?: string;
  downloadLabel?: string;
};

export function ExportButtons({
  target,
  layout,
  title,
  details,
  printLabel = 'Imprimir',
  downloadLabel = 'Baixar imagem',
}: ExportButtonsProps) {
  const [failed, setFailed] = useState(false);

  const download = async () => {
    if (!target.current) return;
    try {
      await downloadSvgsPng(
        target.current,
        { title, details, filename: fileSlug(title) },
        layout,
      );
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          target.current &&
          printSvgs(target.current, { title, details }, layout)
        }
      >
        <Printer data-icon="inline-start" />
        {printLabel}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => void download()}>
        <ImageDown data-icon="inline-start" />
        {downloadLabel}
      </Button>
      {failed && (
        <span className="text-sm text-muted-foreground">
          Não foi possível gerar a imagem.
        </span>
      )}
    </div>
  );
}
