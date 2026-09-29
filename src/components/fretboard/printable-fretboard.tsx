import { ExportButtons } from '@/components/fretboard/export-buttons';
import { Fretboard } from '@/components/fretboard/fretboard';
import { type ExportLayout, FRETBOARD_LAYOUT } from '@/lib/fretboard-export';
import { type ComponentProps, type ReactNode, useRef } from 'react';

type PrintableFretboardProps = ComponentProps<typeof Fretboard> & {
  title: string;
  details: string;
  exportContent?: ReactNode;
  exportLayout?: ExportLayout;
};

export function PrintableFretboard({
  title,
  details,
  exportContent,
  exportLayout = FRETBOARD_LAYOUT,
  ...fretboard
}: PrintableFretboardProps) {
  const figure = useRef<HTMLElement>(null);
  const exported = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <ExportButtons
        target={exportContent ? exported : figure}
        layout={exportContent ? exportLayout : FRETBOARD_LAYOUT}
        title={title}
        details={details}
      />
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
