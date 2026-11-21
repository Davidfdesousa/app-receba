import { afterEach, describe, expect, it, vi } from 'vitest';

import { appConfig } from '../config/app.config.ts';
import { availableDuos } from '../data/combo-sets/index.ts';
import { roster } from '../data/roster.ts';
import type { AppTrainerPage } from './trainer-page.ts';
import './trainer-page.ts';

async function mountPage(): Promise<AppTrainerPage> {
  const page = document.createElement('app-trainer-page');
  page.roster = roster;
  page.selection = { fighterId: 'ghostface', kameoId: 'scorpion' };
  page.availableDuos = availableDuos;
  page.status = 'missing';
  document.body.append(page);
  await page.updateComplete;
  return page;
}

const scrollIntoView = vi.fn();

afterEach(() => {
  scrollIntoView.mockReset();
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
});

describe('app-trainer-page', () => {
  it('credits the author right under the pitch, linking to their profile', async () => {
    const page = await mountPage();
    page.author = appConfig.author;
    await page.updateComplete;
    const credit = page.shadowRoot?.querySelector('.hero .credit');
    const link = credit?.querySelector('a');

    expect(credit?.previousElementSibling?.classList.contains('lede')).toBe(true);
    expect(credit?.textContent).toContain('Desenvolvido por');
    expect(link?.getAttribute('href')).toBe('https://www.linkedin.com/in/davidfdesousa/');
    expect(link?.textContent).toContain('David Ferreira');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });

  it('brings the duo title to the top once the player picks a duo', async () => {
    Object.defineProperty(Element.prototype, 'scrollIntoView', { value: scrollIntoView, configurable: true });
    const page = await mountPage();
    const picker = page.shadowRoot?.querySelector('app-duo-picker');

    picker?.dispatchEvent(
      new CustomEvent('duo-change', {
        detail: { fighterId: 'scorpion', kameoId: 'sareena' },
        bubbles: true,
        composed: true,
      }),
    );
    page.selection = { fighterId: 'scorpion', kameoId: 'sareena' };
    await page.updateComplete;

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(page.shadowRoot?.querySelector('.duo'));
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }));
  });

  it('does not move the page when the duo changes without a pick (first load, restore)', async () => {
    Object.defineProperty(Element.prototype, 'scrollIntoView', { value: scrollIntoView, configurable: true });
    const page = await mountPage();

    page.selection = { fighterId: 'raiden', kameoId: 'jax' };
    await page.updateComplete;

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
