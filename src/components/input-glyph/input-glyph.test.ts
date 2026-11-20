import { describe, expect, it } from 'vitest';

import { inputTokens } from '../../lib/combo/notation.ts';
import { ps5Layout } from '../../lib/combo/controller-layout.ts';
import { mount } from '../../test/render.ts';
import type { AppInputGlyph } from './input-glyph.ts';
import './input-glyph.ts';

function cap(element: AppInputGlyph): HTMLElement {
  const node = element.shadowRoot?.querySelector<HTMLElement>('.cap');
  if (!node) throw new Error('glyph cap not rendered');
  return node;
}

describe('app-input-glyph', () => {
  it.each(inputTokens.map((token) => [token]))(
    'labels %s with its name from the PS5 layout',
    async (token) => {
      const element = await mount<AppInputGlyph>(`<app-input-glyph token="${token}"></app-input-glyph>`);

      expect(cap(element).getAttribute('role')).toBe('img');
      expect(cap(element).getAttribute('aria-label')).toBe(ps5Layout[token].name);
    },
  );

  it('draws face buttons as a round cap with a stroke symbol in the button tone', async () => {
    const element = await mount<AppInputGlyph>('<app-input-glyph token="2"></app-input-glyph>');

    expect(cap(element).classList.contains('face')).toBe(true);
    expect(cap(element).dataset.tone).toBe('triangle');
    expect(cap(element).querySelector('svg path')).not.toBeNull();
  });

  it('rotates the arrow for each direction', async () => {
    const element = await mount<AppInputGlyph>('<app-input-glyph token="D"></app-input-glyph>');

    expect(cap(element).classList.contains('direction')).toBe(true);
    expect(cap(element).querySelector('svg')?.style.transform).toBe('rotate(90deg)');
  });

  it('prints the caption on shoulder buttons', async () => {
    const element = await mount<AppInputGlyph>('<app-input-glyph token="K" size="sm"></app-input-glyph>');

    expect(cap(element).classList.contains('trigger')).toBe(true);
    expect(cap(element).dataset.tone).toBe('kameo');
    expect(cap(element).textContent.trim()).toBe('R1');
    expect(element.getAttribute('size')).toBe('sm');
  });

  it('renders nothing for an unknown token', async () => {
    const element = await mount<AppInputGlyph>('<app-input-glyph token="X9"></app-input-glyph>');

    expect(element.shadowRoot?.querySelector('.cap')).toBeNull();
  });
});
