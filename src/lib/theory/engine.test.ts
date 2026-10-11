import { describe, expect, it } from 'vitest';
import {
  getChord,
  getCircleKey,
  getHarmonicField,
  getLick,
  getProgression,
  getScale,
  listChords,
  listScales,
} from './engine';

describe('spelling', () => {
  it('spells each degree with its own letter', () => {
    expect(getChord('aug', 'A').notes).toEqual(['A', 'C#', 'E#']);
    expect(getChord('dim7', 'A').notes).toEqual(['A', 'C', 'Eb', 'Gb']);
  });

  it('never produces double sharps', () => {
    const scale = getScale('ionian', 'A#');
    expect(scale.root).toBe('Bb');
    expect(scale.notes).toEqual(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']);
    for (const { id } of [...listScales(), ...listChords()]) {
      for (const root of ['C#', 'D#', 'F#', 'G#', 'A#']) {
        const notes =
          listScales().some((s) => s.id === id)
            ? getScale(id, root).notes
            : getChord(id, root).notes;
        expect(notes.join(' ')).not.toContain('##');
      }
    }
  });
});

describe('getHarmonicField', () => {
  it('builds the major field with roman numerals', () => {
    expect(getHarmonicField({ root: 'C' }).chords.map((c) => c.degree)).toEqual(
      ['Imaj7', 'IIm7', 'IIIm7', 'IVmaj7', 'V7', 'VIm7', 'VIIm7b5'],
    );
  });

  it('uses the harmonic minor dominant when asked', () => {
    const field = getHarmonicField({ root: 'A', mode: 'minor', dominant: true });
    expect(field.chords.map((c) => c.degree)).toEqual([
      'Im7',
      'IIm7b5',
      'bIIImaj7',
      'IVm7',
      'V7',
      'bVImaj7',
      'bVII7',
    ]);
  });
});

describe('getProgression', () => {
  it('resolves degrees in the chosen key', () => {
    expect(
      getProgression('im-bvi-biii-bvii', 'A').bars.map((b) => b.symbol),
    ).toEqual(['Am', 'F', 'C', 'G']);
  });
});

describe('getCircleKey', () => {
  it('returns key signatures', () => {
    expect(getCircleKey('G').signature).toEqual(['F#']);
    expect(getCircleKey('F').signature).toEqual(['Bb']);
  });
});

describe('getLick', () => {
  it('is deterministic for the same seed', () => {
    const a = getLick('minor-pentatonic', 'A', 1, 2, 'seed');
    const b = getLick('minor-pentatonic', 'A', 1, 2, 'seed');
    expect(a).toEqual(b);
    expect(a.bars).toHaveLength(2);
  });

  it('rejects scales without licks', () => {
    expect(() => getLick('ionian', 'A', 1, 2, 'seed')).toThrow();
  });
});
