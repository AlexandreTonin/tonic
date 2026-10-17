import { describe, expect, it } from 'vitest';
import {
  getChord,
  getCircleKey,
  getHarmonicField,
  getHorizontalRun,
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
        const notes = listScales().some((s) => s.id === id)
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
    const field = getHarmonicField({
      root: 'A',
      mode: 'minor',
      dominant: true,
    });
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
    expect(() => getLick('chromatic', 'A', 1, 2, 'seed')).toThrow();
  });
});

describe('getHorizontalRun', () => {
  const frets = (run: ReturnType<typeof getHorizontalRun>) =>
    run.notes.map((n) => `${n.string}:${n.technique ?? ''}${n.fret}`);

  it('climbs the neck three and two notes per string', () => {
    const run = getHorizontalRun('major-pentatonic', 'G', 1);
    expect(frets(run)).toEqual([
      '6:3',
      '6:5',
      '6:/7',
      '5:5',
      '5:7',
      '4:5',
      '4:7',
      '4:/9',
      '3:7',
      '3:9',
      '2:8',
      '2:10',
      '2:/12',
      '1:10',
      '1:12',
      '1:/15',
    ]);
    expect(run.notes.at(-1)?.note).toBe('G');
    expect(run.beats).toBe(8);
  });

  it('starts on the chosen degree', () => {
    const run = getHorizontalRun('minor-pentatonic', 'A', 3);
    expect(run.notes[0]).toMatchObject({ string: 6, fret: 10, note: 'D' });
    expect(run.notes.at(-1)?.note).toBe('D');
  });

  it('descends with slides back down', () => {
    const up = getHorizontalRun('major-pentatonic', 'G', 1, 'up');
    const down = getHorizontalRun('major-pentatonic', 'G', 1, 'down');
    expect(down.notes.map((n) => n.midi)).toEqual(
      up.notes.map((n) => n.midi).reverse(),
    );
    expect(frets(down).slice(0, 3)).toEqual(['1:15', '1:\\12', '1:10']);
  });

  it('goes up and down without repeating the top note', () => {
    const run = getHorizontalRun('major-pentatonic', 'G', 1, 'both');
    expect(run.notes).toHaveLength(31);
    expect(run.beats).toBe(16);
    expect(run.notes.at(-1)?.duration).toBe(1);
  });

  it('adds the blue note on the string of the note below it', () => {
    const run = getHorizontalRun('blues', 'A', 1);
    const blues = run.notes.filter((n) => n.blue);
    expect(blues.length).toBeGreaterThan(0);
    for (const b of blues) {
      const i = run.notes.indexOf(b);
      expect(b.degree).toBe('b5');
      expect(run.notes[i - 1]).toMatchObject({
        string: b.string,
        fret: b.fret - 1,
        degree: '4',
      });
    }
    expect(
      getHorizontalRun('major-blues', 'C', 1).notes.some(
        (n) => n.degree === 'b3',
      ),
    ).toBe(true);
  });

  it('follows the tuning', () => {
    const run = getHorizontalRun('minor-pentatonic', 'D', 1, 'up', 'drop-d');
    expect(run.notes[0]).toMatchObject({ string: 6, fret: 0, note: 'D' });
    expect(run.notes.at(-1)?.note).toBe('D');
    expect(run.notes.every((n) => n.fret >= 0)).toBe(true);
  });

  it('rejects other scales', () => {
    expect(() => getHorizontalRun('dorian', 'A', 1)).toThrow();
  });
});
