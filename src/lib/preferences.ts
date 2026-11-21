import { isMetronomeTempo, type MetronomeTempo } from './audio/metronome.ts';
import type { DuoSelection } from './roster/roster.types.ts';

export const playbackSpeeds = [0.5, 0.75, 1] as const;
export type PlaybackSpeed = (typeof playbackSpeeds)[number];

export interface TrainerPreferences {
  /** Last combo opened, or null to use the set's default. */
  comboId: string | null;
  speed: PlaybackSpeed;
  loop: boolean;
  /** A click on every input, in time with the lane. */
  inputClicks: boolean;
  /** Metronome tempo, or null when the metronome is off. */
  metronomeTempo: MetronomeTempo | null;
}

export const trainerStorageKey = 'app:trainer';

export const defaultTrainerPreferences: Readonly<TrainerPreferences> = {
  comboId: null,
  speed: 1,
  loop: false,
  inputClicks: true,
  metronomeTempo: null,
};

export function isPlaybackSpeed(value: unknown): value is PlaybackSpeed {
  return (playbackSpeeds as readonly unknown[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reads the saved preferences, falling back to the default for every missing or invalid field. */
export function readTrainerPreferences(storage: Pick<Storage, 'getItem'> = localStorage): TrainerPreferences {
  const defaults = { ...defaultTrainerPreferences };

  let saved: unknown;
  try {
    const raw = storage.getItem(trainerStorageKey);
    if (raw === null) return defaults;
    saved = JSON.parse(raw);
  } catch {
    return defaults;
  }

  if (!isRecord(saved)) return defaults;

  return {
    comboId: typeof saved.comboId === 'string' && saved.comboId ? saved.comboId : defaults.comboId,
    speed: isPlaybackSpeed(saved.speed) ? saved.speed : defaults.speed,
    loop: typeof saved.loop === 'boolean' ? saved.loop : defaults.loop,
    inputClicks: typeof saved.inputClicks === 'boolean' ? saved.inputClicks : defaults.inputClicks,
    metronomeTempo:
      saved.metronomeTempo === null || isMetronomeTempo(saved.metronomeTempo)
        ? saved.metronomeTempo
        : defaults.metronomeTempo,
  };
}

export function storeTrainerPreferences(
  preferences: TrainerPreferences,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  try {
    storage.setItem(trainerStorageKey, JSON.stringify(preferences));
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Preferences still apply for this visit.
  }
}

export const duoStorageKey = 'app:duo';

/** The last duo picked, unvalidated against the roster (see `resolveDuo`), or null. */
export function readDuoPreference(
  storage: Pick<Storage, 'getItem'> = localStorage,
): Partial<DuoSelection> | null {
  let saved: unknown;
  try {
    const raw = storage.getItem(duoStorageKey);
    if (raw === null) return null;
    saved = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(saved)) return null;
  const pick = (value: unknown) => (typeof value === 'string' && value ? value : undefined);
  const fighterId = pick(saved.fighterId);
  const kameoId = pick(saved.kameoId);

  return {
    ...(fighterId === undefined ? {} : { fighterId }),
    ...(kameoId === undefined ? {} : { kameoId }),
  };
}

export function storeDuoPreference(
  selection: DuoSelection,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  try {
    storage.setItem(duoStorageKey, JSON.stringify(selection));
  } catch {
    // Storage can be unavailable. The duo still applies for this visit.
  }
}
