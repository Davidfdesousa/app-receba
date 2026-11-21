import { parseNotation, type InputToken, type Press } from './notation.ts';

/** PlayStation symbols, arrows, shoulder buttons, and Xbox lettered face buttons. */
export type GlyphShape = 'triangle' | 'circle' | 'cross' | 'square' | 'arrow' | 'trigger' | 'letter';
export type GlyphTone =
  | 'triangle'
  | 'circle'
  | 'cross'
  | 'square'
  | 'xbox-a'
  | 'xbox-b'
  | 'xbox-x'
  | 'xbox-y'
  | 'direction'
  | 'kameo'
  | 'amplify'
  | 'grab';

export interface InputGlyph {
  shape: GlyphShape;
  tone: GlyphTone;
  /** Accessible name in Portuguese. */
  name: string;
  /** Text printed on lettered and shoulder glyphs (A, RB, R2…). */
  caption?: string;
  /** Arrow rotation in degrees, 0 pointing forward. */
  rotation?: number;
}

export type ControllerLayout = Readonly<Record<InputToken, InputGlyph>>;

/** Directions read the same on every pad. */
const directions = {
  F: { shape: 'arrow', tone: 'direction', name: 'Frente', rotation: 0 },
  B: { shape: 'arrow', tone: 'direction', name: 'Trás', rotation: 180 },
  U: { shape: 'arrow', tone: 'direction', name: 'Pulo', rotation: -90 },
  D: { shape: 'arrow', tone: 'direction', name: 'Baixo', rotation: 90 },
  UF: { shape: 'arrow', tone: 'direction', name: 'Pulo para frente', rotation: -45 },
} as const satisfies Partial<Record<InputToken, InputGlyph>>;

/** PlayStation 5 (DualSense), the default. */
export const ps5Layout: ControllerLayout = {
  '1': { shape: 'square', tone: 'square', name: 'Quadrado' },
  '2': { shape: 'triangle', tone: 'triangle', name: 'Triângulo' },
  '3': { shape: 'cross', tone: 'cross', name: 'X' },
  '4': { shape: 'circle', tone: 'circle', name: 'Círculo' },
  K: { shape: 'trigger', tone: 'kameo', name: 'R1, Kameo', caption: 'R1' },
  EX: { shape: 'trigger', tone: 'amplify', name: 'R2, EX', caption: 'R2' },
  TH: { shape: 'trigger', tone: 'grab', name: 'L1, agarrão', caption: 'L1' },
  ...directions,
};

/** Xbox Series, with Mortal Kombat 1's default mapping (same positions as on PlayStation). */
export const xboxLayout: ControllerLayout = {
  '1': { shape: 'letter', tone: 'xbox-x', name: 'X', caption: 'X' },
  '2': { shape: 'letter', tone: 'xbox-y', name: 'Y', caption: 'Y' },
  '3': { shape: 'letter', tone: 'xbox-a', name: 'A', caption: 'A' },
  '4': { shape: 'letter', tone: 'xbox-b', name: 'B', caption: 'B' },
  K: { shape: 'trigger', tone: 'kameo', name: 'RB, Kameo', caption: 'RB' },
  EX: { shape: 'trigger', tone: 'amplify', name: 'RT, EX', caption: 'RT' },
  TH: { shape: 'trigger', tone: 'grab', name: 'LB, agarrão', caption: 'LB' },
  ...directions,
};

export type ControllerId = 'playstation' | 'xbox';

export const defaultControllerId: ControllerId = 'playstation';

/** Every supported pad, in the order the picker shows them. */
export const controllers: readonly { id: ControllerId; label: string; layout: ControllerLayout }[] = [
  { id: 'playstation', label: 'PlayStation', layout: ps5Layout },
  { id: 'xbox', label: 'Xbox', layout: xboxLayout },
];

export function isControllerId(value: unknown): value is ControllerId {
  return controllers.some((controller) => controller.id === value);
}

export function layoutFor(id: ControllerId): ControllerLayout {
  return controllers.find((controller) => controller.id === id)?.layout ?? ps5Layout;
}

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
