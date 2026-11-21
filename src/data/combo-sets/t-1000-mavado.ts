import type { ComboSet, ComboStep } from '../../lib/combo/combo.types.ts';
import { mk1kombo } from './mk1kombo.ts';

const special: ComboStep = { notation: 'B F 3 2', kind: 'special', label: 'Especial [B F 3] com [2]' };
const jump: ComboStep = { notation: 'UF 3 2', kind: 'air', label: 'Pulo para frente e [3 2] no ar' };
const punches: ComboStep = { notation: 'F+2 2', kind: 'normal', label: 'Sequência de socos' };
const kameo: ComboStep = { notation: 'U+K', kind: 'kameo', label: 'Mavado' };

/** T-1000 (main) + Mavado (kameo). Combos from mk1kombo, authors credited per combo. */
export const t1000Mavado: ComboSet = {
  id: 't-1000-mavado',
  game: 'Mortal Kombat 1',
  fighter: 'T-1000',
  kameo: 'Mavado',
  combos: [
    {
      id: 'combo-425',
      category: 'combo',
      group: 'Sem barra',
      title: 'Curto com Mavado',
      damage: 374,
      hits: 11,
      source: mk1kombo('425', 'DesLeal'),
      steps: [
        { notation: '3 1 2', kind: 'normal', label: 'Abertura' },
        special,
        jump,
        punches,
        kameo,
        { ...punches, kind: 'finisher', label: 'Sequência final' },
      ],
    },
    {
      id: 'combo-426',
      category: 'combo',
      group: 'Sem barra',
      title: 'Fecha com [B F 4 1]',
      damage: 374,
      hits: 14,
      source: mk1kombo('426', 'DesLeal'),
      steps: [
        { notation: '3 2 1', kind: 'normal', label: 'Abertura' },
        special,
        jump,
        punches,
        kameo,
        { notation: 'F+1', kind: 'normal', label: 'Soco' },
        { notation: 'B F 4 1', kind: 'finisher', label: 'Especial [B F 4] com [1]' },
      ],
    },
  ],
};
