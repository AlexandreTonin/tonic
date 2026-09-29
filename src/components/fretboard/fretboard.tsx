import { DOT_STYLE } from '@/components/fretboard/dot-style';
import type { Barre, FretPosition } from '@/lib/theory/core';
import { cn } from '@/lib/utils';

const STRINGS = 6;
const OPEN_W = 40;
const FRET_W = 56;
const STRING_GAP = 30;
const TOP = 18;
const BOTTOM = 30;
const DOT_R = 12;
const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];

const stringY = (s: number) => TOP + (s - 1) * STRING_GAP;
const fretX = (f: number) =>
  f === 0 ? OPEN_W / 2 : OPEN_W + (f - 0.5) * FRET_W;

type FretboardProps = {
  positions: FretPosition[];
  frets: number;
  label: string;
  barre?: Barre | null;
  activeMidi?: number | null;
  className?: string;
};

export function Fretboard({
  positions,
  frets,
  label,
  barre,
  activeMidi,
  className,
}: FretboardProps) {
  const width = OPEN_W + frets * FRET_W + 8;
  const boardBottom = stringY(STRINGS);
  const height = boardBottom + BOTTOM;
  const midY = (stringY(3) + stringY(4)) / 2;
  const inlays = Array.from({ length: frets }, (_, i) => i + 1);

  return (
    <div className={cn('overflow-x-auto', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[640px] tabular-nums"
        style={{ maxWidth: width }}
        role="img"
        aria-label={label}
      >
        {inlays.map((f) =>
          SINGLE_INLAYS.includes(f) ? (
            <circle
              key={f}
              cx={fretX(f)}
              cy={midY}
              r={4}
              fill="var(--fret-wire)"
            />
          ) : DOUBLE_INLAYS.includes(f) ? (
            <g key={f} fill="var(--fret-wire)">
              <circle cx={fretX(f)} cy={(stringY(2) + stringY(3)) / 2} r={4} />
              <circle cx={fretX(f)} cy={(stringY(4) + stringY(5)) / 2} r={4} />
            </g>
          ) : null,
        )}

        {inlays.map((f) => (
          <line
            key={f}
            x1={OPEN_W + f * FRET_W}
            x2={OPEN_W + f * FRET_W}
            y1={stringY(1)}
            y2={boardBottom}
            stroke="var(--fret-wire)"
            strokeWidth={1.5}
          />
        ))}
        <line
          x1={OPEN_W}
          x2={OPEN_W}
          y1={stringY(1)}
          y2={boardBottom}
          stroke="var(--foreground)"
          strokeWidth={3}
        />

        {Array.from({ length: STRINGS }, (_, i) => i + 1).map((s) => (
          <line
            key={s}
            x1={OPEN_W}
            x2={width - 8}
            y1={stringY(s)}
            y2={stringY(s)}
            stroke="var(--fret-string)"
            strokeWidth={0.8 + s * 0.25}
          />
        ))}

        {[...SINGLE_INLAYS, ...DOUBLE_INLAYS]
          .filter((f) => f <= frets)
          .map((f) => (
            <text
              key={f}
              x={fretX(f)}
              y={height - 8}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted-foreground)"
            >
              {f}
            </text>
          ))}

        {barre && (
          <rect
            x={fretX(barre.fret) - DOT_R}
            y={stringY(barre.toString) - DOT_R}
            width={2 * DOT_R}
            height={
              stringY(barre.fromString) - stringY(barre.toString) + 2 * DOT_R
            }
            rx={DOT_R}
            fill="var(--fret-chord-tone)"
          />
        )}

        {positions.map((p) => {
          const style = DOT_STYLE[p.role];
          return (
            <g key={`${p.string}-${p.fret}`}>
              {p.midi === activeMidi && p.role !== 'outside' && (
                <circle
                  key={activeMidi}
                  cx={fretX(p.fret)}
                  cy={stringY(p.string)}
                  r={DOT_R + 3}
                  fill="none"
                  stroke="var(--highlight)"
                  strokeWidth={3}
                  className="origin-center animate-fret-pulse [transform-box:fill-box] motion-reduce:animate-none"
                />
              )}
              <circle
                cx={fretX(p.fret)}
                cy={stringY(p.string)}
                r={DOT_R}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.stroke ? 1.5 : undefined}
              />
              <text
                x={fretX(p.fret)}
                y={stringY(p.string)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={p.label.length > 2 ? 9 : 11}
                fontWeight={500}
                fill={style.text}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
