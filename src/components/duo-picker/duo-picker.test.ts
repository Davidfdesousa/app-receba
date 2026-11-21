import { describe, expect, it, vi } from 'vitest';

import type { DuoId, DuoSelection, Roster } from '../../lib/roster/roster.types.ts';
import type { AppDuoPicker } from './duo-picker.ts';
import './duo-picker.ts';

const roster: Roster = {
  kameos: [
    { id: 'scorpion', name: 'Scorpion' },
    { id: 'sareena', name: 'Sareena' },
    { id: 'ferra', name: 'Ferra' },
    { id: 'jax', name: 'Jax' },
  ],
  fighters: [
    {
      id: 'scorpion',
      name: 'Scorpion',
      communityUrl: 'https://example.com/scorpion',
      picks: [
        { kameoId: 'sareena', reason: 'A Kameo mais usada do online.' },
        { kameoId: 'ferra', reason: 'Dupla top tier em vídeos.' },
      ],
    },
    {
      id: 'ghostface',
      name: 'Ghostface',
      communityUrl: 'https://example.com/ghostface',
      picks: [{ kameoId: 'scorpion', reason: 'Disparado o mais usado.' }],
    },
  ],
  sources: [{ label: 'mk1kombo', url: 'https://example.com' }],
};

async function mountPicker(selection: DuoSelection, available: DuoId[] = ['scorpion+sareena']) {
  const element = document.createElement('app-duo-picker');
  element.roster = roster;
  element.selection = selection;
  element.availableDuos = new Set(available);
  document.body.append(element);
  await element.updateComplete;

  const changes = vi.fn<(detail: DuoSelection) => void>();
  element.addEventListener('duo-change', (event) => {
    changes(event.detail);
  });
  return { element, changes };
}

const select = (picker: AppDuoPicker, name: string) =>
  picker.shadowRoot?.querySelector<HTMLSelectElement>(`select[name='${name}']`);
const chips = (picker: AppDuoPicker) => [
  ...(picker.shadowRoot?.querySelectorAll<HTMLButtonElement>('.pick') ?? []),
];

describe('app-duo-picker', () => {
  it('shows the ideal Kameo, the ranked picks and the reason of the selected one', async () => {
    const { element } = await mountPicker({ fighterId: 'scorpion', kameoId: 'sareena' });
    const root = element.shadowRoot;

    expect(root?.querySelector('.advice-head strong')?.textContent).toBe('Sareena');
    expect(chips(element).map((chip) => chip.textContent.replace(/\s+/g, ' ').trim())).toEqual([
      '1º Sareena',
      '2º Ferra em breve',
    ]);
    expect(chips(element)[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(root?.querySelector('.reason app-notation-text')?.getAttribute('text')).toBe(
      'A Kameo mais usada do online.',
    );
    expect(select(element, 'kameo')?.value).toBe('sareena');
  });

  it('picking a fighter selects their ideal Kameo', async () => {
    const { element, changes } = await mountPicker({ fighterId: 'scorpion', kameoId: 'ferra' });
    const fighter = select(element, 'fighter');
    if (!fighter) throw new Error('fighter select not rendered');

    fighter.value = 'ghostface';
    fighter.dispatchEvent(new Event('change'));

    expect(changes).toHaveBeenCalledWith({ fighterId: 'ghostface', kameoId: 'scorpion' });
  });

  it('switches Kameo from the suggestions, ignoring the current one', async () => {
    const { element, changes } = await mountPicker({ fighterId: 'scorpion', kameoId: 'sareena' });

    chips(element)[0]?.click();
    chips(element)[1]?.click();

    expect(changes).toHaveBeenCalledTimes(1);
    expect(changes).toHaveBeenCalledWith({ fighterId: 'scorpion', kameoId: 'ferra' });
  });

  it('keeps a Kameo outside the suggestions selected and points to the ideal one', async () => {
    const { element } = await mountPicker({ fighterId: 'scorpion', kameoId: 'jax' });

    expect(select(element, 'kameo')?.value).toBe('jax');
    expect(element.shadowRoot?.querySelector('.reason')?.textContent).toContain('o Kameo ideal é Sareena');
  });
});
