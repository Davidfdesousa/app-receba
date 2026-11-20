import type { ReactiveControllerHost } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClickSound } from '../lib/audio/audio-engine.ts';
import type { ComboStep } from '../lib/combo/combo.types.ts';
import { buildTimeline, timing } from '../lib/combo/timeline.ts';
import { PlaybackController, clickSoundFor, type PlaybackOptions } from './playback.controller.ts';

const steps: ComboStep[] = [
  { notation: 'F+2 1', kind: 'normal', label: 'Abertura' },
  { notation: 'D B 3+EX', kind: 'special', label: 'Backstage Pass EX' },
  { notation: 'F+K', kind: 'kameo', label: 'Scorpion' },
];
const timeline = buildTimeline(steps);
const end = timeline.duration + timing.tail;

interface Click {
  sound: ClickSound;
  at: number;
}

function createEngine() {
  const clicks: Click[] = [];
  const engine = {
    /** Seconds, advanced by the test. */
    clock: 10,
    running: true,
    now: () => engine.clock,
    unlock: vi.fn(),
    click: vi.fn((sound: ClickSound, at: number) => {
      clicks.push({ sound, at });
    }),
    cancelScheduled: vi.fn(),
  };
  return { engine, clicks };
}

let frames = new Map<number, FrameRequestCallback>();
let nextFrame = 1;

beforeEach(() => {
  frames = new Map();
  nextFrame = 1;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(nextFrame, callback);
    return nextFrame++;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup(options: Omit<PlaybackOptions, 'engine'> = {}) {
  const { engine, clicks } = createEngine();
  const host: ReactiveControllerHost = {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  };
  const playback = new PlaybackController(host, { ...options, engine });
  playback.load(timeline);

  /** Moves the engine clock forward and runs the pending animation frame. */
  const advance = (seconds: number) => {
    engine.clock += seconds;
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(engine.clock * 1000);
  };

  /** Advances in ~60 fps frames. */
  const run = (seconds: number) => {
    const frameCount = Math.round(seconds / 0.016);
    for (let index = 0; index < frameCount; index++) advance(0.016);
  };

  return { playback, engine, clicks, host, advance, run };
}

describe('PlaybackController', () => {
  it('starts stopped at the count-in and registers with its host', () => {
    const { playback, host } = setup();

    expect(host.addController).toHaveBeenCalledWith(playback);
    expect(playback.time).toBe(-playback.leadIn);
    expect(playback.phase).toBe('ready');
    expect(playback.playing).toBe(false);
  });

  it('advances proportionally to the speed', () => {
    const { playback, advance } = setup({ speed: 0.5 });
    const start = playback.time;

    playback.play();
    advance(1);

    expect(playback.time).toBeCloseTo(start + 500);
    expect(playback.playing).toBe(true);
  });

  it('keeps time continuous when the speed changes mid-run', () => {
    const { playback, advance } = setup();
    playback.play();
    advance(0.5);
    const before = playback.time;

    playback.setSpeed(0.5);
    advance(1);

    expect(playback.time).toBeCloseTo(before + 500);
  });

  it('schedules each input click exactly once, at its audio time', () => {
    const { playback, clicks, engine, run } = setup();
    const startClock = engine.clock;
    const startTime = playback.time;

    playback.play();
    run((end - startTime) / 1000 - 0.1);

    const inputClicks = clicks.filter((click) => click.sound !== 'beat' && click.sound !== 'downbeat');
    expect(inputClicks.map((click) => click.sound)).toEqual(
      timeline.inputs.map((input) => clickSoundFor(input.press)),
    );
    inputClicks.forEach((click, index) => {
      expect(click.at).toBeCloseTo(startClock + (timeline.inputs[index]!.time - startTime) / 1000);
    });
  });

  it('picks the click sound from the press', () => {
    expect(clickSoundFor(['F', 'K'])).toBe('kameo');
    expect(clickSoundFor(['3', 'EX'])).toBe('amplify');
    expect(clickSoundFor(['D'])).toBe('direction');
    expect(clickSoundFor(['F', '2'])).toBe('button');
  });

  it('skips input clicks when they are off', () => {
    const { playback, clicks, run } = setup({ inputClicks: false });

    playback.play();
    run(2);

    expect(clicks).toEqual([]);
  });

  it('counts in on the metronome beats and lands the first input on the downbeat', () => {
    const { playback, clicks, engine, advance } = setup({ metronomeTempo: 120, inputClicks: false });
    const startClock = engine.clock;

    expect(playback.time).toBe(-1500);
    playback.play();
    expect(playback.phase).toBe('count-in');
    expect(playback.countIn).toBe(3);

    advance(0.5);
    expect(playback.countIn).toBe(2);
    advance(0.5);
    expect(playback.countIn).toBe(1);
    advance(0.5);
    expect(playback.countIn).toBeNull();
    expect(playback.phase).toBe('running');

    expect(clicks.slice(0, 4)).toEqual([
      { sound: 'beat', at: startClock },
      { sound: 'beat', at: startClock + 0.5 },
      { sound: 'beat', at: startClock + 1 },
      { sound: 'downbeat', at: startClock + 1.5 },
    ]);
  });

  it('halves the heard tempo at 0.5x', () => {
    const { playback, clicks, engine, run } = setup({ metronomeTempo: 120, inputClicks: false, speed: 0.5 });
    const startClock = engine.clock;

    playback.play();
    run(3.2);

    expect(clicks.slice(0, 3).map((click) => click.at - startClock)).toEqual([0, 1, 2]);
  });

  it('stretches the count-in when the metronome changes while stopped', () => {
    const { playback } = setup();

    playback.setMetronomeTempo(90);
    expect(playback.time).toBe(-2000);

    playback.setMetronomeTempo(null);
    expect(playback.time).toBe(-1200);
  });

  it('stops at the end without loop', () => {
    const { playback, run } = setup();

    playback.play();
    run((end + playback.leadIn) / 1000 + 0.2);

    expect(playback.playing).toBe(false);
    expect(playback.ended).toBe(true);
    expect(playback.phase).toBe('ended');
    expect(playback.time).toBe(end);
    expect(frames.size).toBe(0);
  });

  it('plays from the count-in again after the end', () => {
    const { playback, run } = setup();
    playback.play();
    run((end + playback.leadIn) / 1000 + 0.2);

    playback.play();

    expect(playback.ended).toBe(false);
    expect(playback.time).toBe(-playback.leadIn);
  });

  it('loops back to the count-in and keeps playing', () => {
    const { playback, run } = setup({ loop: true });

    playback.play();
    run((end + playback.leadIn) / 1000 + 0.1);

    expect(playback.playing).toBe(true);
    expect(playback.ended).toBe(false);
    expect(playback.time).toBeLessThan(0);
    expect(playback.time).toBeGreaterThanOrEqual(-playback.leadIn);
  });

  it('seeks, drops queued clicks and schedules from the new time', () => {
    const { playback, engine, clicks, advance } = setup();
    const target = timeline.steps[1]!.start - 50;

    playback.play();
    engine.cancelScheduled.mockClear();
    playback.seek(target);
    advance(0.1);

    expect(engine.cancelScheduled).toHaveBeenCalled();
    expect(playback.time).toBeCloseTo(target + 100);
    // D, B and 3+EX of step 2; the opener before the seek point never sounds.
    expect(clicks.map((click) => click.sound)).toEqual(['direction', 'direction', 'amplify']);
  });

  it('pauses and resumes where it stopped', () => {
    const { playback, engine, advance } = setup();

    playback.play();
    advance(0.4);
    playback.pause();
    const paused = playback.time;
    engine.clock += 5;

    expect(engine.cancelScheduled).toHaveBeenCalled();
    expect(playback.resumable).toBe(true);
    expect(frames.size).toBe(0);

    playback.play();
    advance(0.1);
    expect(playback.time).toBeCloseTo(paused + 100);
  });

  it('re-anchors without jumping when audio starts after the click', () => {
    const { playback, engine, clicks, advance } = setup({ metronomeTempo: 120 });
    engine.running = false;

    playback.play();
    advance(0.02);
    const before = playback.time;
    expect(clicks).toEqual([]);

    engine.running = true;
    engine.clock = 500; // the audio clock reads a different number
    advance(0);
    expect(playback.time).toBe(before);
    expect(clicks[0]).toEqual({ sound: 'beat', at: 500 + (-1500 - before) / 1000 });

    advance(0.1);
    expect(playback.time).toBeCloseTo(before + 100);
  });

  it('stops the frame loop and audio when the host disconnects', () => {
    const { playback, engine } = setup();

    playback.play();
    playback.hostDisconnected();

    expect(playback.playing).toBe(false);
    expect(frames.size).toBe(0);
    expect(engine.cancelScheduled).toHaveBeenCalled();
  });

  it('restarts from the count-in while playing', () => {
    const { playback, advance } = setup();

    playback.play();
    advance(1.5);
    playback.restart();

    expect(playback.time).toBe(-playback.leadIn);
    expect(playback.playing).toBe(true);
  });
});
