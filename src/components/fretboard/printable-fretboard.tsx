import { ExportButtons } from '@/components/fretboard/export-buttons';
import { Fretboard } from '@/components/fretboard/fretboard';
import { type ExportLayout, FRETBOARD_LAYOUT } from '@/lib/fretboard-export';
import { type ComponentProps, type ReactNode, useRef } from 'react';

type PrintableFretboardProps = ComponentProps<typeof Fretboard> & {
  title: string;
  details: string;
  exportContent?: ReactNode;
  exportLayout?: ExportLayout;
  toolbar?: ReactNode;
  actions?: ReactNode;
};

export function PrintableFretboard({
  title,
  details,
  exportContent,
  exportLayout = FRETBOARD_LAYOUT,
  toolbar,
  actions,
  ...fretboard
}: PrintableFretboardProps) {
  const figure = useRef<HTMLElement>(null);
  const exported = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {toolbar}
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {actions}
          <ExportButtons
            target={exportContent ? exported : figure}
            layout={exportContent ? exportLayout : FRETBOARD_LAYOUT}
            title={title}
            details={details}
            compact
          />
        </div>
      </div>
      <figure ref={figure}>
        <Fretboard {...fretboard} />
      </figure>
      {exportContent && (
        <div ref={exported} className="hidden">
          {exportContent}
        </div>
      )}
    </div>
  );
}
