import type { ComboSet, ComboStep } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

const tailwhip: ComboStep = { notation: 'B+2 3', kind: 'normal', label: 'Abertura' };
const kicks: ComboStep = { notation: '3 3 3', kind: 'normal', label: 'Sequência de chutes' };
const twoKicks: ComboStep = { notation: '3 3', kind: 'normal', label: 'Chutes' };
const kameo: ComboStep = { notation: 'F+K', kind: 'kameo', label: 'Kung Lao' };
const dragonsTail: ComboStep = { notation: 'B F 3', kind: 'finisher', label: "Dragon's Tail" };
const dragonsTailEx: ComboStep = { notation: 'B F 3+EX', kind: 'special', label: "Dragon's Tail EX" };

/** Liu Kang (main) + Kung Lao (kameo). Combos from mk1kombo, authors credited per combo. */
export const liuKangKungLao: ComboSet = {
  id: 'liu-kang-kung-lao',
  game: 'Mortal Kombat 1',
  fighter: 'Liu Kang',
  kameo: 'Kung Lao',
  combos: [
    {
      id: 'combo-414',
      category: 'combo',
      group: 'Sem barra',
      title: 'Curto com Kung Lao',
      damage: 336,
      hits: 9,
      source: mk1kombo('414', 'DesLeal'),
      steps: [tailwhip, { notation: '4', kind: 'normal', label: 'Chute' }, kameo, kicks, dragonsTail],
    },
    {
      id: 'combo-413',
      category: 'combo',
      group: '1 barra',
      title: "Abre com [F+4 3] e Dragon's Tail EX",
      damage: 321,
      hits: 10,
      source: mk1kombo('413', 'DesLeal'),
      steps: [
        { notation: 'F+4 3', kind: 'normal', label: 'Abertura' },
        kameo,
        { notation: '3', kind: 'normal', label: 'Chute' },
        dragonsTailEx,
        twoKicks,
        dragonsTail,
      ],
    },
    {
      id: 'combo-416',
      category: 'combo',
      group: '1 barra',
      title: 'Maior dano com Kung Lao',
      damage: 448,
      hits: 15,
      source: mk1kombo('416', 'DesLeal'),
      steps: [
        tailwhip,
        { ...tailwhip, label: 'Abertura de novo' },
        kicks,
        kameo,
        twoKicks,
        dragonsTailEx,
        twoKicks,
        dragonsTail,
      ],
    },
  ],
};
