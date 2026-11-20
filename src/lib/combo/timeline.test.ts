import { describe, expect, it } from 'vitest';

import type { ComboStep } from './combo.types.ts';
import { buildTimeline, lastIndexAtOrBefore, timing } from './timeline.ts';

const steps: ComboStep[] = [
  { notation: 'F+2 1', kind: 'normal', label: 'Abertura' },
  { notation: 'D B 3+EX', kind: 'special', label: 'Backstage Pass EX', swapsSide: true },
  { notation: 'F+K', kind: 'kameo', label: 'Scorpion' },
  { notation: 'U 2', kind: 'air', label: 'Pulo' },
  { notation: 'D F 3 , 1', kind: 'finisher', label: 'Final' },
];

describe('buildTimeline', () => {
  const timeline = buildTimeline(steps);
  const times = timeline.inputs.map((input) => input.time);

  it('starts the first input at zero and spaces a string by the button interval', () => {
    expect(times.slice(0, 2)).toEqual([0, timing.button]);
  });

  it('cancels into a special with a short gap and quick motion inputs', () => {
    const start = timing.button + timing.stepGap.special;
    expect(times.slice(2, 5)).toEqual([start, start + timing.motion, start + 2 * timing.motion]);
  });

  it('waits for the side swap before the next step', () => {
    expect(timeline.steps[2]!.start).toBe(
      timeline.steps[1]!.end + timing.stepGap.kameo + timing.afterSideSwap,
    );
  });

  it('waits for the kameo to connect and for the jump', () => {
    const air = timeline.steps[3]!;
    expect(air.start).toBe(timeline.steps[2]!.end + timing.stepGap.air + timing.afterKameo);
    expect(air.end - air.start).toBe(timing.jump);
  });

  it('honours written pauses', () => {
    const finisher = timeline.steps[4]!;
    expect(finisher.end - finisher.start).toBe(2 * timing.motion + timing.pause);
    expect(timeline.duration).toBe(finisher.end);
  });

  it('merges a motion with its button into one lane note, but not across a pause', () => {
    const notes = timeline.notes.map((note) => note.inputs.map((input) => input.press.join('+')).join(' '));
    expect(notes).toEqual(['F+2', '1', 'D B 3+EX', 'F+K', 'U', '2', 'D F 3', '1']);
  });
});

describe('lastIndexAtOrBefore', () => {
  const items = [{ time: 0 }, { time: 100 }, { time: 250 }];

  it('finds the latest item not after the given time', () => {
    expect(lastIndexAtOrBefore(items, -1)).toBe(-1);
    expect(lastIndexAtOrBefore(items, 0)).toBe(0);
    expect(lastIndexAtOrBefore(items, 249)).toBe(1);
    expect(lastIndexAtOrBefore(items, 999)).toBe(2);
  });
});
