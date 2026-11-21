import type { ComboSet, ComboStep } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

const shocker: ComboStep = { notation: 'D F 2', kind: 'special', label: 'Shocker' };
const punch: ComboStep = { notation: 'F+2', kind: 'normal', label: 'Soco' };
const kameo: ComboStep = { notation: 'F+K', kind: 'kameo', label: 'Jax' };

/** Raiden (main) + Jax (kameo). Combos from mk1kombo, authors credited per combo. */
export const raidenJax: ComboSet = {
  id: 'raiden-jax',
  game: 'Mortal Kombat 1',
  fighter: 'Raiden',
  kameo: 'Jax',
  combos: [
    {
      id: 'combo-322',
      category: 'combo',
      group: '1 barra',
      title: 'Shocker com Jax duas vezes',
      hits: 25,
      source: mk1kombo('322', 'Raiden'),
      steps: [
        { notation: 'F+3 4', kind: 'normal', label: 'Abertura' },
        { notation: 'F+3 4', kind: 'normal', label: 'Abertura de novo' },
        { notation: 'F+2 2', kind: 'normal', label: 'Sequência de socos' },
        shocker,
        kameo,
        punch,
        { notation: 'D F 2+EX', kind: 'special', label: 'Shocker EX' },
        punch,
        shocker,
        { ...kameo, label: 'Jax de novo' },
        punch,
        { ...shocker, kind: 'finisher' },
      ],
    },
  ],
};
