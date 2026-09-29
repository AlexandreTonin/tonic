import { DOT_STYLE } from '@/components/fretboard/dot-style';
import type { Voicing } from '@/lib/theory/core';

const STRINGS = 6;
const ROWS = 4;
const STRING_GAP = 22;
const FRET_GAP = 28;
const LEFT = 26;
const TOP = 30;
const DOT_R = 10;

const stringX = (string: number) => LEFT + (STRINGS - string) * STRING_GAP;

type ChordDiagramProps = { voicing: Voicing; label: string };

export function ChordDiagram({ voicing, label }: ChordDiagramProps) {
  const { frets, baseFret, barre, positions } = voicing;
  const width = LEFT + (STRINGS - 1) * STRING_GAP + 14;
  const height = TOP + ROWS * FRET_GAP + 6;
  const rowY = (fret: number) => TOP + (fret - baseFret + 0.5) * FRET_GAP;
  const tab = frets.map((f) => f ?? 'x').join(' ');

  return (
    <span className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-48"
        role="img"
        aria-label={`${label}: ${tab}`}
      >
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line
            key={i}
            x1={stringX(STRINGS)}
            x2={stringX(1)}
            y1={TOP + i * FRET_GAP}
            y2={TOP + i * FRET_GAP}
            stroke={
              i === 0 && baseFret === 1
                ? 'var(--foreground)'
                : 'var(--fret-wire)'
            }
            strokeWidth={i === 0 && baseFret === 1 ? 4 : 1.5}
          />
        ))}
        {Array.from({ length: STRINGS }, (_, i) => (
          <line
            key={i}
            x1={stringX(i + 1)}
            x2={stringX(i + 1)}
            y1={TOP}
            y2={TOP + ROWS * FRET_GAP}
            stroke="var(--fret-string)"
            strokeWidth={1.2}
          />
        ))}
        {baseFret > 1 && (
          <text
            x={LEFT - 12}
            y={rowY(baseFret)}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={11}
            fill="var(--muted-foreground)"
          >
            {baseFret}
          </text>
        )}

        {frets.map((f, idx) =>
          f === null ? (
            <text
              key={idx}
              x={stringX(STRINGS - idx)}
              y={TOP - 13}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              ×
            </text>
          ) : null,
        )}

        {barre && (
          <rect
            x={stringX(barre.fromString) - DOT_R}
            y={rowY(barre.fret) - DOT_R}
            width={stringX(barre.toString) - stringX(barre.fromString) + 2 * DOT_R}
            height={2 * DOT_R}
            rx={DOT_R}
            fill="var(--fret-chord-tone)"
          />
        )}

        {positions.map((p) => {
          const style = DOT_STYLE[p.role];
          const cx = stringX(p.string);
          const cy = p.fret === 0 ? TOP - 13 : rowY(p.fret);
          return (
            <g key={p.string}>
              <circle
                cx={cx}
                cy={cy}
                r={p.fret === 0 ? DOT_R - 1 : DOT_R}
                fill={p.fret === 0 ? 'var(--background)' : style.fill}
                stroke={p.fret === 0 ? style.fill : style.stroke}
                strokeWidth={p.fret === 0 ? 1.5 : undefined}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={p.label.length > 2 ? 8 : 10}
                fontWeight={500}
                fill={p.fret === 0 ? 'var(--foreground)' : style.text}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </span>
  );
}
