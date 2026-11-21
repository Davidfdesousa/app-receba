import { describe, expect, it } from 'vitest';

import { controllerStore } from '../../lib/controller-preference.ts';
import { mount } from '../../test/render.ts';
import type { AppControllerPicker } from './controller-picker.ts';
import './controller-picker.ts';

const buttons = (picker: AppControllerPicker) => [
  ...(picker.shadowRoot?.querySelectorAll<HTMLButtonElement>('button') ?? []),
];

describe('app-controller-picker', () => {
  it('starts on PlayStation and switches the whole app to Xbox', async () => {
    const picker = await mount<AppControllerPicker>('<app-controller-picker></app-controller-picker>');
    const [playstation, xbox] = buttons(picker);

    expect(playstation?.getAttribute('aria-pressed')).toBe('true');
    expect(xbox?.getAttribute('aria-label')).toBe('Xbox');

    xbox?.click();
    await picker.updateComplete;

    expect(controllerStore.get()).toBe('xbox');
    expect(xbox?.getAttribute('aria-pressed')).toBe('true');
    expect(playstation?.getAttribute('aria-pressed')).toBe('false');
  });
});
