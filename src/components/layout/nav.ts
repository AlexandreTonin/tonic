import {
  ClefTreble,
  Drum,
  Dumbbell,
  Grid3x3,
  Layers,
  ListMusic,
  Network,
  Repeat,
  Ruler,
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
      { to: '/progressions', label: 'Progressões', icon: Repeat },
      { to: '/technique', label: 'Técnica', icon: Dumbbell },
      { to: '/rhythm', label: 'Ritmo', icon: Drum },
    ],
  },
];

export const APP_ICON = ClefTreble;
