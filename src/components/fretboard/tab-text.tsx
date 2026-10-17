import type { TabCell } from '@/lib/theory/lick';

export function TabText({
  lines,
  active,
}: {
  lines: string[];
  active?: TabCell & { string: number };
}) {
  return (
    <pre className="w-fit max-w-full overflow-x-auto rounded-xl border p-4 font-mono text-sm leading-relaxed">
      {lines.map((line, s) => {
        const cell = active?.string === s + 1 ? active : undefined;
        const end = cell ? cell.column + cell.width : 0;
        return (
          <span key={s}>
            {cell ? (
              <>
                {line.slice(0, cell.column)}
                <mark className="rounded-sm bg-highlight text-highlight-foreground">
                  {line.slice(cell.column, end)}
                </mark>
                {line.slice(end)}
              </>
            ) : (
              line
            )}
            {'\n'}
          </span>
        );
      })}
    </pre>
  );
}
