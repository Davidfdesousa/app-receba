import { describe, expect, it } from 'vitest';

import type { AppInputSequence } from '../input-sequence/input-sequence.ts';
import { mount } from '../../test/render.ts';
import type { AppNotationText } from './notation-text.ts';
import './notation-text.ts';

describe('app-notation-text', () => {
  it('keeps the text and renders bracketed notation as glyphs', async () => {
    const element = await mount<AppNotationText>(
      '<app-notation-text text="Pulo e [2 2] no ar"></app-notation-text>',
    );
    const sequences = [
      ...(element.shadowRoot?.querySelectorAll<AppInputSequence>('app-input-sequence') ?? []),
    ];

    expect(element.shadowRoot?.textContent).toContain('Pulo e ');
    expect(element.shadowRoot?.textContent).toContain(' no ar');
    expect(element.shadowRoot?.textContent).not.toContain('[');
    expect(sequences).toHaveLength(1);
    expect(sequences[0]?.notation).toBe('2 2');
    expect(sequences[0]?.size).toBe('inline');

    await sequences[0]?.updateComplete;
    expect(sequences[0]?.shadowRoot?.querySelector('.sequence')?.getAttribute('aria-label')).toBe(
      'Triângulo, Triângulo',
    );
  });

  it('passes its size down to the sequences', async () => {
    const element = await mount<AppNotationText>(
      '<app-notation-text text="Próximo: [D B 4]" size="sm"></app-notation-text>',
    );

    expect(element.shadowRoot?.querySelector('app-input-sequence')?.getAttribute('size')).toBe('sm');
  });

  it('renders plain text untouched', async () => {
    const element = await mount<AppNotationText>('<app-notation-text text="Abertura"></app-notation-text>');

    expect(element.shadowRoot?.textContent.trim()).toBe('Abertura');
    expect(element.shadowRoot?.querySelector('app-input-sequence')).toBeNull();
  });
});
