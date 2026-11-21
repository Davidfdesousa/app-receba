import type { ComboSource } from '../../lib/combo/combo.types.ts';

/** Credit for a combo from the mk1kombo community database. */
export function mk1kombo(reference: string, author: string): ComboSource {
  return {
    site: 'mk1kombo',
    url: `https://mk1kombo.kagewebsite.com/combo/${reference}`,
    reference: `#${reference}`,
    author,
  };
}
