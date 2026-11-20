/**
 * Copy can reference inputs inline with brackets, so every mention of a button
 * renders with the same glyphs as the combo itself: `Pulo e [2 2] no ar`.
 */
export type RichTextSegment = { kind: 'text'; text: string } | { kind: 'notation'; notation: string };

const inlineNotation = /\[([^\]]+)\]/g;

export function parseRichText(text: string): RichTextSegment[] {
  const segments: RichTextSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(inlineNotation)) {
    if (match.index > cursor) segments.push({ kind: 'text', text: text.slice(cursor, match.index) });
    segments.push({ kind: 'notation', notation: match[1]!.trim() });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) segments.push({ kind: 'text', text: text.slice(cursor) });
  return segments;
}

/** Notation snippets referenced in a text, for validating copy in tests. */
export function inlineNotations(text: string): string[] {
  return parseRichText(text).flatMap((segment) => (segment.kind === 'notation' ? [segment.notation] : []));
}
