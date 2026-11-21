import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { describe, expect, it, vi } from 'vitest';

import type { ComboSetLoader } from '../data/combo-sets/index.ts';
import type { ComboSet } from '../lib/combo/combo.types.ts';
import { duoStorageKey } from '../lib/preferences.ts';
import type { DuoId, Roster } from '../lib/roster/roster.types.ts';
import { DuoController } from './duo.controller.ts';

const roster: Roster = {
  kameos: [
    { id: 'scorpion', name: 'Scorpion' },
    { id: 'sareena', name: 'Sareena' },
    { id: 'ferra', name: 'Ferra' },
  ],
  fighters: [
    {
      id: 'ghostface',
      name: 'Ghostface',
      communityUrl: 'https://example.com/ghostface',
      picks: [{ kameoId: 'scorpion', reason: 'Mais combos' }],
    },
    {
      id: 'scorpion',
      name: 'Scorpion',
      communityUrl: 'https://example.com/scorpion',
      picks: [
        { kameoId: 'sareena', reason: 'A mais usada' },
        { kameoId: 'ferra', reason: 'Dano alto' },
      ],
    },
  ],
  sources: [],
};

const fakeSet = (id: string): ComboSet => ({ id, game: 'MK1', fighter: '', kameo: '', combos: [] });

function setup(saved?: unknown, loaders?: Partial<Record<DuoId, ComboSetLoader>>) {
  if (saved !== undefined) localStorage.setItem(duoStorageKey, JSON.stringify(saved));

  const controllers: ReactiveController[] = [];
  const host = {
    addController: (controller: ReactiveController) => controllers.push(controller),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  } satisfies ReactiveControllerHost;

  const duo = new DuoController(host, {
    roster,
    loaders: {
      'ghostface+scorpion': () => Promise.resolve(fakeSet('ghostface-scorpion')),
      'scorpion+sareena': () => Promise.resolve(fakeSet('scorpion-sareena')),
      ...loaders,
    },
    fallback: { fighterId: 'ghostface', kameoId: 'scorpion' },
  });
  for (const controller of controllers) controller.hostConnected?.();
  return { duo, host };
}

describe('DuoController', () => {
  it('starts on the fallback duo and loads its combos', async () => {
    const { duo, host } = setup();
    expect(duo.status).toBe('loading');

    await duo.settled;

    expect(duo.selection).toEqual({ fighterId: 'ghostface', kameoId: 'scorpion' });
    expect(duo.status).toBe('ready');
    expect(duo.comboSet?.id).toBe('ghostface-scorpion');
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  it('restores the saved duo', async () => {
    const { duo } = setup({ fighterId: 'scorpion', kameoId: 'sareena' });
    await duo.settled;

    expect(duo.fighter?.name).toBe('Scorpion');
    expect(duo.kameo?.name).toBe('Sareena');
    expect(duo.comboSet?.id).toBe('scorpion-sareena');
  });

  it('ignores a saved duo that is not in the roster', () => {
    const { duo } = setup({ fighterId: 'goro', kameoId: 'sareena' });
    expect(duo.selection).toEqual({ fighterId: 'ghostface', kameoId: 'scorpion' });
  });

  it('remembers a new pick and reports duos without combos as missing', async () => {
    const { duo } = setup();
    await duo.settled;

    duo.select({ fighterId: 'scorpion', kameoId: 'ferra' });
    await duo.settled;

    expect(duo.status).toBe('missing');
    expect(duo.comboSet).toBeNull();
    expect(JSON.parse(localStorage.getItem(duoStorageKey) ?? 'null')).toEqual({
      fighterId: 'scorpion',
      kameoId: 'ferra',
    });
  });

  it('keeps only the latest pick when loads finish out of order', async () => {
    let resolveSlow: (set: ComboSet) => void = () => undefined;
    const slow = new Promise<ComboSet>((resolve) => {
      resolveSlow = resolve;
    });
    const { duo } = setup(undefined, { 'scorpion+sareena': () => slow });
    await duo.settled;

    duo.select({ fighterId: 'scorpion', kameoId: 'sareena' });
    duo.select({ fighterId: 'ghostface', kameoId: 'scorpion' });
    await duo.settled;
    resolveSlow(fakeSet('late'));
    await slow;

    expect(duo.comboSet?.id).toBe('ghostface-scorpion');
    expect(duo.status).toBe('ready');
  });

  it('reports a failed load as an error', async () => {
    const { duo } = setup(undefined, {
      'scorpion+sareena': () => Promise.reject(new Error('offline')),
    });
    await duo.settled;

    duo.select({ fighterId: 'scorpion', kameoId: 'sareena' });
    await duo.settled;

    expect(duo.status).toBe('error');
  });
});
