const FONT_SIZE = 14;
const CHAR_W = 8.4;
const LINE_H = 22;
const PAD = 8;
const MIN_WIDTH = 960;

export function TabSvg({ lines, label }: { lines: string[]; label: string }) {
  const width = Math.max(
    MIN_WIDTH,
    Math.max(...lines.map((l) => l.length)) * CHAR_W + 2 * PAD,
  );
  const height = lines.length * LINE_H + 2 * PAD;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
    >
      {lines.map((line, i) => (
        <text
          key={i}
          x={PAD}
          y={PAD + (i + 0.7) * LINE_H}
          fontFamily="ui-monospace, Menlo, Consolas, monospace"
          fontSize={FONT_SIZE}
          textLength={line.length * CHAR_W}
          lengthAdjust="spacingAndGlyphs"
          fill="var(--foreground)"
        >
          {line}
        </text>
      ))}
    </svg>
  );
}
