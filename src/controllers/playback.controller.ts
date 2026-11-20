import type { ReactiveController, ReactiveControllerHost } from 'lit';

import { AudioEngine, type ClickSound } from '../lib/audio/audio-engine.ts';
import { beatsInWindow, countInNumber, leadInDuration, type MetronomeTempo } from '../lib/audio/metronome.ts';
import { isMotionPress, type Press } from '../lib/combo/notation.ts';
import { timing, type Timeline } from '../lib/combo/timeline.ts';
import type { PlaybackSpeed } from '../lib/preferences.ts';

/** The parts of the audio engine playback relies on; tests pass a fake. */
export type PlaybackEngine = Pick<AudioEngine, 'running' | 'now' | 'unlock' | 'click' | 'cancelScheduled'>;

/**
 * - `ready`: stopped before the first input (shows a play icon)
 * - `count-in`: playing, counting 3, 2, 1
 * - `running`: at or after the first input, playing or paused
 * - `ended`: stopped after the last input
 */
export type PlaybackPhase = 'ready' | 'count-in' | 'running' | 'ended';

export interface PlaybackOptions {
  engine?: PlaybackEngine;
  speed?: PlaybackSpeed;
  loop?: boolean;
  inputClicks?: boolean;
  metronomeTempo?: MetronomeTempo | null;
}

/** How far ahead clicks are handed to the audio clock, in real milliseconds. */
export const scheduleLookaheadMs = 120;

/**
 * Events further in the past than this (after a stalled frame, a hidden tab or a late
 * audio start) are skipped instead of all playing at once.
 */
const staleEventMs = 50;

type ClockSource = 'audio' | 'page';

interface Anchor {
  /** Engine clock, in seconds. */
  clock: number;
  /** Combo time at that clock, in milliseconds. */
  time: number;
  source: ClockSource;
}

export function clickSoundFor(press: Press): ClickSound {
  if (press.includes('K')) return 'kameo';
  if (press.includes('EX')) return 'amplify';
  if (isMotionPress(press)) return 'direction';
  return 'button';
}

/**
 * Owns the playback clock. Combo time is in milliseconds at 1x: 0 is the first input
 * and negative values are the count-in. Time always derives from `engine.now()`, so the
 * picture and the scheduled clicks share one clock. The host re-renders every frame
 * while playing.
 */
export class PlaybackController implements ReactiveController {
  time: number;
  playing = false;
  ended = false;
  speed: PlaybackSpeed;
  loop: boolean;
  inputClicks: boolean;
  metronomeTempo: MetronomeTempo | null;
  timeline: Timeline | null = null;

  private readonly engine: PlaybackEngine;
  private anchor: Anchor;
  /** Combo time up to which clicks were already handed to the engine. */
  private scheduledUntil: number;
  private frame: number | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    options: PlaybackOptions = {},
  ) {
    this.engine = options.engine ?? new AudioEngine();
    this.speed = options.speed ?? 1;
    this.loop = options.loop ?? false;
    this.inputClicks = options.inputClicks ?? true;
    this.metronomeTempo = options.metronomeTempo ?? null;
    this.time = -this.leadIn;
    this.anchor = this.anchorAt(this.time);
    this.scheduledUntil = this.time;
    host.addController(this);
  }

  /** Count-in length before the first input, in combo milliseconds. */
  get leadIn(): number {
    return leadInDuration(this.metronomeTempo);
  }

  /** Time at which playback stops (or loops): the last input plus the tail. */
  get end(): number {
    return (this.timeline?.duration ?? 0) + timing.tail;
  }

  get phase(): PlaybackPhase {
    if (this.ended) return 'ended';
    if (this.time < 0) return this.playing ? 'count-in' : 'ready';
    return 'running';
  }

  /** 3, 2, 1 while counting in; null otherwise. */
  get countIn(): number | null {
    return this.phase === 'count-in' ? countInNumber(this.time, this.metronomeTempo) : null;
  }

  /** Paused somewhere after the start, so play continues rather than starts. */
  get resumable(): boolean {
    return !this.playing && !this.ended && this.time > -this.leadIn;
  }

  /** 0 to 1 across the inputs. */
  get progress(): number {
    const duration = this.timeline?.duration ?? 0;
    if (duration <= 0) return this.time >= 0 ? 1 : 0;
    return Math.min(1, Math.max(0, this.time / duration));
  }

  hostDisconnected(): void {
    this.playing = false;
    this.cancelFrame();
    this.engine.cancelScheduled();
  }

  /** Must run from a user gesture: it unlocks audio. */
  play(): void {
    if (this.playing || !this.timeline) return;

    this.engine.unlock();
    if (this.ended) {
      this.ended = false;
      this.time = -this.leadIn;
    }
    this.playing = true;
    this.reanchor();
    // One millisecond back so the beat or input exactly at the start also sounds.
    this.scheduledUntil = this.time - 1;
    this.schedule();
    this.requestFrame();
    this.host.requestUpdate();
  }

  pause(): void {
    if (!this.playing) return;

    this.playing = false;
    this.cancelFrame();
    this.engine.cancelScheduled();
    this.host.requestUpdate();
  }

  toggle(): void {
    if (this.playing) this.pause();
    else this.play();
  }

  /** Back to the start of the count-in, playing. */
  restart(): void {
    this.ended = false;
    this.time = -this.leadIn;
    if (!this.playing) {
      this.play();
      this.host.requestUpdate();
      return;
    }

    this.engine.cancelScheduled();
    this.reanchor();
    this.scheduledUntil = this.time - 1;
    this.schedule();
    this.host.requestUpdate();
  }

  seek(time: number): void {
    this.time = time;
    this.ended = false;
    this.reschedule();
    this.host.requestUpdate();
  }

  /** Stops and rewinds to the count-in of a new timeline. */
  load(timeline: Timeline): void {
    this.playing = false;
    this.cancelFrame();
    this.engine.cancelScheduled();
    this.timeline = timeline;
    this.ended = false;
    this.time = -this.leadIn;
    this.reanchor();
    this.scheduledUntil = this.time;
    this.host.requestUpdate();
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.syncTime();
    this.speed = speed;
    this.reschedule();
    this.host.requestUpdate();
  }

  setLoop(loop: boolean): void {
    this.loop = loop;
    this.host.requestUpdate();
  }

  setInputClicks(enabled: boolean): void {
    this.syncTime();
    this.inputClicks = enabled;
    this.reschedule();
    this.host.requestUpdate();
  }

  setMetronomeTempo(tempo: MetronomeTempo | null): void {
    this.syncTime();
    this.metronomeTempo = tempo;
    // Stopped before the first input: the count-in takes the new tempo's length.
    if (!this.playing && !this.ended && this.time < 0) this.time = -this.leadIn;
    this.reschedule();
    this.host.requestUpdate();
  }

  private readonly onFrame = (): void => {
    this.frame = null;
    if (!this.playing) return;

    this.advance();
    this.host.requestUpdate();
  };

  /** One frame: reads the clock, handles the end, schedules clicks and asks for the next frame. */
  private advance(): void {
    this.syncTime();

    if (this.time > this.end) {
      if (this.loop) {
        this.time = -this.leadIn;
        this.reanchor();
        this.scheduledUntil = this.time - 1;
      } else {
        this.time = this.end;
        this.playing = false;
        this.ended = true;
        this.cancelFrame();
        return;
      }
    }

    this.schedule();
    this.requestFrame();
  }

  /** Reads the current time from the clock while playing. */
  private syncTime(): void {
    if (!this.playing) return;

    if (this.clockSource() !== this.anchor.source) {
      // Audio started (or stopped) since the last anchor: the clocks differ, keep the current time.
      this.reanchor();
      return;
    }
    this.time = this.anchor.time + (this.engine.now() - this.anchor.clock) * 1000 * this.speed;
  }

  /** Hands the clicks that fall inside the lookahead window to the audio clock, each exactly once. */
  private schedule(): void {
    if (!this.playing || !this.engine.running || !this.timeline) return;

    const from = Math.max(this.scheduledUntil, this.time - staleEventMs * this.speed);
    const horizon = Math.min(this.time + scheduleLookaheadMs * this.speed, this.end);
    if (horizon <= from) return;

    if (this.inputClicks) {
      for (const input of this.timeline.inputs) {
        if (input.time > from && input.time <= horizon) {
          this.engine.click(clickSoundFor(input.press), this.audioTimeOf(input.time));
        }
      }
    }

    if (this.metronomeTempo !== null) {
      for (const beat of beatsInWindow(from, horizon, this.metronomeTempo)) {
        this.engine.click(beat.accent ? 'downbeat' : 'beat', this.audioTimeOf(beat.time));
      }
    }

    this.scheduledUntil = horizon;
  }

  /** After a jump in time or a speed/sound change: drop queued clicks and schedule again from now. */
  private reschedule(): void {
    this.reanchor();
    this.engine.cancelScheduled();
    this.scheduledUntil = this.time;
    this.schedule();
  }

  private audioTimeOf(time: number): number {
    return this.anchor.clock + (time - this.anchor.time) / this.speed / 1000;
  }

  private reanchor(): void {
    this.anchor = this.anchorAt(this.time);
  }

  private anchorAt(time: number): Anchor {
    return { clock: this.engine.now(), time, source: this.clockSource() };
  }

  private clockSource(): ClockSource {
    return this.engine.running ? 'audio' : 'page';
  }

  private requestFrame(): void {
    this.frame ??= requestAnimationFrame(this.onFrame);
  }

  private cancelFrame(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }
}
