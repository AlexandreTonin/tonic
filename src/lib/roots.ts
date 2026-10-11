import { Note } from 'tonal';

export const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export type Root = (typeof ROOTS)[number];

export const stepRoot = (root: string, delta: number) =>
  ROOTS[
    (((ROOTS.findIndex((r) => Note.chroma(r) === Note.chroma(root)) + delta) %
      12) +
      12) %
      12
  ];

export const shapeRoot = (root: string, capo: number) =>
  ROOTS.find(
    (r) => (Note.chroma(r) - Note.chroma(root) + capo + 120) % 12 === 0,
  ) ?? root;
