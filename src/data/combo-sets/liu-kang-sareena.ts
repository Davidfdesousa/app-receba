import type { ComboSet, ComboStep } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

const theCreator: ComboStep = { notation: 'F+4 3', kind: 'normal', label: 'Abertura' };
const tailwhip: ComboStep = { notation: 'B+2 3', kind: 'normal', label: 'Sequência' };
const kicks: ComboStep = { notation: '3 3 3', kind: 'normal', label: 'Sequência de chutes' };
const kameo: ComboStep = { notation: 'B+K', kind: 'kameo', label: 'Sareena' };
const dragonsTail: ComboStep = { notation: 'B F 3', kind: 'finisher', label: "Dragon's Tail" };
const dragonsTailEx: ComboStep = { notation: 'B F 3+EX', kind: 'special', label: "Dragon's Tail EX" };

/** Liu Kang (main) + Sareena (kameo). Combos from mk1kombo, authors credited per combo. */
export const liuKangSareena: ComboSet = {
  id: 'liu-kang-sareena',
  game: 'Mortal Kombat 1',
  fighter: 'Liu Kang',
  kameo: 'Sareena',
  defaultComboId: 'combo-412',
  combos: [
    {
      id: 'combo-411',
      category: 'combo',
      group: 'Sem barra',
      title: 'Básico sem Kameo',
      damage: 343,
      hits: 8,
      source: mk1kombo('411', 'DesLeal'),
      steps: [tailwhip, { ...tailwhip, label: 'Sequência de novo' }, kicks, dragonsTail],
    },
    {
      id: 'combo-412',
      category: 'combo',
      group: 'Sem barra',
      title: 'Sareena duas vezes',
      damage: 419,
      hits: 26,
      source: mk1kombo('412', 'DesLeal'),
      steps: [
        theCreator,
        kameo,
        { ...theCreator, label: 'Abertura de novo' },
        { ...kameo, label: 'Sareena de novo' },
        tailwhip,
        { notation: 'UF 1 3 4', kind: 'air', label: 'Pulo para frente e [1 3 4] no ar' },
        { notation: 'B F 1', kind: 'finisher', label: 'Cosmic Flame' },
      ],
    },
    {
      id: 'combo-435',
      category: 'combo',
      group: '2 barras',
      title: "Dragon's Tail três vezes",
      damage: 467,
      hits: 27,
      source: mk1kombo('435', 'DesLeal'),
      steps: [
        theCreator,
        kameo,
        { notation: '3 3', kind: 'normal', label: 'Chutes' },
        { ...theCreator, label: 'Abertura de novo' },
        dragonsTailEx,
        tailwhip,
        kicks,
        dragonsTailEx,
        dragonsTail,
      ],
    },
  ],
};
