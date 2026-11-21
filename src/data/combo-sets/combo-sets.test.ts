import { describe, expect, it } from 'vitest';

import { formatMeterBars, comboMeterBars } from '../../lib/combo/combo-summary.ts';
import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { parseNotation } from '../../lib/combo/notation.ts';
import { inlineNotations } from '../../lib/combo/rich-text.ts';
import { buildTimeline } from '../../lib/combo/timeline.ts';
import { findFighter, findKameo } from '../../lib/roster/roster.ts';
import type { DuoId } from '../../lib/roster/roster.types.ts';
import { roster } from '../roster.ts';
import { comboSetLoaders } from './index.ts';

const entries = Object.entries(comboSetLoaders) as [DuoId, (typeof comboSetLoaders)[DuoId]][];
const sets: [DuoId, ComboSet][] = await Promise.all(
  entries.map(async ([id, load]) => [id, await load()] as [DuoId, ComboSet]),
);

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

describe('combo sets', () => {
  it('gives every combo an id unique across all sets (saved choices never collide)', () => {
    const ids = sets.flatMap(([, set]) => set.combos.map((combo) => combo.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(sets)('%s', (duo, set) => {
    it('matches the fighter and Kameo of its key in the roster', () => {
      const [fighterId = '', kameoId = ''] = duo.split('+');
      expect(findFighter(roster, fighterId)?.name).toBe(set.fighter);
      expect(findKameo(roster, kameoId)?.name).toBe(set.kameo);
    });

    it('has combos, and a default that exists', () => {
      expect(set.combos.some((combo) => combo.category === 'combo')).toBe(true);
      if (set.defaultComboId) {
        expect(set.combos.some((combo) => combo.id === set.defaultComboId)).toBe(true);
      }
    });

    it.each(set.combos.map((combo) => [combo.id, combo] as const))(
      '%s uses valid notation everywhere',
      (_, combo) => {
        const texts = [combo.title, ...combo.steps.flatMap((step) => [step.label, step.note ?? ''])];

        expect(combo.steps.length).toBeGreaterThan(0);
        for (const step of combo.steps) expect(() => parseNotation(step.notation)).not.toThrow();
        for (const notation of texts.flatMap(inlineNotations))
          expect(() => parseNotation(notation)).not.toThrow();
        expect(buildTimeline(combo.steps).duration).toBeGreaterThanOrEqual(0);
      },
    );

    it('credits every full combo and files it under its bars of meter', () => {
      for (const combo of set.combos.filter((item) => item.category === 'combo')) {
        expect(combo.source?.author).toBeTruthy();
        expect(combo.source?.url).toMatch(/^https:\/\//);
        if (combo.damage !== undefined) expect(combo.damage).toBeGreaterThan(0);
        expect(combo.group).toBe(capitalize(formatMeterBars(comboMeterBars(combo))));
      }
    });

    it('calls the Kameo by name in Kameo steps', () => {
      for (const step of set.combos.flatMap((combo) => combo.steps)) {
        if (step.kind === 'kameo') expect(step.label).toContain(set.kameo);
      }
    });
  });
});
