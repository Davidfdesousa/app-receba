import { describe, expect, it, vi } from 'vitest';

import { xboxLayout } from './combo/controller-layout.ts';
import {
  activeLayout,
  controllerStorageKey,
  controllerStore,
  readControllerId,
  selectController,
} from './controller-preference.ts';

describe('controller preference', () => {
  it('defaults to PlayStation and ignores unknown saved values', () => {
    expect(readControllerId()).toBe('playstation');

    localStorage.setItem(controllerStorageKey, 'gamecube');
    expect(readControllerId()).toBe('playstation');
  });

  it('remembers the pick and tells every subscriber', () => {
    const listener = vi.fn();
    const unsubscribe = controllerStore.subscribe(listener);

    selectController('xbox');

    expect(localStorage.getItem(controllerStorageKey)).toBe('xbox');
    expect(readControllerId()).toBe('xbox');
    expect(listener).toHaveBeenLastCalledWith('xbox');
    expect(activeLayout()).toBe(xboxLayout);
    unsubscribe();
  });

  it('survives unavailable storage', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };

    expect(readControllerId(blocked)).toBe('playstation');
    expect(() => {
      selectController('xbox', blocked);
    }).not.toThrow();
    expect(controllerStore.get()).toBe('xbox');
  });
});
