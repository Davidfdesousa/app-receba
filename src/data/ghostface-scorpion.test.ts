import { describe, expect, it } from 'vitest';

import { parseNotation } from '../lib/combo/notation.ts';
import { inlineNotations } from '../lib/combo/rich-text.ts';
import { buildTimeline } from '../lib/combo/timeline.ts';
import { ghostfaceScorpion } from './ghostface-scorpion.ts';

const { combos } = ghostfaceScorpion;

describe('ghostfaceScorpion', () => {
  it('has unique ids', () => {
    expect(new Set(combos.map((combo) => combo.id)).size).toBe(combos.length);
  });

  it('opens on an existing combo by default', () => {
    expect(combos.some((combo) => combo.id === ghostfaceScorpion.defaultComboId)).toBe(true);
  });

  it.each(combos.map((combo) => [combo.id, combo] as const))(
    '%s uses valid notation everywhere',
    (_, combo) => {
      const texts = [combo.title, ...combo.steps.flatMap((step) => [step.label, step.note ?? ''])];

      for (const step of combo.steps) expect(() => parseNotation(step.notation)).not.toThrow();
      for (const notation of texts.flatMap(inlineNotations))
        expect(() => parseNotation(notation)).not.toThrow();
      expect(buildTimeline(combo.steps).duration).toBeGreaterThanOrEqual(0);
    },
  );

  it('credits the source of every full combo', () => {
    for (const combo of combos.filter((item) => item.category === 'combo')) {
      expect(combo.source?.author).toBeTruthy();
      expect(combo.damage).toBeGreaterThan(0);
    }
  });
});
