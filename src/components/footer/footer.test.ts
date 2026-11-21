import { describe, expect, it } from 'vitest';

import { appConfig } from '../../config/app.config.ts';
import { mount } from '../../test/render.ts';
import type { AppFooter } from './footer.ts';
import './footer.ts';

describe('app-footer', () => {
  it('credits the author with a link to their profile in a new tab', async () => {
    const { name, url } = appConfig.author;
    const footer = await mount<AppFooter>(
      `<app-footer author-name="${name}" author-url="${url}"></app-footer>`,
    );
    const link = footer.shadowRoot?.querySelector('a');

    expect(footer.shadowRoot?.querySelector('p')?.textContent).toContain('Desenvolvido por');
    expect(link?.getAttribute('href')).toBe('https://www.linkedin.com/in/davidfdesousa/');
    expect(link?.textContent).toContain('David Ferreira');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });
});
