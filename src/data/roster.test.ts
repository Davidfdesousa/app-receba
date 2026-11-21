import { describe, expect, it } from 'vitest';

import { parseNotation } from '../lib/combo/notation.ts';
import { inlineNotations } from '../lib/combo/rich-text.ts';
import { duoId, findFighter, findKameo } from '../lib/roster/roster.ts';
import { availableDuos } from './combo-sets/index.ts';
import { defaultDuo, roster } from './roster.ts';

const { fighters, kameos } = roster;

describe('roster', () => {
  it('has unique slug ids', () => {
    for (const list of [fighters, kameos]) {
      const ids = list.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(fighters.map((fighter) => [fighter.name, fighter] as const))(
    '%s has ranked picks of real, distinct Kameos with a reason',
    (_, fighter) => {
      const kameoIds = fighter.picks.map((pick) => pick.kameoId);

      expect(fighter.picks.length).toBeGreaterThanOrEqual(1);
      expect(new Set(kameoIds).size).toBe(kameoIds.length);
      expect(fighter.communityUrl).toMatch(/^https:\/\//);
      for (const pick of fighter.picks) {
        expect(findKameo(roster, pick.kameoId)).toBeDefined();
        expect(pick.reason.length).toBeGreaterThan(20);
        for (const notation of inlineNotations(pick.reason))
          expect(() => parseNotation(notation)).not.toThrow();
      }
    },
  );

  it('only registers combo sets for fighters and Kameos in the roster', () => {
    for (const duo of availableDuos) {
      const [fighterId = '', kameoId = ''] = duo.split('+');
      expect(findFighter(roster, fighterId), duo).toBeDefined();
      expect(findKameo(roster, kameoId), duo).toBeDefined();
    }
  });

  it('opens on a duo that has combos', () => {
    expect(availableDuos.has(duoId(defaultDuo.fighterId, defaultDuo.kameoId))).toBe(true);
  });

  it('lists its sources', () => {
    expect(roster.sources.length).toBeGreaterThan(0);
    for (const source of roster.sources) expect(source.url).toMatch(/^https:\/\//);
  });
});
