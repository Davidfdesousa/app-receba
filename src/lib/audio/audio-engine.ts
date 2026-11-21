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

/** Audio Session API (Safari 16.4+), not in the TypeScript DOM types yet. */
interface AudioSessionNavigator {
  audioSession?: { type: string };
}

/**
 * iOS treats Web Audio as "ambient" sound by default, so the ring/silent switch mutes it
 * even with the volume up. Declaring a playback session makes the clicks play like media.
 * Returns false where the API does not exist.
 */
export function preferPlaybackSession(
  scope: AudioSessionNavigator = navigator as Navigator & AudioSessionNavigator,
): boolean {
  const session = scope.audioSession;
  if (!session) return false;
  try {
    session.type = 'playback';
    return true;
  } catch {
    return false;
  }
}

/** iPhone, iPod, or iPad (which reports itself as a Mac with touch). */
export function isAppleTouchDevice(
  scope: Pick<Navigator, 'userAgent' | 'maxTouchPoints'> = navigator,
): boolean {
  return (
    /iPad|iPhone|iPod/.test(scope.userAgent) ||
    (scope.userAgent.includes('Macintosh') && scope.maxTouchPoints > 1)
  );
}

/** Half a second of 8-bit silence as a WAV file. */
export function silentWav(seconds = 0.5, sampleRate = 8000): Blob {
  const samples = Math.round(seconds * sampleRate);
  const buffer = new ArrayBuffer(44 + samples);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index));
  };

  text(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  text(36, 'data');
  view.setUint32(40, samples, true);
  new Uint8Array(buffer, 44).fill(128); // 8-bit silence sits at the midpoint

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Small Web Audio wrapper. It is also the playback clock: when audio is running,
 * visuals and clicks read the same `currentTime`, so what you see and hear stay in sync.
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private bus: GainNode | null = null;
  private primed = false;
  /** Older iOS without the Audio Session API: a silent media element keeps Web Audio audible. */
  private keepAlive: HTMLAudioElement | null = null;

  /**
   * Must be called from a user gesture (click) — browsers block audio otherwise.
   * Everything here runs synchronously inside that gesture, which iOS requires.
   */
  unlock(): void {
    const hasSession = preferPlaybackSession();

    if (!this.context) {
      const Context = getAudioContextConstructor();
      if (!Context) return;
      try {
        this.context = new Context();
      } catch {
        return;
      }
    }

    const context = this.context;
    // iOS also uses a non-standard "interrupted" state (after a call, or coming back to
    // the tab), so anything but running or closed gets resumed.
    const state = context.state as string;
    if (state !== 'running' && state !== 'closed') void context.resume().catch(() => undefined);

    this.prime(context);
    if (!hasSession && isAppleTouchDevice()) this.startKeepAlive();
  }

  /** Plays one silent sample during the gesture: some iOS versions only unlock on real output. */
  private prime(context: AudioContext): void {
    if (this.primed) return;
    try {
      const source = context.createBufferSource();
      source.buffer = context.createBuffer(1, 1, context.sampleRate);
      source.connect(context.destination);
      source.start(0);
      this.primed = true;
    } catch {
      // Priming is best effort; resume() alone works on most browsers.
    }
  }

  private startKeepAlive(): void {
    if (typeof Audio === 'undefined' || typeof URL.createObjectURL !== 'function') return;

    if (!this.keepAlive) {
      const element = new Audio();
      element.loop = true;
      element.preload = 'auto';
      element.setAttribute('playsinline', '');
      element.setAttribute('x-webkit-airplay', 'deny');
      element.src = URL.createObjectURL(silentWav());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) element.pause();
      });
      this.keepAlive = element;
    }

    void this.keepAlive.play().catch(() => undefined);
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
