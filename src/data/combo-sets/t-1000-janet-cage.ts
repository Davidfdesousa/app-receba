import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

/** T-1000 (main) + Janet Cage (kameo). Combos from mk1kombo, authors credited per combo. */
export const t1000JanetCage: ComboSet = {
  id: 't-1000-janet-cage',
  game: 'Mortal Kombat 1',
  fighter: 'T-1000',
  kameo: 'Janet Cage',
  combos: [
    {
      id: 'combo-399',
      category: 'combo',
      group: 'Sem barra',
      title: 'Curto com Janet Cage',
      damage: 302,
      hits: 11,
      source: mk1kombo('399', 'DesLeal'),
      steps: [
        { notation: 'F+1 3', kind: 'normal', label: 'Abertura' },
        { notation: 'F+K', kind: 'kameo', label: 'Janet Cage' },
        { notation: 'UF 3 2', kind: 'air', label: 'Pulo para frente e [3 2] no ar' },
        { notation: 'F+2 2', kind: 'finisher', label: 'Sequência final' },
      ],
    },
  ],
};
