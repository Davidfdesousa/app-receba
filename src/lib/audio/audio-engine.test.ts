import { afterEach, describe, expect, it, vi } from 'vitest';

import { AudioEngine, isAppleTouchDevice, preferPlaybackSession, silentWav } from './audio-engine.ts';

/** Just enough of AudioContext for unlock(). */
class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state = 'suspended';
  sampleRate = 48000;
  currentTime = 0;
  destination = {};
  resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });
  started = 0;

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createBuffer() {
    return {};
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: () => undefined,
      start: () => {
        this.started++;
      },
    };
  }
}

function installContext(): void {
  FakeAudioContext.instances = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'audioSession');
});

describe('AudioEngine.unlock', () => {
  it('creates the context in the gesture, resumes it and primes one silent sample', async () => {
    installContext();
    const engine = new AudioEngine();

    engine.unlock();
    engine.unlock();
    await Promise.resolve();

    const [context] = FakeAudioContext.instances;
    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(context?.resume).toHaveBeenCalledTimes(1);
    expect(context?.started).toBe(1);
    expect(engine.running).toBe(true);
  });

  it('resumes a context iOS left "interrupted"', () => {
    installContext();
    const engine = new AudioEngine();
    engine.unlock();
    const context = FakeAudioContext.instances[0]!;

    context.state = 'interrupted';
    engine.unlock();

    expect(context.resume).toHaveBeenCalledTimes(2);
  });

  it('asks for a playback audio session, so the silent switch does not mute the clicks', () => {
    installContext();
    const session = { type: 'auto' };
    Object.defineProperty(navigator, 'audioSession', { value: session, configurable: true });

    new AudioEngine().unlock();

    expect(session.type).toBe('playback');
  });
});

describe('audio helpers', () => {
  it('sets the session type only where the API exists', () => {
    expect(preferPlaybackSession({})).toBe(false);
    const scope = { audioSession: { type: 'auto' } };
    expect(preferPlaybackSession(scope)).toBe(true);
    expect(scope.audioSession.type).toBe('playback');
  });

  it('recognises iPhones and iPads (which report a Mac with touch)', () => {
    expect(
      isAppleTouchDevice({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', maxTouchPoints: 5 }),
    ).toBe(true);
    expect(
      isAppleTouchDevice({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', maxTouchPoints: 5 }),
    ).toBe(true);
    expect(
      isAppleTouchDevice({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', maxTouchPoints: 0 }),
    ).toBe(false);
    expect(isAppleTouchDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 15)', maxTouchPoints: 5 })).toBe(
      false,
    );
  });

  it('builds a valid silent WAV', async () => {
    const wav = silentWav(0.5, 8000);
    const bytes = new Uint8Array(await wav.arrayBuffer());

    expect(wav.type).toBe('audio/wav');
    expect(bytes).toHaveLength(44 + 4000);
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe('WAVE');
    expect(bytes[44]).toBe(128);
  });
});
