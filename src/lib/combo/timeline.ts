import type { ComboStep, StepKind } from './combo.types.ts';
import { isJumpPress, isMotionPress, parseNotation, type Press } from './notation.ts';

/**
 * Approximate execution rhythm, in milliseconds at 1x speed.
 * Real timing depends on hitstun; these values give a practical cadence to learn from.
 */
export const timing = {
  /** Wait before a step starts, by the kind of step. */
  stepGap: { normal: 260, special: 90, kameo: 130, air: 150, finisher: 90 } satisfies Record<
    StepKind,
    number
  >,
  /** Extra wait for the kameo to connect before the next step. */
  afterKameo: 240,
  /** Extra wait while the fighters cross over. */
  afterSideSwap: 260,
  /** Extra wait while a button is held. */
  afterHold: 350,
  /** Between directions of a motion (D, B, …) and into its button. */
  motion: 60,
  /** From the jump input to the first air attack. */
  jump: 380,
  /** Between buttons of a string (2, 2, 2). */
  button: 170,
  /** A written pause (`,`). */
  pause: 300,
  /** Inputs closer than this inside a step are drawn as one note on the lane. */
  noteMergeWindow: 60,
  /** Time the result stays on screen after the last input. */
  tail: 600,
} as const;

export interface TimelineInput {
  time: number;
  press: Press;
  stepIndex: number;
  /** Comes right after a `,` pause in the notation. */
  afterPause: boolean;
}

/** One block on the lane: a press, or a motion merged with its button (D B 3+EX). */
export interface TimelineNote {
  time: number;
  stepIndex: number;
  inputs: readonly TimelineInput[];
}

export interface TimelineStep {
  start: number;
  end: number;
}

export interface Timeline {
  inputs: readonly TimelineInput[];
  notes: readonly TimelineNote[];
  steps: readonly TimelineStep[];
  /** Time of the last input. */
  duration: number;
}

function gapBefore(step: ComboStep, previous: ComboStep | undefined): number {
  if (!previous) return 0;

  let gap = timing.stepGap[step.kind];
  if (previous.kind === 'kameo') gap += timing.afterKameo;
  if (previous.swapsSide) gap += timing.afterSideSwap;
  if (previous.holds) gap += timing.afterHold;
  return gap;
}

function intervalAfter(press: Press, afterPause: boolean): number {
  if (afterPause) return timing.pause;
  if (isJumpPress(press)) return timing.jump;
  if (isMotionPress(press)) return timing.motion;
  return timing.button;
}

function groupNotes(inputs: readonly TimelineInput[]): TimelineNote[] {
  const notes: { time: number; stepIndex: number; inputs: TimelineInput[] }[] = [];

  for (const input of inputs) {
    const current = notes.at(-1);
    const last = current?.inputs.at(-1);
    const merges =
      current !== undefined &&
      last !== undefined &&
      current.stepIndex === input.stepIndex &&
      !input.afterPause &&
      input.time - last.time <= timing.noteMergeWindow;

    if (merges) current.inputs.push(input);
    else notes.push({ time: input.time, stepIndex: input.stepIndex, inputs: [input] });
  }

  return notes;
}

export function buildTimeline(steps: readonly ComboStep[]): Timeline {
  const inputs: TimelineInput[] = [];
  const stepTimes: TimelineStep[] = [];
  let time = 0;

  steps.forEach((step, stepIndex) => {
    time += gapBefore(step, steps[stepIndex - 1]);
    const start = time;
    let previous: Press | undefined;
    let pendingPause = false;

    for (const part of parseNotation(step.notation)) {
      if (part.kind === 'pause') {
        pendingPause = true;
        continue;
      }

      if (previous) time += intervalAfter(previous, pendingPause);
      inputs.push({ time, press: part.press, stepIndex, afterPause: pendingPause });
      previous = part.press;
      pendingPause = false;
    }

    stepTimes.push({ start, end: time });
  });

  return { inputs, notes: groupNotes(inputs), steps: stepTimes, duration: time };
}

/** Index of the last element whose time is at or before `time`, or -1. */
export function lastIndexAtOrBefore(items: readonly { time: number }[], time: number): number {
  let low = 0;
  let high = items.length - 1;
  let found = -1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    if (items[middle]!.time <= time) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return found;
}
