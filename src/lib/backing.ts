import { Note } from 'tonal';

export const TRACKS = ['guitar', 'bass', 'piano', 'drums', 'click'] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_LABELS: Record<Track, string> = {
  guitar: 'Guitarra',
  bass: 'Baixo',
  piano: 'Piano',
  drums: 'Bateria',
  click: 'Metrônomo',
};

export type Groove = 'rock' | 'shuffle' | 'swing';

export const grooveFor = (category: string): Groove =>
  category === 'Blues' ? 'shuffle' : category === 'Jazz' ? 'swing' : 'rock';

export type BackingChord = {
  root: string;
  notes: string[];
  intervals: string[];
};

const LOWEST_BASS = 28;
const LOWEST_PIANO = 48;

const lowestAbove = (note: string, floor: number) =>
  floor + ((Note.chroma(note) - floor + 120) % 12);

const up = (from: number, note: string) =>
  from + ((Note.chroma(note) - (from % 12) + 12) % 12 || 12);

export function bassLine({ root, notes, intervals }: BackingChord) {
  const low = lowestAbove(root, LOWEST_BASS);
  const fifthIndex = intervals.findIndex((i) => /^[b#]?5$/.test(i));
  const fifth =
    fifthIndex === -1
      ? low + 7
      : low + ((Note.chroma(notes[fifthIndex]) - (low % 12) + 12) % 12);
  return { root: low, fifth };
}

export function pianoVoicing({ root, notes }: BackingChord) {
  return notes
    .slice(1)
    .reduce(
      (midis, note) => [...midis, up(midis[midis.length - 1], note)],
      [lowestAbove(root, LOWEST_PIANO)],
    );
}

export type DrumHit = { sample: string; offset: number; velocity: number };

export function drumHits(groove: Groove, beatInBar: number): DrumHit[] {
  const backbeat = beatInBar % 2 === 1;
  if (groove === 'swing') {
    return [
      { sample: 'ride', offset: 0, velocity: 80 },
      ...(backbeat
        ? [
            { sample: 'ride', offset: 2 / 3, velocity: 60 },
            { sample: 'hhclosed-short', offset: 0, velocity: 70 },
          ]
        : []),
    ];
  }
  const offbeat = groove === 'shuffle' ? 2 / 3 : 1 / 2;
  return [
    { sample: 'hhclosed', offset: 0, velocity: 75 },
    { sample: 'hhclosed', offset: offbeat, velocity: 55 },
    backbeat
      ? { sample: 'snare-m', offset: 0, velocity: 100 }
      : { sample: 'kick', offset: 0, velocity: 110 },
  ];
}
