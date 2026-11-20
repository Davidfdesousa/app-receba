/**
 * Universal Mortal Kombat notation, independent of any controller.
 *
 * - Attacks: 1 (front punch), 2 (back punch), 3 (front kick), 4 (back kick)
 * - Directions: F, B, U, D and UF (jump forward), always relative to the opponent
 * - K (kameo), EX (amplify / meter burn), TH (throw)
 *
 * Syntax: presses are separated by spaces, `+` joins buttons pressed together
 * and `,` marks a short pause. Example: `D B 3+EX` or `D F 3 , 1`.
 * Controller layouts (see controller-layout.ts) turn tokens into glyphs.
 */
export const directionTokens = ['F', 'B', 'U', 'D', 'UF'] as const;
export const buttonTokens = ['1', '2', '3', '4', 'K', 'EX', 'TH'] as const;
export const inputTokens = [...buttonTokens, ...directionTokens] as const;

export type DirectionToken = (typeof directionTokens)[number];
export type ButtonToken = (typeof buttonTokens)[number];
export type InputToken = (typeof inputTokens)[number];

/** Buttons pressed at the same moment. */
export type Press = readonly InputToken[];

export type NotationPart = { kind: 'press'; press: Press } | { kind: 'pause' };

const pauseMarker = ',';
const jumpTokens: readonly InputToken[] = ['U', 'UF'];

export function isInputToken(value: string): value is InputToken {
  return (inputTokens as readonly string[]).includes(value);
}

export function isDirectionToken(value: InputToken): value is DirectionToken {
  return (directionTokens as readonly string[]).includes(value);
}

/** Parses a notation string. Throws on unknown tokens so bad data fails loudly in tests. */
export function parseNotation(notation: string): NotationPart[] {
  return notation
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word): NotationPart => {
      if (word === pauseMarker) return { kind: 'pause' };

      const press = word.split('+').map((token) => {
        if (!isInputToken(token)) throw new Error(`Unknown input token "${token}" in "${notation}"`);
        return token;
      });

      return { kind: 'press', press };
    });
}

/** Presses only, without pause markers. */
export function parsePresses(notation: string): Press[] {
  return parseNotation(notation).flatMap((part) => (part.kind === 'press' ? [part.press] : []));
}

/** A press made only of directions, like the start of a special move motion. */
export function isMotionPress(press: Press): boolean {
  return press.length > 0 && press.every(isDirectionToken);
}

export function isJumpPress(press: Press): boolean {
  return press.length === 1 && jumpTokens.includes(press[0]!);
}

/** How many amplified (EX) presses the notation spends — one bar of meter each. */
export function countMeterBars(notation: string): number {
  return parsePresses(notation).filter((press) => press.includes('EX')).length;
}
