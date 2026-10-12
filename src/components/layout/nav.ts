import {
  AudioLines,
  CircleDot,
  Ear,
  ClefTreble,
  Drum,
  Dumbbell,
  Grid3x3,
  Layers,
  ListMusic,
  Network,
  NotebookPen,
  Puzzle,
  Repeat,
  ScanSearch,
  SearchCode,
  Ruler,
  Target,
  Timer,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = { to: string; label: string; icon: LucideIcon };
export type NavGroup = { label?: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: 'Biblioteca',
    items: [
      { to: '/scales', label: 'Escalas', icon: ListMusic },
      { to: '/chords', label: 'Acordes', icon: Grid3x3 },
      { to: '/arpeggios', label: 'Arpejos', icon: Layers },
      { to: '/intervals', label: 'Intervalos', icon: Ruler },
      { to: '/harmonic-field', label: 'Campo harmônico', icon: Network },
      {
        to: '/circle-of-fifths',
        label: 'Círculo das quintas',
        icon: CircleDot,
      },
      { to: '/progressions', label: 'Progressões', icon: Repeat },
      { to: '/technique', label: 'Técnica', icon: Dumbbell },
      { to: '/rhythm', label: 'Ritmo', icon: Drum },
    ],
  },
  {
    label: 'Treino',
    items: [
      { to: '/fretboard-trainer', label: 'Notas no braço', icon: Target },
      { to: '/ear-training', label: 'Ouvido', icon: Ear },
      { to: '/harmonic-quiz', label: 'Tons e graus', icon: Puzzle },
      { to: '/practice-log', label: 'Diário de prática', icon: NotebookPen },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { to: '/metronome', label: 'Metrônomo', icon: Timer },
      { to: '/tuner', label: 'Afinador', icon: AudioLines },
      { to: '/chord-finder', label: 'Identificar acorde', icon: ScanSearch },
      { to: '/scale-finder', label: 'Identificar escala', icon: SearchCode },
    ],
  },
];

export const APP_ICON = ClefTreble;

export const REPO_URL = 'https://github.com/alexandretonin/tonic';

export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/alexandretonin';
