import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

/** Sub-Zero (main) + Sonya (kameo). Combos from mk1kombo, authors credited per combo. */
export const subZeroSonya: ComboSet = {
  id: 'sub-zero-sonya',
  game: 'Mortal Kombat 1',
  fighter: 'Sub-Zero',
  kameo: 'Sonya',
  combos: [
    {
      id: 'combo-544',
      category: 'combo',
      group: '1 barra',
      title: 'Ice Klone com Sonya',
      damage: 392,
      hits: 16,
      source: mk1kombo('544', 'D34THSKVLL'),
      steps: [
        { notation: '2 1', kind: 'normal', label: 'Abertura' },
        { notation: 'D B 2+EX', kind: 'special', label: 'Especial amplificado' },
        { notation: 'B+2', kind: 'normal', label: 'Soco' },
        { notation: 'B+2', kind: 'normal', label: 'Soco de novo' },
        { notation: 'UF 2 1', kind: 'air', label: 'Pulo para frente e [2 1] no ar' },
        { notation: 'K', kind: 'kameo', label: 'Sonya' },
        { notation: 'UF 2 1', kind: 'air', label: 'Pulo para frente e [2 1] de novo' },
        { notation: 'D B 1', kind: 'special', label: 'Ice Klone' },
        { notation: 'UF 2 2', kind: 'air', label: 'Pulo para frente e [2 2] no ar' },
        { notation: 'D B 4', kind: 'finisher', label: 'Diving Glacier', note: 'Ainda no ar' },
      ],
    },
  ],
};
