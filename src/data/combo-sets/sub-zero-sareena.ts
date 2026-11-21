import type { ComboSet } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

/** Sub-Zero (main) + Sareena (kameo). Combos from mk1kombo, authors credited per combo. */
export const subZeroSareena: ComboSet = {
  id: 'sub-zero-sareena',
  game: 'Mortal Kombat 1',
  fighter: 'Sub-Zero',
  kameo: 'Sareena',
  combos: [
    {
      id: 'combo-386',
      category: 'combo',
      group: 'Sem barra',
      title: 'Sareena duas vezes e Ice Slide',
      damage: 370,
      hits: 22,
      source: mk1kombo('386', 'DesLeal'),
      steps: [
        { notation: 'B+3', kind: 'normal', label: 'Chute baixo' },
        { notation: 'B+K', kind: 'kameo', label: 'Sareena' },
        { notation: 'F', kind: 'normal', label: 'Avança', note: 'Um passo para frente' },
        { notation: 'F+1 2', kind: 'normal', label: 'Sequência de socos' },
        { notation: 'B+K', kind: 'kameo', label: 'Sareena de novo' },
        { notation: 'F', kind: 'normal', label: 'Avança', note: 'Um passo para frente' },
        { notation: 'B+2', kind: 'normal', label: 'Soco' },
        { notation: 'B+2', kind: 'normal', label: 'Soco de novo' },
        { notation: 'UF 1 2', kind: 'air', label: 'Pulo para frente e [1 2] no ar' },
        { notation: '1 2', kind: 'normal', label: 'Sequência de socos' },
        { notation: 'B F 3', kind: 'finisher', label: 'Ice Slide' },
      ],
    },
  ],
};
