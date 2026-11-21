import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

/** Scorpion (main) + Sareena (kameo). Combos from mk1kombo, authors credited per combo. */
export const scorpionSareena: ComboSet = {
  id: 'scorpion-sareena',
  game: 'Mortal Kombat 1',
  fighter: 'Scorpion',
  kameo: 'Sareena',
  combos: [
    {
      id: 'combo-598',
      category: 'combo',
      group: 'Sem barra',
      title: 'Spear e Sareena duas vezes',
      damage: 352,
      hits: 19,
      source: mk1kombo('598', 'TheFurnance'),
      steps: [
        { notation: 'F+3 2', kind: 'normal', label: 'Abertura' },
        { notation: 'F+3 2', kind: 'normal', label: 'Abertura de novo' },
        { notation: 'B F 1', kind: 'special', label: 'Spear' },
        { notation: '3 3', kind: 'normal', label: 'Sequência de chutes' },
        { notation: 'B+K', kind: 'kameo', label: 'Sareena' },
        { notation: '3 3', kind: 'normal', label: 'Sequência de chutes' },
        { notation: 'B+K', kind: 'kameo', label: 'Sareena de novo' },
        { notation: 'B F 2', kind: 'finisher', label: 'Blazing Charge' },
      ],
    },
  ],
};
