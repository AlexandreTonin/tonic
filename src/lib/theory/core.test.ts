import { describe, expect, it } from 'vitest';
import {
  consonance,
  intervalLabel,
  invertInterval,
  parsePitchClass,
  parseTuning,
  pentatonicBox,
  romanNumeral,
  TUNINGS,
} from './core';

describe('intervalLabel', () => {
  it('labels intervals with accidentals before the number', () => {
    expect(['1P', '2m', '3m', '4A', '5d', '7m', '9M', '11A'].map(intervalLabel)).toEqual(
      ['R', 'b2', 'b3', '#4', 'b5', 'b7', '9', '#11'],
    );
  });
});

describe('romanNumeral', () => {
  it('uses uppercase numerals with flats for lowered degrees', () => {
    expect(romanNumeral('C', 'C')).toBe('I');
    expect(romanNumeral('C', 'Ab')).toBe('bVI');
    expect(romanNumeral('A', 'G')).toBe('bVII');
  });
});

describe('intervals', () => {
  it('inverts and classifies intervals', () => {
    expect(invertInterval('3M')).toBe('6m');
    expect(invertInterval('1P')).toBe('8P');
    expect(consonance('4P')).toBe('perfect');
    expect(consonance('6m')).toBe('imperfect');
    expect(consonance('2m')).toBe('dissonant');
  });
});

describe('parsers', () => {
  it('accepts pitch classes without octave or double accidentals', () => {
    expect(parsePitchClass('F#')).toBe('F#');
    expect(parsePitchClass('C4')).toBeUndefined();
    expect(parsePitchClass('C##')).toBeUndefined();
  });

  it('accepts named and custom six-string tunings', () => {
    expect(parseTuning('drop-d')).toEqual(TUNINGS['drop-d']);
    expect(parseTuning('E2,A2,D3,G3,B3,E4')).toHaveLength(6);
    expect(parseTuning('E2,A2')).toBeUndefined();
  });
});

describe('pentatonicBox', () => {
  it('places A minor pentatonic position 1 at the fifth fret', () => {
    expect(pentatonicBox('A', 'minor', 1, TUNINGS.standard)).toEqual([
      { lo: 5, hi: 8 },
      { lo: 5, hi: 7 },
      { lo: 5, hi: 7 },
      { lo: 5, hi: 7 },
      { lo: 5, hi: 8 },
      { lo: 5, hi: 8 },
    ]);
  });

  it('keeps every position on the fretboard', () => {
    for (let position = 1; position <= 5; position++) {
      const box = pentatonicBox('E', 'minor', position, TUNINGS.standard);
      expect(box.every(({ lo }) => lo >= 0)).toBe(true);
    }
  });
});
