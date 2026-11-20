import { describe, expect, it } from 'vitest';

import { inlineNotations, parseRichText } from './rich-text.ts';

describe('parseRichText', () => {
  it('splits text and bracketed notation', () => {
    expect(parseRichText('Pulo e [2 2] no ar')).toEqual([
      { kind: 'text', text: 'Pulo e ' },
      { kind: 'notation', notation: '2 2' },
      { kind: 'text', text: ' no ar' },
    ]);
  });

  it('returns plain text untouched', () => {
    expect(parseRichText('Father Death')).toEqual([{ kind: 'text', text: 'Father Death' }]);
  });

  it('lists the inline notations', () => {
    expect(inlineNotations('Segure [3] e aperte [TH]')).toEqual(['3', 'TH']);
  });
});
