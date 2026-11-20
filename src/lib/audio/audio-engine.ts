export type ClickSound = 'downbeat' | 'beat' | 'direction' | 'button' | 'kameo' | 'amplify';

interface Voice {
  frequency: number;
  type: OscillatorType;
  gain: number;
  length: number;
}

const voices: Record<ClickSound, Voice> = {
  downbeat: { frequency: 1568, type: 'square', gain: 0.09, length: 0.05 },
  beat: { frequency: 1046, type: 'square', gain: 0.055, length: 0.035 },
  direction: { frequency: 330, type: 'triangle', gain: 0.07, length: 0.04 },
  button: { frequency: 740, type: 'triangle', gain: 0.14, length: 0.08 },
  kameo: { frequency: 988, type: 'triangle', gain: 0.15, length: 0.09 },
  amplify: { frequency: 523, type: 'sawtooth', gain: 0.06, length: 0.09 },
};

type AudioContextConstructor = typeof AudioContext;

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  // Older Safari only exposes the prefixed constructor; tests run without either.
  const scope = globalThis as unknown as {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return scope.AudioContext ?? scope.webkitAudioContext;
}

/**
 * Small Web Audio wrapper. It is also the playback clock: when audio is running,
 * visuals and clicks read the same `currentTime`, so what you see and hear stay in sync.
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private bus: GainNode | null = null;

  /** Must be called from a user gesture (click) — browsers block audio otherwise. */
  unlock(): void {
    if (!this.context) {
      const Context = getAudioContextConstructor();
      if (!Context) return;
      try {
        this.context = new Context();
      } catch {
        return;
      }
    }

    if (this.context.state === 'suspended') void this.context.resume().catch(() => undefined);
  }

  get running(): boolean {
    return this.context?.state === 'running';
  }

  /** Seconds on the shared clock: audio time when available, otherwise the page clock. */
  now(): number {
    return this.running && this.context ? this.context.currentTime : performance.now() / 1000;
  }

  /** Plays a click at `at` seconds on the audio clock. No-op while audio is unavailable. */
  click(sound: ClickSound, at: number): void {
    const context = this.context;
    if (!context || !this.running) return;

    this.bus ??= this.createBus(context);
    const voice = voices[sound];
    const start = Math.max(at, context.currentTime);
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.type = voice.type;
    oscillator.frequency.value = voice.frequency;
    envelope.gain.setValueAtTime(voice.gain, start);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + voice.length);
    oscillator.connect(envelope).connect(this.bus);
    oscillator.start(start);
    oscillator.stop(start + voice.length + 0.02);
  }

  /** Silences clicks already scheduled ahead (on pause, seek or speed change). */
  cancelScheduled(): void {
    this.bus?.disconnect();
    this.bus = null;
  }

  private createBus(context: AudioContext): GainNode {
    const bus = context.createGain();
    bus.connect(context.destination);
    return bus;
  }
}
