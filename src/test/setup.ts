import { afterEach } from 'vitest';

import { defaultControllerId } from '../lib/combo/controller-layout.ts';
import { controllerStore } from '../lib/controller-preference.ts';

afterEach(() => {
  document.body.innerHTML = '';
  delete document.documentElement.dataset.theme;
  localStorage.clear();
  controllerStore.set(defaultControllerId);
});
