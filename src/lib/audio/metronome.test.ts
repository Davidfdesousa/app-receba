import { describe, expect, it } from 'vitest';

import { beatInterval, beatsInWindow, countInNumber, effectiveTempo, leadInDuration } from './metronome.ts';

describe('metronome', () => {
  it('derives the beat and the count-in from the tempo', () => {
    expect(beatInterval(120)).toBe(500);
    expect(leadInDuration(120)).toBe(1500);
    expect(leadInDuration(null)).toBe(1200);
  });

  it('counts 3, 2, 1 before the first input', () => {
    expect(countInNumber(-1500, 120)).toBe(3);
    expect(countInNumber(-501, 120)).toBe(2);
    expect(countInNumber(-1, 120)).toBe(1);
    expect(countInNumber(0, 120)).toBeNull();
  });

  it('lists beats in a half-open window, accenting the combo start and every bar', () => {
    const beats = beatsInWindow(-1600, 2000, 120);
    expect(beats.map((beat) => beat.time)).toEqual([-1500, -1000, -500, 0, 500, 1000, 1500, 2000]);
    expect(beats.filter((beat) => beat.accent).map((beat) => beat.time)).toEqual([0, 2000]);
    expect(beatsInWindow(0, 500, 120).map((beat) => beat.time)).toEqual([500]);
  });

  it('reports the tempo heard at slower speeds', () => {
    expect(effectiveTempo(120, 0.5)).toBe(60);
  });
});
