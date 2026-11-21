import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

/** Kitana (main) + Scorpion (kameo). Combos from mk1kombo, authors credited per combo. */
export const kitanaScorpion: ComboSet = {
  id: 'kitana-scorpion',
  game: 'Mortal Kombat 1',
  fighter: 'Kitana',
  kameo: 'Scorpion',
  combos: [
    {
      id: 'combo-617',
      category: 'combo',
      group: 'Sem barra',
      title: 'Curto com Scorpion',
      hits: 9,
      position: 'meio da tela',
      source: mk1kombo('617', 'Nyleah'),
      steps: [
        { notation: '2 4 1 2', kind: 'normal', label: 'Abertura' },
        { notation: 'F+K', kind: 'kameo', label: 'Scorpion' },
        { notation: '2 4', kind: 'normal', label: 'Sequência' },
        { notation: 'D F 2', kind: 'finisher', label: 'Princess Pirouette' },
      ],
    },
  ],
};
