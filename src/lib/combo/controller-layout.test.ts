import { describe, expect, it } from 'vitest';

import { describeNotation, describePress, legendTokens, ps5Layout } from './controller-layout.ts';
import { inputTokens } from './notation.ts';

describe('ps5Layout', () => {
  it('maps every token, and the legend lists each one once', () => {
    expect(Object.keys(ps5Layout).sort()).toEqual([...inputTokens].sort());
    expect([...legendTokens].sort()).toEqual([...inputTokens].sort());
  });

  it('describes presses and notation for screen readers', () => {
    expect(describePress(['D', 'K'])).toBe('Baixo + R1, Kameo');
    expect(describeNotation('D F 3 , 1')).toBe('Baixo, Frente, X, Quadrado');
  });
});
