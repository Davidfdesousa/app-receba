import type { ComboSet, ComboStep } from '../lib/combo/combo.types.ts';

/**
 * Ghostface (main) + Scorpion (kameo) — Mortal Kombat 1.
 * Combos from the mk1kombo community database; authors credited per combo.
 * Copy is Brazilian Portuguese; inputs inside brackets use universal notation.
 */
const mk1kombo = (reference: string, author: string) => ({
  site: 'mk1kombo',
  url: `https://mk1kombo.kagewebsite.com/combo/${reference}`,
  reference: `#${reference}`,
  author,
});

const opener: ComboStep = { notation: 'F+2 1', kind: 'normal', label: 'Abertura' };
const backstagePassEx: ComboStep = {
  notation: 'D B 3+EX',
  kind: 'special',
  label: 'Backstage Pass EX',
  swapsSide: true,
};
const alwaysOutnumbered: ComboStep = { notation: 'D B 4', kind: 'special', label: 'Always Outnumbered' };
const kameoForward: ComboStep = { notation: 'F+K', kind: 'kameo', label: 'Scorpion' };
const kameoDown: ComboStep = { notation: 'D+K', kind: 'kameo', label: 'Scorpion' };
const kameoNeutral: ComboStep = { notation: 'K', kind: 'kameo', label: 'Scorpion' };
const jumpCancel: ComboStep = {
  notation: '2 2 1+3',
  kind: 'normal',
  label: 'Cancelamento em pulo',
  swapsSide: true,
};
const jumpAir: ComboStep = { notation: 'U 2 2', kind: 'air', label: 'Pulo e [2 2] no ar' };
const jumpForwardAir: ComboStep = {
  notation: 'UF 2 2',
  kind: 'air',
  label: 'Pulo para frente e [2 2] no ar',
};
const restand: ComboStep = { notation: 'B+3', kind: 'normal', label: 'Levanta o oponente' };
const fatherDeath: ComboStep = { notation: 'B D F 1', kind: 'special', label: 'Father Death' };
const finisher: ComboStep = {
  notation: 'D F 3 , 1',
  kind: 'finisher',
  label: 'Psychotic Rush e Rushing Stab',
};

export const ghostfaceScorpion: ComboSet = {
  id: 'ghostface-scorpion',
  game: 'Mortal Kombat 1',
  fighter: 'Ghostface',
  kameo: 'Scorpion',
  defaultComboId: 'combo-469',
  combos: [
    {
      id: 'combo-338',
      category: 'combo',
      group: 'Sem barra',
      title: 'Sem gastar barra',
      damage: 369,
      hits: 24,
      source: mk1kombo('338', 'Kage'),
      steps: [
        opener,
        kameoForward,
        alwaysOutnumbered,
        jumpCancel,
        jumpAir,
        { notation: 'F+4', kind: 'normal', label: 'Chute para frente', swapsSide: true },
        jumpAir,
        restand,
        fatherDeath,
        kameoDown,
        { ...restand, label: 'Levanta de novo' },
        finisher,
      ],
    },
    {
      id: 'combo-469',
      category: 'combo',
      group: '1 barra',
      title: 'O mais curto',
      damage: 384,
      hits: 18,
      position: 'meio da tela',
      source: mk1kombo('469', 'Therealak1'),
      steps: [
        opener,
        backstagePassEx,
        { notation: '4 4', kind: 'normal', label: 'Sequência de chutes' },
        kameoForward,
        alwaysOutnumbered,
        { notation: '2 2 TH', kind: 'normal', label: 'Sequência com agarrão' },
        jumpForwardAir,
        { notation: '4', kind: 'normal', label: 'Chute' },
        finisher,
      ],
    },
    {
      id: 'combo-340',
      category: 'combo',
      group: '1 barra',
      title: 'Dois pulos com troca',
      damage: 397,
      hits: 21,
      source: mk1kombo('340', 'Kage'),
      steps: [
        opener,
        backstagePassEx,
        { notation: '4 4', kind: 'normal', label: 'Sequência de chutes' },
        kameoForward,
        alwaysOutnumbered,
        jumpCancel,
        jumpAir,
        { notation: 'F+4', kind: 'normal', label: 'Chute para frente', swapsSide: true },
        jumpAir,
        restand,
        finisher,
      ],
    },
    {
      id: 'combo-521',
      category: 'combo',
      group: '1 barra',
      title: 'Father Death com Kameo',
      damage: 416,
      hits: 24,
      source: mk1kombo('521', 'D34THSKVLL'),
      steps: [
        opener,
        backstagePassEx,
        { notation: '2 2 2', kind: 'normal', label: 'Sequência de socos' },
        fatherDeath,
        kameoDown,
        { notation: '2 2 TH', kind: 'normal', label: 'Sequência com agarrão', swapsSide: true },
        jumpForwardAir,
        restand,
        finisher,
      ],
    },
    {
      id: 'combo-361',
      category: 'combo',
      group: '1 barra',
      title: 'Abre com [2 2 2] e Kameo',
      damage: 416,
      hits: 24,
      source: mk1kombo('361', 'SummaBlasphemia'),
      steps: [
        { notation: '2 2 2', kind: 'normal', label: 'Sequência de socos' },
        kameoNeutral,
        { ...alwaysOutnumbered, holds: true, note: 'Segure [4] para atrasar o golpe' },
        opener,
        backstagePassEx,
        jumpCancel,
        jumpForwardAir,
        restand,
        kameoForward,
        alwaysOutnumbered,
        { ...opener, label: 'Abertura de novo' },
        finisher,
      ],
    },
    {
      id: 'combo-362',
      category: 'combo',
      group: '2 barras',
      title: 'Maior dano da dupla',
      damage: 432,
      hits: 21,
      source: mk1kombo('362', 'SummaBlasphemia'),
      steps: [
        { notation: '2 2 2', kind: 'normal', label: 'Sequência de socos' },
        kameoNeutral,
        alwaysOutnumbered,
        opener,
        { ...backstagePassEx, notation: 'D B 3+EX TH', holds: true, note: 'Segure [3] e aperte [TH]' },
        { notation: '4 4', kind: 'normal', label: 'Sequência de chutes' },
        kameoForward,
        alwaysOutnumbered,
        { ...opener, label: 'Abertura de novo' },
        { notation: 'D F 4+EX', kind: 'special', label: 'Psychotic Dive EX' },
        { notation: '2 2', kind: 'air', label: 'Socos no ar' },
        restand,
        { notation: 'D F 4', kind: 'finisher', label: 'Psychotic Dive' },
      ],
    },
    {
      id: 'piece-opener',
      category: 'piece',
      group: 'Abrir e cancelar',
      title: 'Abertura',
      description: 'Abre quase todos os combos',
      steps: [opener],
    },
    {
      id: 'piece-jump-cancel',
      category: 'piece',
      group: 'Abrir e cancelar',
      title: 'Cancelamento em pulo',
      description: 'Peça central, segura na defesa',
      steps: [jumpCancel, jumpAir],
    },
    {
      id: 'piece-string-kameo',
      category: 'piece',
      group: 'Abrir e cancelar',
      title: '[2 2 2] com Kameo',
      description: 'Cancela no 3º golpe',
      steps: [{ notation: '2 2 2', kind: 'normal', label: 'Sequência de socos' }, kameoNeutral],
    },
    {
      id: 'piece-backstage-pass',
      category: 'piece',
      group: 'Abrir e cancelar',
      title: 'Backstage Pass EX',
      description: 'Troca de lado gastando 1 barra',
      steps: [opener, backstagePassEx, { notation: '4 4', kind: 'normal', label: 'Sequência de chutes' }],
    },
    {
      id: 'piece-kameo-cancel',
      category: 'piece',
      group: 'Ligações com Scorpion',
      title: 'Kameo no meio',
      description: 'Chama o Scorpion e cancela',
      steps: [
        { notation: '4 4', kind: 'normal', label: 'Sequência de chutes' },
        kameoForward,
        alwaysOutnumbered,
      ],
    },
    {
      id: 'piece-father-death',
      category: 'piece',
      group: 'Ligações com Scorpion',
      title: 'Father Death com Kameo',
      description: 'Estende o combo no chão',
      steps: [
        fatherDeath,
        kameoDown,
        { notation: '2 2 TH', kind: 'normal', label: 'Sequência com agarrão', swapsSide: true },
      ],
    },
    {
      id: 'piece-grab-swap',
      category: 'piece',
      group: 'Ligações com Scorpion',
      title: 'Troca no agarrão',
      description: 'Muda de lado e sobe para o ar',
      steps: [
        { notation: '2 2 TH', kind: 'normal', label: 'Sequência com agarrão', swapsSide: true },
        jumpForwardAir,
      ],
    },
    {
      id: 'piece-finisher',
      category: 'piece',
      group: 'Finalizar',
      title: 'Finalizador padrão',
      description: 'Levanta e fecha com Rush e Stab',
      steps: [restand, finisher],
    },
    {
      id: 'piece-dive-finisher',
      category: 'piece',
      group: 'Finalizar',
      title: 'Final com Dive EX',
      description: 'O fim do combo de 2 barras',
      steps: [
        opener,
        { notation: 'D F 4+EX', kind: 'special', label: 'Psychotic Dive EX' },
        { notation: '2 2', kind: 'air', label: 'Socos no ar' },
        restand,
        { notation: 'D F 4', kind: 'finisher', label: 'Psychotic Dive' },
      ],
    },
  ],
};
