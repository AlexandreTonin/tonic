import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  downloadSvgsPng,
  type ExportAppendix,
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
  appendix?: ExportAppendix;
  compact?: boolean;
  printLabel?: string;
  downloadLabel?: string;
};

export function ExportButtons({
  target,
  layout,
  appendix,
  compact = false,
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

  const print = () =>
    target.current &&
    printSvgs(target.current, { title, details }, layout, appendix);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {[
          { label: printLabel, icon: <Printer />, run: print },
          {
            label: downloadLabel,
            icon: <ImageDown />,
            run: () => void download(),
          },
        ].map(({ label, icon, run }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={label}
                  onClick={run}
                />
              }
            >
              {icon}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
        {failed && (
          <span role="status" className="text-sm text-muted-foreground">
            Não foi possível gerar a imagem.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" onClick={print}>
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
