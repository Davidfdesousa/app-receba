import { describe, expect, it } from 'vitest';

import { duoId, idealKameoId, kameoOptions, resolveDuo } from './roster.ts';
import type { DuoId, Roster } from './roster.types.ts';

const roster: Roster = {
  kameos: [
    { id: 'sareena', name: 'Sareena' },
    { id: 'ferra', name: 'Ferra' },
    { id: 'stryker', name: 'Stryker' },
    { id: 'cyrax', name: 'Cyrax' },
    { id: 'jax', name: 'Jax' },
  ],
  fighters: [
    {
      id: 'scorpion',
      name: 'Scorpion',
      communityUrl: 'https://example.com/scorpion',
      picks: [
        { kameoId: 'sareena', reason: 'A mais usada' },
        { kameoId: 'ferra', reason: 'Dano alto' },
      ],
    },
    { id: 'smoke', name: 'Smoke', communityUrl: 'https://example.com/smoke', picks: [] },
  ],
  sources: [],
};
const scorpion = roster.fighters[0]!;
const fallback = { fighterId: 'scorpion', kameoId: 'sareena' };

describe('roster rules', () => {
  it('builds duo ids from fighter and Kameo', () => {
    expect(duoId('scorpion', 'sareena')).toBe('scorpion+sareena');
  });

  it('takes the first pick as the ideal partner', () => {
    expect(idealKameoId(scorpion)).toBe('sareena');
    expect(idealKameoId(roster.fighters[1]!)).toBeUndefined();
  });

  it('offers the picks in order, then other Kameos with combos by name', () => {
    const available = new Set<DuoId>(['scorpion+ferra', 'scorpion+jax', 'scorpion+cyrax']);
    const options = kameoOptions(roster, scorpion, available);

    expect(options.map((option) => [option.kameo.id, option.rank, option.available])).toEqual([
      ['sareena', 1, false],
      ['ferra', 2, true],
      ['cyrax', null, true],
      ['jax', null, true],
    ]);
  });

  it('keeps a valid selection and repairs a broken one', () => {
    expect(resolveDuo(roster, { fighterId: 'scorpion', kameoId: 'stryker' }, fallback)).toEqual({
      fighterId: 'scorpion',
      kameoId: 'stryker',
    });
    expect(resolveDuo(roster, { fighterId: 'scorpion', kameoId: 'nobody' }, fallback)).toEqual(fallback);
    expect(resolveDuo(roster, { fighterId: 'scorpion' }, fallback)).toEqual(fallback);
    expect(resolveDuo(roster, { fighterId: 'nobody', kameoId: 'ferra' }, fallback)).toBe(fallback);
    expect(resolveDuo(roster, null, fallback)).toBe(fallback);
    // A fighter without picks and without a Kameo cannot be completed.
    expect(resolveDuo(roster, { fighterId: 'smoke' }, fallback)).toBe(fallback);
  });
});
