import { describe, expect, it } from 'vitest';
import { hitTimes, parseRhythm, scoreTaps } from './rhythm';

describe('parseRhythm', () => {
  it('parses hits, sustains, rests and alternate strokes', () => {
    expect(
      parseRhythm('X-x.', 2).map(({ state, accent, stroke }) => [state, accent, stroke]),
    ).toEqual([
      ['hit', true, 'down'],
      ['sustain', false, 'up'],
      ['hit', false, 'down'],
      ['rest', false, 'up'],
    ]);
  });

  it('rejects unknown steps', () => {
    expect(() => parseRhythm('xo', 2)).toThrow();
  });
});

describe('timing', () => {
  it('computes hit times across bars', () => {
    expect(hitTimes(parseRhythm('x.', 2), 2, 60, 2)).toEqual([0, 1000]);
  });

  it('scores taps within the window', () => {
    expect(scoreTaps([0, 500], [10, 700], 100)).toMatchObject({
      offsets: [10, null],
      missed: 1,
      extra: 1,
      onTimePct: 50,
    });
  });
});
