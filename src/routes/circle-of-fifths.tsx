import { LinkRow, Related } from '@/components/theory/related';
import { getCircleKey, getCircleOfFifths } from '@/lib/theory/engine';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useMemo, type KeyboardEvent } from 'react';

const route = getRouteApi('/circle-of-fifths');
const CIRCLE = getCircleOfFifths();
const SIZE = 400;
const CENTER = SIZE / 2;
const OUTER = { from: 130, to: 196, name: 168, detail: 146 };
const INNER = { from: 80, to: 130, name: 110, detail: 92 };
const WEDGE = 360 / CIRCLE.length;

type Cell = { degree: string; symbol: string };
type Ring = typeof OUTER;

const point = (radius: number, degrees: number) => {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [
    CENTER + radius * Math.cos(radians),
    CENTER + radius * Math.sin(radians),
  ] as const;
};

const wedge = (position: number, ring: Ring) => {
  const start = position * WEDGE - WEDGE / 2;
  const end = start + WEDGE;
  const [x1, y1] = point(ring.to, start);
  const [x2, y2] = point(ring.to, end);
  const [x3, y3] = point(ring.from, end);
  const [x4, y4] = point(ring.from, start);
  return `M${x1} ${y1}A${ring.to} ${ring.to} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${ring.from} ${ring.from} 0 0 0 ${x4} ${y4}Z`;
};

const accidentals = (alteration: number) =>
  alteration === 0
    ? ''
    : `${Math.abs(alteration)}${alteration > 0 ? '♯' : '♭'}`;

const signatureText = (signature: string[], alteration: number) =>
  alteration === 0
    ? 'sem acidentes'
    : `${signature.length} ${alteration > 0 ? 'sustenido' : 'bemol'}${signature.length > 1 ? (alteration > 0 ? 's' : 'is') : ''}: ${signature.join(' ')}`;

export function CircleOfFifthsPage() {
  const { root } = route.useSearch();
  const navigate = route.useNavigate();
  const key = useMemo(() => getCircleKey(root), [root]);
  const select = (major: string) =>
    navigate({ to: '.', search: { root: major }, replace: true });

  const chords = [
    ...Object.values(key.diatonic.outer),
    ...Object.values(key.diatonic.inner),
  ].sort((a, b) => ORDER.indexOf(a.degree) - ORDER.indexOf(b.degree));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Círculo das quintas
        </h1>
        <p className="text-muted-foreground">
          Cada passo no sentido horário sobe uma quinta e acrescenta um
          sustenido; no sentido anti-horário, sobe uma quarta e acrescenta um
          bemol. Dentro, a relativa menor de cada tom.
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-md tabular-nums select-none"
          role="group"
          aria-label="Círculo das quintas"
        >
          {CIRCLE.map((k) => (
            <g key={k.position}>
              <Wedge
                position={k.position}
                ring={OUTER}
                name={k.major}
                detail={accidentals(k.alteration)}
                cell={key.diatonic.outer[k.position]}
                tonic={k.position === key.position}
                label={`${k.major} maior${k.alteration ? `, ${accidentals(k.alteration)}` : ''}`}
                onSelect={() => select(k.major)}
              />
              <Wedge
                position={k.position}
                ring={INNER}
                name={`${k.minor}m`}
                cell={key.diatonic.inner[k.position]}
                label={`${k.minor} menor, relativa de ${k.major}`}
                onSelect={() => select(k.major)}
              />
            </g>
          ))}
          <text
            x={CENTER}
            y={CENTER - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={26}
            fontWeight={600}
            fill="var(--foreground)"
          >
            {key.major}
          </text>
          <text
            x={CENTER}
            y={CENTER + 20}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--muted-foreground)"
          >
            {accidentals(key.alteration) || 'sem acidentes'}
          </text>
        </svg>

        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Tom</dt>
          <dd>
            {key.major} maior · relativa {key.minor} menor
          </dd>
          <dt className="text-muted-foreground">Armadura</dt>
          <dd>{signatureText(key.signature, key.alteration)}</dd>
          <dt className="text-muted-foreground">{key.major} maior</dt>
          <dd>{key.majorScale.join(' ')}</dd>
          <dt className="text-muted-foreground">{key.minor} menor</dt>
          <dd>{key.minorScale.join(' ')}</dd>
          <dt className="text-muted-foreground">Acordes do tom</dt>
          <dd>{chords.map((c) => `${c.degree} ${c.symbol}`).join(' · ')}</dd>
          <dt className="text-muted-foreground">Vizinhos</dt>
          <dd className="flex flex-col gap-1">
            <span>
              Dominante (V): <NeighborLink root={key.dominant.major} /> maior
            </span>
            <span>
              Subdominante (IV): <NeighborLink root={key.subdominant.major} />{' '}
              maior
            </span>
            <span>Relativa: {key.minor} menor</span>
          </dd>
        </dl>
      </div>

      <Related title="Relacionado">
        <LinkRow>
          <Link to="/harmonic-field" search={{ root: key.major }}>
            Campo harmônico de {key.major} maior
          </Link>
          <Link
            to="/harmonic-field"
            search={{ root: key.minor, mode: 'minor' }}
          >
            Campo harmônico de {key.minor} menor
          </Link>
          <Link
            to="/scales/$id"
            params={{ id: 'ionian' }}
            search={{ root: key.major }}
          >
            Escala de {key.major} maior
          </Link>
          <Link
            to="/scales/$id"
            params={{ id: 'aeolian' }}
            search={{ root: key.minor }}
          >
            Escala de {key.minor} menor
          </Link>
        </LinkRow>
      </Related>
    </div>
  );
}

const ORDER = ['I', 'IIm', 'IIIm', 'IV', 'V', 'VIm'];

function NeighborLink({ root }: { root: string }) {
  return (
    <Link
      to="/circle-of-fifths"
      search={{ root }}
      replace
      className="underline-offset-4 hover:underline"
    >
      {root}
    </Link>
  );
}

function Wedge({
  position,
  ring,
  name,
  detail,
  cell,
  tonic = false,
  label,
  onSelect,
}: {
  position: number;
  ring: Ring;
  name: string;
  detail?: string;
  cell?: Cell;
  tonic?: boolean;
  label: string;
  onSelect: () => void;
}) {
  const angle = position * WEDGE;
  const [nameX, nameY] = point(
    cell || detail ? ring.name : (ring.from + ring.to) / 2,
    angle,
  );
  const [detailX, detailY] = point(ring.detail, angle);
  const fill = tonic
    ? 'var(--highlight)'
    : cell
      ? 'var(--muted)'
      : 'var(--background)';
  const text = tonic ? 'var(--highlight-foreground)' : 'var(--foreground)';
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect();
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={cell ? `${label}, ${cell.degree} do tom` : label}
      aria-pressed={tonic}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="cursor-pointer outline-none [&:focus-visible>path]:stroke-ring [&:focus-visible>path]:stroke-2 [&:hover>path]:opacity-80"
    >
      <path
        d={wedge(position, ring)}
        fill={fill}
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text
        x={nameX}
        y={nameY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={ring === OUTER ? 15 : 12}
        fontWeight={cell ? 600 : 500}
        fill={text}
      >
        {cell?.symbol ?? name}
      </text>
      {(cell || detail) && (
        <text
          x={detailX}
          y={detailY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fill={tonic ? text : 'var(--muted-foreground)'}
        >
          {cell?.degree ?? detail}
        </text>
      )}
    </g>
  );
}
