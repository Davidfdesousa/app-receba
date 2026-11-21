import { describe, expect, it } from 'vitest';

import {
  defaultTrainerPreferences,
  duoStorageKey,
  readDuoPreference,
  readTrainerPreferences,
  storeDuoPreference,
  storeTrainerPreferences,
  trainerStorageKey,
  type TrainerPreferences,
} from './preferences.ts';

describe('trainer preferences', () => {
  it('starts with clicks on, metronome off and full speed', () => {
    expect(readTrainerPreferences()).toEqual({
      comboId: null,
      speed: 1,
      loop: false,
      inputClicks: true,
      metronomeTempo: null,
    });
  });

  it('persists and reads back every field', () => {
    const preferences: TrainerPreferences = {
      comboId: 'combo-469',
      speed: 0.5,
      loop: true,
      inputClicks: false,
      metronomeTempo: 120,
    };

    storeTrainerPreferences(preferences);

    expect(JSON.parse(localStorage.getItem(trainerStorageKey) ?? '')).toEqual(preferences);
    expect(readTrainerPreferences()).toEqual(preferences);
  });

  it('replaces each invalid field with its default and keeps the valid ones', () => {
    localStorage.setItem(
      trainerStorageKey,
      JSON.stringify({ comboId: 42, speed: 2, loop: 'yes', inputClicks: false, metronomeTempo: 100 }),
    );

    expect(readTrainerPreferences()).toEqual({ ...defaultTrainerPreferences, inputClicks: false });
  });

  it('ignores corrupt or non-object values', () => {
    localStorage.setItem(trainerStorageKey, '{not json');
    expect(readTrainerPreferences()).toEqual(defaultTrainerPreferences);

    localStorage.setItem(trainerStorageKey, '[1, 2]');
    expect(readTrainerPreferences()).toEqual(defaultTrainerPreferences);
  });

  it('survives unavailable storage', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(readTrainerPreferences(blocked)).toEqual(defaultTrainerPreferences);
    expect(() => {
      storeTrainerPreferences(defaultTrainerPreferences, blocked);
    }).not.toThrow();
  });
});

describe('duo preference', () => {
  it('is empty until a duo is picked, then reads back', () => {
    expect(readDuoPreference()).toBeNull();

    storeDuoPreference({ fighterId: 'scorpion', kameoId: 'sareena' });

    expect(readDuoPreference()).toEqual({ fighterId: 'scorpion', kameoId: 'sareena' });
  });

  it('keeps only valid string fields and survives corrupt data', () => {
    localStorage.setItem(duoStorageKey, JSON.stringify({ fighterId: 'scorpion', kameoId: 7 }));
    expect(readDuoPreference()).toEqual({ fighterId: 'scorpion' });

    localStorage.setItem(duoStorageKey, '{not json');
    expect(readDuoPreference()).toBeNull();
  });
});
