/**
 * Metronome math, in combo time (milliseconds at 1x speed; 0 is the first input).
 * Playback speed scales real tempo, so 120 BPM at 0.5x is heard as 60 BPM.
 */
export const metronomeTempos = [90, 120, 150] as const;
export type MetronomeTempo = (typeof metronomeTempos)[number];

/** Beats counted before the combo starts: 3, 2, 1, then the first input lands on the downbeat. */
export const countInBeats = 3;
export const beatsPerBar = 4;

/** Count-in pace when the metronome is off. */
const silentCountInBeatMs = 400;

export interface Beat {
  time: number;
  /** Beat index; 0 is the combo start, negatives are the count-in. */
  index: number;
  accent: boolean;
}

export function isMetronomeTempo(value: unknown): value is MetronomeTempo {
  return (metronomeTempos as readonly unknown[]).includes(value);
}

export function beatInterval(tempo: MetronomeTempo | null): number {
  return tempo === null ? silentCountInBeatMs : 60_000 / tempo;
}

/** Time before the first input, so the count-in lands on real beats. */
export function leadInDuration(tempo: MetronomeTempo | null): number {
  return countInBeats * beatInterval(tempo);
}

/** Number shown during the count-in (3, 2, 1), or null once the combo is running. */
export function countInNumber(time: number, tempo: MetronomeTempo | null): number | null {
  if (time >= 0) return null;
  return Math.min(countInBeats, Math.ceil(-time / beatInterval(tempo)));
}

/** Beats with time in the half-open window (from, to]. */
export function beatsInWindow(from: number, to: number, tempo: MetronomeTempo): Beat[] {
  const interval = beatInterval(tempo);
  const beats: Beat[] = [];
  const first = Math.max(-countInBeats, Math.floor(from / interval) + 1);

  for (let index = first; index * interval <= to; index++) {
    const time = index * interval;
    if (time <= from) continue;
    beats.push({ time, index, accent: ((index % beatsPerBar) + beatsPerBar) % beatsPerBar === 0 });
  }

  return beats;
}

/** Real beats per minute heard at a playback speed. */
export function effectiveTempo(tempo: MetronomeTempo, speed: number): number {
  return Math.round(tempo * speed);
}
