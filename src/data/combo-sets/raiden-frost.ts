import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

/** Raiden (main) + Frost (kameo). Combos from mk1kombo, authors credited per combo. */
export const raidenFrost: ComboSet = {
  id: 'raiden-frost',
  game: 'Mortal Kombat 1',
  fighter: 'Raiden',
  kameo: 'Frost',
  combos: [
    {
      id: 'combo-584',
      category: 'combo',
      group: '2 barras',
      title: 'Abre com Frost',
      hits: 21,
      position: 'meio da tela',
      source: mk1kombo('584', 'DracaNova'),
      steps: [
        { notation: 'B+K', kind: 'kameo', label: 'Frost' },
        { notation: 'F+4 3', kind: 'normal', label: 'Sequência' },
        { notation: 'D B 2+EX', kind: 'special', label: 'Razzle Dazzle EX' },
        { notation: 'F+3 4', kind: 'normal', label: 'Sequência de chutes' },
        { notation: '3 4', kind: 'normal', label: 'Chutes' },
        { notation: 'F+2 2', kind: 'normal', label: 'Sequência de socos' },
        { notation: 'D F 2+EX', kind: 'special', label: 'Shocker EX' },
        { notation: '3', kind: 'normal', label: 'Chute' },
        { notation: 'D F 2', kind: 'finisher', label: 'Shocker' },
      ],
    },
  ],
};
