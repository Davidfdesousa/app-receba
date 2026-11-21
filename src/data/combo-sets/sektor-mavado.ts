import type { ComboSet, ComboStep } from '../../lib/combo/combo.types.ts';
import { youtube } from './youtube.ts';

/**
 * Sektor (main) + Mavado (kameo). Combos from Combaster's "Sektor Mavado Kameo Combo
 * Guide" (YouTube, Oct 2024); each one links to its moment in the video. Only combos
 * with inputs the app can show (no stance switch or Fatal Blow) are included.
 */
const guide = (seconds: number) => youtube('J1Z0SOhkUQQ', seconds, 'Combaster');

const mavadoUp: ComboStep = { notation: 'U+K', kind: 'kameo', label: 'Mavado' };
const mavadoForward: ComboStep = { notation: 'F+K', kind: 'kameo', label: 'Mavado' };
const jumpEnder: ComboStep = { notation: 'U 3 2', kind: 'air', label: 'Pulo e [3 2] no ar' };

export const sektorMavado: ComboSet = {
  id: 'sektor-mavado',
  game: 'Mortal Kombat 1',
  fighter: 'Sektor',
  kameo: 'Mavado',
  combos: [
    {
      id: 'yt-sektor-mavado-0058',
      category: 'combo',
      group: 'Sem barra',
      title: 'Básico com Mavado',
      source: guide(58),
      steps: [{ notation: 'B+2 2', kind: 'normal', label: 'Abertura' }, mavadoUp, jumpEnder],
    },
    {
      id: 'yt-sektor-mavado-0139',
      category: 'combo',
      group: 'Sem barra',
      title: 'Especial e Mavado',
      source: guide(99),
      steps: [
        { notation: 'F+2 1', kind: 'normal', label: 'Abertura' },
        { notation: 'B F 2', kind: 'special', label: 'Especial [B F 2]' },
        mavadoForward,
        { notation: 'F+3 4', kind: 'finisher', label: 'Sequência final' },
      ],
    },
    {
      id: 'yt-sektor-mavado-0324',
      category: 'combo',
      group: 'Sem barra',
      title: 'Mavado duas vezes',
      source: guide(204),
      steps: [
        { notation: 'B F 1', kind: 'special', label: 'Especial [B F 1]' },
        mavadoForward,
        { notation: 'F+2', kind: 'normal', label: 'Soco' },
        { notation: 'D B 2', kind: 'special', label: 'Especial [D B 2]' },
        { notation: 'F+2', kind: 'normal', label: 'Soco de novo' },
        { notation: 'D B 2', kind: 'special', label: 'Especial [D B 2] de novo' },
        { ...mavadoUp, label: 'Mavado de novo' },
        jumpEnder,
      ],
    },
    {
      id: 'yt-sektor-mavado-0610',
      category: 'combo',
      group: 'Sem barra',
      title: 'No canto com Mavado duas vezes',
      position: 'canto',
      source: guide(370),
      steps: [
        { notation: 'B+3', kind: 'normal', label: 'Chute baixo' },
        { notation: 'B F 2', kind: 'special', label: 'Especial [B F 2]' },
        mavadoUp,
        { notation: '4 2', kind: 'normal', label: 'Sequência' },
        { notation: 'D B 2', kind: 'special', label: 'Especial [D B 2]' },
        { notation: '4', kind: 'normal', label: 'Chute' },
        { notation: 'D B 2', kind: 'special', label: 'Especial [D B 2] de novo' },
        { ...mavadoUp, label: 'Mavado de novo' },
        jumpEnder,
      ],
    },
  ],
};
