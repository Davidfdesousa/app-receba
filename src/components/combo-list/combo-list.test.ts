import { describe, expect, it, vi } from 'vitest';

import { ghostfaceScorpion } from '../../data/ghostface-scorpion.ts';
import type { AppComboList, ComboSelectDetail } from './combo-list.ts';
import './combo-list.ts';

async function mountList(selectedId: string): Promise<AppComboList> {
  const element = document.createElement('app-combo-list');
  element.combos = ghostfaceScorpion.combos;
  element.selectedId = selectedId;
  document.body.append(element);
  await element.updateComplete;
  return element;
}

function items(list: AppComboList): HTMLButtonElement[] {
  return [...(list.shadowRoot?.querySelectorAll<HTMLButtonElement>('.item') ?? [])];
}

describe('app-combo-list', () => {
  it('opens the tab of the selected combo, grouped, with the stats summary', async () => {
    const list = await mountList('combo-469');
    const selected = items(list).find((item) => item.getAttribute('aria-current') === 'true');

    expect(items(list)).toHaveLength(6);
    expect(list.shadowRoot?.querySelectorAll('.group-title')).toHaveLength(3);
    expect(selected?.querySelector('.summary')?.textContent).toBe('384 de dano, 18 golpes, 1 barra');
  });

  it('lists pieces with their description in the other tab', async () => {
    const list = await mountList('piece-opener');
    const tab = list.shadowRoot?.querySelector('[aria-selected="true"]');

    expect(tab?.textContent.trim()).toBe('Peças');
    expect(items(list)).toHaveLength(9);
    expect(items(list)[0]?.querySelector('.summary')?.textContent).toBe('Abre quase todos os combos');
  });

  it('fires combo-select with the combo id', async () => {
    const list = await mountList('combo-469');
    const listener = vi.fn<(detail: ComboSelectDetail) => void>();
    list.addEventListener('combo-select', (event) => {
      listener(event.detail);
    });

    items(list)[0]?.click();

    expect(listener).toHaveBeenCalledWith({ comboId: 'combo-338' });
  });
});
