import { describe, expect, it } from 'vitest';

import { countMeterBars, isJumpPress, isMotionPress, parseNotation, parsePresses } from './notation.ts';

describe('parseNotation', () => {
  it('splits presses, joins simultaneous buttons and keeps pauses', () => {
    expect(parseNotation('D F 3 , 1+EX')).toEqual([
      { kind: 'press', press: ['D'] },
      { kind: 'press', press: ['F'] },
      { kind: 'press', press: ['3'] },
      { kind: 'pause' },
      { kind: 'press', press: ['1', 'EX'] },
    ]);
  });

  it('ignores extra whitespace', () => {
    expect(parsePresses('  F+2   1 ')).toEqual([['F', '2'], ['1']]);
  });

  it('rejects unknown tokens', () => {
    expect(() => parseNotation('D B X')).toThrow('Unknown input token "X"');
  });
});

describe('press helpers', () => {
  it('recognises motions and jumps', () => {
    expect(isMotionPress(['D'])).toBe(true);
    expect(isMotionPress(['F', 'K'])).toBe(false);
    expect(isJumpPress(['UF'])).toBe(true);
    expect(isJumpPress(['D'])).toBe(false);
  });

  it('counts one bar per amplified press', () => {
    expect(countMeterBars('D B 3+EX TH')).toBe(1);
    expect(countMeterBars('2 2 2')).toBe(0);
  });
});
