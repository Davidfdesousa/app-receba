import type { ComboSet, ComboStep } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

const ballBuster: ComboStep = { notation: 'B D 1', kind: 'special', label: 'Ball Buster' };
const jumpIn: ComboStep = { notation: 'UF 2', kind: 'air', label: 'Pulo para frente com [2]' };

/** Johnny Cage (main) + Kano (kameo). Combos from mk1kombo, authors credited per combo. */
export const johnnyCageKano: ComboSet = {
  id: 'johnny-cage-kano',
  game: 'Mortal Kombat 1',
  fighter: 'Johnny Cage',
  kameo: 'Kano',
  combos: [
    {
      id: 'combo-457',
      category: 'combo',
      group: '1 barra',
      title: 'Ball Buster com Kano',
      damage: 445,
      hits: 32,
      position: 'meio da tela',
      source: mk1kombo('457', 'lerassy'),
      steps: [
        jumpIn,
        { notation: '2 1 4', kind: 'normal', label: 'Sequência' },
        { notation: 'B D 1+EX', kind: 'special', label: 'Ball Buster EX' },
        { notation: 'B+K', kind: 'kameo', label: 'Kano' },
        jumpIn,
        { notation: '4', kind: 'normal', label: 'Chute' },
        { notation: 'F D B 4', kind: 'special', label: 'Hype' },
        ballBuster,
        { notation: 'D B 3', kind: 'special', label: 'Rising Star' },
        { notation: '2', kind: 'air', label: 'Soco no ar' },
        { notation: '2 1 2', kind: 'normal', label: 'Sequência de socos' },
        { notation: 'F F', kind: 'normal', label: 'Corrida', note: 'Toque duas vezes para frente' },
        { notation: 'F+1 2', kind: 'normal', label: 'Sequência de socos' },
        ballBuster,
        { ...ballBuster, label: 'Ball Buster de novo' },
        { notation: 'B+K', kind: 'kameo', label: 'Kano de novo' },
        { notation: '2 1 4', kind: 'normal', label: 'Sequência' },
        ballBuster,
        { ...ballBuster, label: 'Ball Buster de novo' },
        { notation: 'B F 4', kind: 'finisher', label: 'Shadow Kick' },
      ],
    },
  ],
};
