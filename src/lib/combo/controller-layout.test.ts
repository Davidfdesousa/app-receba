import { describe, expect, it } from 'vitest';

import {
  controllers,
  describeNotation,
  describePress,
  isControllerId,
  layoutFor,
  legendTokens,
  ps5Layout,
  xboxLayout,
} from './controller-layout.ts';
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

describe('xboxLayout', () => {
  it('maps every token with the Mortal Kombat 1 default buttons', () => {
    expect(Object.keys(xboxLayout).sort()).toEqual([...inputTokens].sort());
    expect(describeNotation('D B 3+EX , 1', xboxLayout)).toBe('Baixo, Trás, A + RT, EX, X');
    expect(describePress(['TH', 'K'], xboxLayout)).toBe('LB, agarrão + RB, Kameo');
  });

  it('keeps the same button positions as PlayStation', () => {
    expect(xboxLayout['2'].caption).toBe('Y');
    expect(ps5Layout['2'].shape).toBe('triangle');
  });
});

describe('controllers', () => {
  it('lists PlayStation first and resolves layouts by id', () => {
    expect(controllers.map((controller) => controller.id)).toEqual(['playstation', 'xbox']);
    expect(layoutFor('xbox')).toBe(xboxLayout);
    expect(isControllerId('xbox')).toBe(true);
    expect(isControllerId('switch')).toBe(false);
  });
});
