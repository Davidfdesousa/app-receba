import { describe, expect, it } from 'vitest';

import type { Combo } from './combo.types.ts';
import {
  comboListSummary,
  comboMeterBars,
  formatMeterBars,
  formatSeconds,
  stepNote,
} from './combo-summary.ts';

const combo: Combo = {
  id: 'test',
  category: 'combo',
  group: '1 barra',
  title: 'Teste',
  damage: 384,
  hits: 18,
  steps: [
    { notation: 'F+2 1', kind: 'normal', label: 'Abertura' },
    { notation: 'D B 3+EX', kind: 'special', label: 'Backstage Pass EX', swapsSide: true },
  ],
};

describe('combo summary', () => {
  it('counts the bars of meter across steps', () => {
    expect(comboMeterBars(combo)).toBe(1);
    expect([0, 1, 2].map(formatMeterBars)).toEqual(['sem barra', '1 barra', '2 barras']);
  });

  it('summarises combos with damage, hits and bars, and pieces with their description', () => {
    expect(comboListSummary(combo)).toBe('384 de dano, 18 golpes, 1 barra');
    expect(comboListSummary({ ...combo, category: 'piece', description: 'Abre quase todos os combos' })).toBe(
      'Abre quase todos os combos',
    );
  });

  it('formats durations in seconds with a decimal comma', () => {
    expect(formatSeconds(2350)).toBe('2,4');
    expect(formatSeconds(0)).toBe('0,0');
  });

  it('builds the step note from the written note, holds and side swaps', () => {
    expect(stepNote(combo.steps[0]!)).toBe('');
    expect(stepNote(combo.steps[1]!)).toBe('Troca de lado');
    expect(stepNote({ ...combo.steps[0]!, holds: true })).toBe('Segure o botão');
    expect(stepNote({ ...combo.steps[1]!, holds: true, note: 'Segure [3] e aperte [TH]' })).toBe(
      'Segure [3] e aperte [TH] · Troca de lado',
    );
  });
});
