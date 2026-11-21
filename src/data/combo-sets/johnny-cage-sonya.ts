import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

/** Johnny Cage (main) + Sonya (kameo). Combos from mk1kombo, authors credited per combo. */
export const johnnyCageSonya: ComboSet = {
  id: 'johnny-cage-sonya',
  game: 'Mortal Kombat 1',
  fighter: 'Johnny Cage',
  kameo: 'Sonya',
  combos: [
    {
      id: 'combo-476',
      category: 'combo',
      group: '1 barra',
      title: 'Rising Star com Sonya',
      damage: 366,
      hits: 11,
      position: 'meio da tela',
      source: mk1kombo('476', 'Therealak1'),
      steps: [
        { notation: '2 1 4', kind: 'normal', label: 'Abertura' },
        { notation: 'D B 3', kind: 'special', label: 'Rising Star' },
        { notation: 'K', kind: 'kameo', label: 'Sonya' },
        { notation: 'UF 2 4 4', kind: 'air', label: 'Pulo para frente e [2 4 4] no ar' },
        { notation: 'F+3 2', kind: 'normal', label: 'Sequência' },
        { notation: 'B F 4+EX', kind: 'finisher', label: 'Shadow Kick EX' },
      ],
    },
  ],
};
