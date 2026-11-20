import { parseNotation, type InputToken, type Press } from './notation.ts';

export type GlyphShape = 'triangle' | 'circle' | 'cross' | 'square' | 'arrow' | 'trigger';
export type GlyphTone =
  'triangle' | 'circle' | 'cross' | 'square' | 'direction' | 'kameo' | 'amplify' | 'grab';

export interface InputGlyph {
  shape: GlyphShape;
  tone: GlyphTone;
  /** Accessible name in Portuguese. */
  name: string;
  /** Text printed on trigger/bumper glyphs (R1, R2, L1). */
  caption?: string;
  /** Arrow rotation in degrees, 0 pointing forward. */
  rotation?: number;
}

export type ControllerLayout = Readonly<Record<InputToken, InputGlyph>>;

/** PlayStation 5 (DualSense). The single source of truth for how inputs look and read. */
export const ps5Layout: ControllerLayout = {
  '1': { shape: 'square', tone: 'square', name: 'Quadrado' },
  '2': { shape: 'triangle', tone: 'triangle', name: 'Triângulo' },
  '3': { shape: 'cross', tone: 'cross', name: 'X' },
  '4': { shape: 'circle', tone: 'circle', name: 'Círculo' },
  K: { shape: 'trigger', tone: 'kameo', name: 'R1, Kameo', caption: 'R1' },
  EX: { shape: 'trigger', tone: 'amplify', name: 'R2, EX', caption: 'R2' },
  TH: { shape: 'trigger', tone: 'grab', name: 'L1, agarrão', caption: 'L1' },
  F: { shape: 'arrow', tone: 'direction', name: 'Frente', rotation: 0 },
  B: { shape: 'arrow', tone: 'direction', name: 'Trás', rotation: 180 },
  U: { shape: 'arrow', tone: 'direction', name: 'Pulo', rotation: -90 },
  D: { shape: 'arrow', tone: 'direction', name: 'Baixo', rotation: 90 },
  UF: { shape: 'arrow', tone: 'direction', name: 'Pulo para frente', rotation: -45 },
};

export function describePress(press: Press, layout: ControllerLayout = ps5Layout): string {
  return press.map((token) => layout[token].name).join(' + ');
}

/** Spoken version of a notation string, for aria-labels. */
export function describeNotation(notation: string, layout: ControllerLayout = ps5Layout): string {
  return parseNotation(notation)
    .flatMap((part) => (part.kind === 'press' ? [describePress(part.press, layout)] : []))
    .join(', ');
}

/** Legend order: face buttons, shoulders, then directions. */
export const legendTokens: readonly InputToken[] = [
  '1',
  '2',
  '3',
  '4',
  'K',
  'EX',
  'TH',
  'F',
  'B',
  'D',
  'U',
  'UF',
];
