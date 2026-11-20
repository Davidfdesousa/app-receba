import { describe, expect, it } from 'vitest';

import { mount } from '../../test/render.ts';
import type { AppInputSequence } from './input-sequence.ts';
import './input-sequence.ts';

function query(element: AppInputSequence, selector: string): Element[] {
  return [...(element.shadowRoot?.querySelectorAll(selector) ?? [])];
}

describe('app-input-sequence', () => {
  it('renders one glyph per token and joins simultaneous buttons with +', async () => {
    const element = await mount<AppInputSequence>(
      '<app-input-sequence notation="D B 3+EX" size="sm"></app-input-sequence>',
    );

    const glyphs = query(element, 'app-input-glyph');
    expect(glyphs.map((glyph) => glyph.getAttribute('token'))).toEqual(['D', 'B', '3', 'EX']);
    expect(glyphs.every((glyph) => glyph.getAttribute('size') === 'sm')).toBe(true);
    expect(query(element, '.press')).toHaveLength(3);
    expect(query(element, '.joiner')).toHaveLength(1);
  });

  it('reads the whole sequence as one accessible image', async () => {
    const element = await mount<AppInputSequence>(
      '<app-input-sequence notation="D F 3 , 1"></app-input-sequence>',
    );
    const sequence = query(element, '.sequence')[0];

    expect(sequence?.getAttribute('role')).toBe('img');
    expect(sequence?.getAttribute('aria-label')).toBe('Baixo, Frente, X, Quadrado');
    expect(query(element, '.pause')).toHaveLength(1);
  });

  it('lights the first presses when litCount is set', async () => {
    const element = await mount<AppInputSequence>(
      '<app-input-sequence notation="2 2 1+3"></app-input-sequence>',
    );
    expect(query(element, '.lit, .unlit')).toHaveLength(0);

    element.litCount = 2;
    await element.updateComplete;

    const states = query(element, '.press').map((press) =>
      press.classList.contains('lit') ? 'lit' : 'unlit',
    );
    expect(states).toEqual(['lit', 'lit', 'unlit']);
  });

  it('renders nothing for invalid notation', async () => {
    const element = await mount<AppInputSequence>('<app-input-sequence notation="9 Z"></app-input-sequence>');

    expect(query(element, '.sequence')).toHaveLength(0);
  });
});
