import type { BeatFigures, FigureEvent } from '@/lib/theory/rhythm';

const CELL = 44;

const H = 64;
const LINE = 44;
const STEM_TOP = 16;
const BEAM = 3.5;
const BEAM_GAP = 6;

const centre = (e: FigureEvent) => e.start * CELL + CELL / 2;

const flagCount = (e: FigureEvent) =>
  e.figure === 'sixteenth' ? 2 : e.figure === 'eighth' ? 1 : 0;

export function BeatNotation({
  beat,
  stepsPerBeat,
}: {
  beat: BeatFigures;
  stepsPerBeat: number;
}) {
  const width = stepsPerBeat * CELL;
  const notes = beat.events.filter((e) => e.kind === 'note');
  const beamed = notes.filter((e) => flagCount(e) > 0);
  const groups: FigureEvent[][] = [];
  for (const note of beamed) {
    const group = groups.at(-1);
    const prev = group?.at(-1);
    if (group && prev && prev.start + prev.length === note.start)
      group.push(note);
    else groups.push([note]);
  }
  const inBeam = new Set(groups.filter((g) => g.length > 1).flat());

  return (
    <svg
      width={width}
      height={H}
      viewBox={`0 0 ${width} ${H}`}
      className="overflow-visible text-foreground"
      aria-hidden
    >
      <line x1={0} x2={width} y1={LINE} y2={LINE} stroke="var(--border)" />
      {beat.tuplet && (
        <text
          x={width / 2}
          y={8}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px] italic"
        >
          3
        </text>
      )}

      {beat.events.map((e, i) =>
        e.kind === 'rest' ? (
          <Rest key={i} event={e} x={e.start * CELL + (e.length * CELL) / 2} />
        ) : (
          <g key={i}>
            <title>{e.name}</title>
            {e.tiedFromPrevious && (
              <path
                d={`M ${centre(e) - 34} ${LINE + 7} Q ${centre(e) - 20} ${LINE + 15} ${centre(e) - 6} ${LINE + 7}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
            )}
            <ellipse
              cx={centre(e)}
              cy={LINE}
              rx={5.5}
              ry={4}
              transform={`rotate(-20 ${centre(e)} ${LINE})`}
              fill="currentColor"
            />
            <line
              x1={centre(e) + 5}
              x2={centre(e) + 5}
              y1={LINE - 1}
              y2={STEM_TOP}
              stroke="currentColor"
              strokeWidth={1.5}
            />
            {e.dotted && (
              <circle
                cx={centre(e) + 11}
                cy={LINE - 2}
                r={1.8}
                fill="currentColor"
              />
            )}
            {!inBeam.has(e) &&
              Array.from({ length: flagCount(e) }, (_, f) => (
                <path
                  key={f}
                  d={`M ${centre(e) + 5} ${STEM_TOP + f * BEAM_GAP} q 9 6 7 15`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              ))}
          </g>
        ),
      )}

      {groups
        .filter((g) => g.length > 1)
        .map((group, gi) => (
          <g key={gi}>
            <rect
              x={centre(group[0]) + 4.25}
              y={STEM_TOP}
              width={centre(group.at(-1)!) - centre(group[0]) + 1.5}
              height={BEAM}
              fill="currentColor"
            />
            {group.map((note, i) => {
              if (note.figure !== 'sixteenth') return null;
              const next = group[i + 1];
              const prev = group[i - 1];
              if (next?.figure === 'sixteenth') {
                return (
                  <rect
                    key={i}
                    x={centre(note) + 4.25}
                    y={STEM_TOP + BEAM_GAP}
                    width={centre(next) - centre(note) + 1.5}
                    height={BEAM}
                    fill="currentColor"
                  />
                );
              }
              if (prev?.figure === 'sixteenth') return null;
              const toRight = !prev;
              return (
                <rect
                  key={i}
                  x={toRight ? centre(note) + 4.25 : centre(note) - 4.25}
                  y={STEM_TOP + BEAM_GAP}
                  width={10}
                  height={BEAM}
                  fill="currentColor"
                />
              );
            })}
          </g>
        ))}
    </svg>
  );
}

function Rest({ event, x }: { event: FigureEvent; x: number }) {
  return (
    <g>
      <title>{event.name}</title>
      {event.figure === 'quarter' ? (
        <path
          d={`M ${x - 2} ${LINE - 14} l 5 6 l -5 6 l 5 6 q -7 -3 -3 6`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : (
        Array.from({ length: event.figure === 'sixteenth' ? 2 : 1 }, (_, f) => (
          <g key={f}>
            <circle
              cx={x - 3 - f * 2}
              cy={LINE - 8 + f * 6}
              r={2.2}
              fill="currentColor"
            />
            <path
              d={`M ${x - 3 - f * 2} ${LINE - 6 + f * 6} q 4 1 6 -3 L ${x - 2} ${LINE + 8}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </g>
        ))
      )}
      {event.dotted && (
        <circle cx={x + 7} cy={LINE - 4} r={1.8} fill="currentColor" />
      )}
    </g>
  );
}
