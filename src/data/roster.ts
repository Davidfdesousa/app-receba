import type { DuoSelection, FighterProfile, Kameo, Roster } from '../lib/roster/roster.types.ts';

/**
 * Who can be picked and who goes well together — Mortal Kombat 1.
 *
 * Fighters: the most played online, from the leaderboard usage stats the GameFAQs
 * community compiles every Kombat League season, plus the newest DLC picks.
 *
 * Kameo picks, best first, cross-checked across:
 * - combos the community publishes per duo on mk1kombo (and its "Best Kameos" lists);
 * - YouTube guides and combo videos per fighter;
 * - Kameo usage online (Sareena has led every season) and Evo 2025 results.
 *
 * To add a fighter: append a profile with at least one pick. Ids are slugs and must
 * match the keys used in data/combo-sets/index.ts.
 */

const kameos: readonly Kameo[] = [
  { id: 'cyrax', name: 'Cyrax' },
  { id: 'darrius', name: 'Darrius' },
  { id: 'ferra', name: 'Ferra' },
  { id: 'frost', name: 'Frost' },
  { id: 'goro', name: 'Goro' },
  { id: 'janet-cage', name: 'Janet Cage' },
  { id: 'jax', name: 'Jax' },
  { id: 'kano', name: 'Kano' },
  { id: 'khameleon', name: 'Khameleon' },
  { id: 'kung-lao', name: 'Kung Lao' },
  { id: 'madam-bo', name: 'Madam Bo' },
  { id: 'mavado', name: 'Mavado' },
  { id: 'motaro', name: 'Motaro' },
  { id: 'sareena', name: 'Sareena' },
  { id: 'scorpion', name: 'Scorpion' },
  { id: 'sektor', name: 'Sektor' },
  { id: 'shujinko', name: 'Shujinko' },
  { id: 'sonya', name: 'Sonya' },
  { id: 'stryker', name: 'Stryker' },
  { id: 'sub-zero', name: 'Sub-Zero' },
  { id: 'tremor', name: 'Tremor' },
];

const community = (slug: string) => `https://mk1kombo.kagewebsite.com/combos-${slug}/all/`;

const fighters: readonly FighterProfile[] = [
  {
    id: 'ghostface',
    name: 'Ghostface',
    communityUrl: community('ghostface'),
    picks: [
      {
        kameoId: 'scorpion',
        reason: 'Disparado o Kameo com mais combos e vídeos de Ghostface na comunidade.',
      },
      { kameoId: 'mavado', reason: 'Aparece em combos de 2025 e em vídeos de Ghostface.' },
      { kameoId: 'stryker', reason: 'Usado nos combos mais longos de Ghostface publicados em 2025.' },
    ],
  },
  {
    id: 'johnny-cage',
    name: 'Johnny Cage',
    communityUrl: community('johnny-cage'),
    picks: [
      {
        kameoId: 'kano',
        reason: 'Primeiro da lista de melhores Kameos do Johnny no mk1kombo e o que tem mais combos com ele.',
      },
      { kameoId: 'sonya', reason: 'Combos curtos e diretos com o Johnny, indicada em guias e vídeos.' },
      { kameoId: 'sub-zero', reason: 'O Kameo que mais aparece em vídeos de combos do Johnny Cage.' },
    ],
  },
  {
    id: 'kitana',
    name: 'Kitana',
    communityUrl: community('kitana'),
    picks: [
      {
        kameoId: 'scorpion',
        reason: 'Primeiro da lista de melhores Kameos da Kitana no mk1kombo e o que tem mais combos com ela.',
      },
      { kameoId: 'jax', reason: 'Segundo da lista do mk1kombo e o que mais aparece em vídeos da Kitana.' },
      { kameoId: 'kung-lao', reason: 'Terceiro da lista de melhores Kameos da Kitana no mk1kombo.' },
    ],
  },
  {
    id: 'liu-kang',
    name: 'Liu Kang',
    communityUrl: community('liu-kang'),
    picks: [
      {
        kameoId: 'sareena',
        reason: 'A dupla com mais combos de Liu Kang publicados em 2025, com e sem barra.',
      },
      { kameoId: 'kung-lao', reason: 'Quase empatado com a Sareena nos combos recentes de Liu Kang.' },
      { kameoId: 'motaro', reason: 'O Kameo que mais aparece em vídeos de combos do Liu Kang.' },
    ],
  },
  {
    id: 'mileena',
    name: 'Mileena',
    communityUrl: community('mileena'),
    picks: [
      { kameoId: 'scorpion', reason: 'O Kameo que mais aparece em vídeos e combos da Mileena.' },
      {
        kameoId: 'sonya',
        reason: 'Indicada em guias da Mileena e empatada com o Scorpion em combos publicados.',
      },
      { kameoId: 'sareena', reason: 'Indicada em guias da Mileena como a opção mais fácil de usar.' },
    ],
  },
  {
    id: 'noob-saibot',
    name: 'Noob Saibot',
    communityUrl: community('noob-saibot'),
    picks: [
      { kameoId: 'janet-cage', reason: 'A mais usada com o Noob nos combos publicados e nos vídeos.' },
      { kameoId: 'scorpion', reason: 'Segundo Kameo com mais combos de Noob Saibot na comunidade.' },
      { kameoId: 'mavado', reason: 'Aparece junto com a Janet nos vídeos de combos do Noob Saibot.' },
    ],
  },
  {
    id: 'omni-man',
    name: 'Omni-Man',
    communityUrl: community('omni-man'),
    picks: [
      {
        kameoId: 'tremor',
        reason: 'Primeiro da lista de melhores Kameos do Omni-Man no mk1kombo, com combos de 2025.',
      },
      {
        kameoId: 'scorpion',
        reason: 'Segundo da lista do mk1kombo e com combo recente (2026) com o Omni-Man.',
      },
      { kameoId: 'sonya', reason: 'Os vídeos de combos de dano máximo do Omni-Man usam a Sonya.' },
    ],
  },
  {
    id: 'raiden',
    name: 'Raiden',
    communityUrl: community('raiden'),
    picks: [
      {
        kameoId: 'jax',
        reason: 'O Kameo com mais combos de Raiden publicados e o usado nos guias do personagem.',
      },
      { kameoId: 'sub-zero', reason: 'O Kameo que mais aparece em vídeos de combos do Raiden.' },
      { kameoId: 'frost', reason: 'Tem combo recente (2026) com o Raiden e aparece em vídeos.' },
    ],
  },
  {
    id: 'scorpion',
    name: 'Scorpion',
    communityUrl: community('scorpion'),
    picks: [
      {
        kameoId: 'sareena',
        reason: 'A Kameo mais usada do online e a que tem mais combos de Scorpion publicados.',
      },
      {
        kameoId: 'ferra',
        reason: 'Chamada de dupla top tier em vídeos brasileiros, com combos de dano alto.',
      },
      { kameoId: 'stryker', reason: 'Aparece em vários combos recentes de Scorpion, de 2025 e 2026.' },
    ],
  },
  {
    id: 'sektor',
    name: 'Sektor',
    communityUrl: community('sektor'),
    picks: [
      {
        kameoId: 'mavado',
        reason: 'O Kameo que mais aparece em guias e vídeos de combo do Sektor no YouTube.',
      },
      { kameoId: 'frost', reason: 'Tem os combos de Sektor mais recentes publicados no mk1kombo (2025).' },
      { kameoId: 'motaro', reason: 'Aparece em combos da comunidade e em vídeos de Sektor.' },
    ],
  },
  {
    id: 'smoke',
    name: 'Smoke',
    communityUrl: community('smoke'),
    picks: [
      {
        kameoId: 'stryker',
        reason: 'Disparado o mais usado com o Smoke, nos combos da comunidade e nos vídeos.',
      },
      { kameoId: 'scorpion', reason: 'Indicado em guias do Smoke para alongar os combos no ar.' },
      { kameoId: 'cyrax', reason: 'Indicado em guias para iniciantes e com combo recente com o Smoke.' },
    ],
  },
  {
    id: 'sub-zero',
    name: 'Sub-Zero',
    communityUrl: community('sub-zero'),
    picks: [
      {
        kameoId: 'sonya',
        reason: 'A primeira escolha em guias e vídeos de Sub-Zero, com o maior número de combos publicados.',
      },
      {
        kameoId: 'sareena',
        reason: 'Empata com a Sonya em combos publicados e é a Kameo mais fácil de usar.',
      },
      {
        kameoId: 'frost',
        reason: 'Indicada em guias e listas de Kameos como uma das mais completas do jogo.',
      },
    ],
  },
  {
    id: 't-1000',
    name: 'T-1000',
    communityUrl: community('t1000'),
    picks: [
      { kameoId: 'mavado', reason: 'A dupla com mais combos de T-1000 publicados pela comunidade.' },
      { kameoId: 'madam-bo', reason: 'Muito usada com o T-1000 em combos e vídeos de 2025.' },
      { kameoId: 'janet-cage', reason: 'A terceira mais usada nos combos de T-1000 da comunidade.' },
    ],
  },
];

export const roster: Roster = {
  fighters,
  kameos,
  sources: [
    { label: 'combos da comunidade no mk1kombo', url: 'https://mk1kombo.kagewebsite.com/' },
    {
      label: 'guias de Kameo no YouTube',
      url: 'https://www.youtube.com/results?search_query=mk1+best+kameo',
    },
    {
      label: 'uso de lutadores e Kameos no online',
      url: 'https://gamefaqs.gamespot.com/boards/397695-mortal-kombat-1/80982866',
    },
    {
      label: 'personagens do Evo 2025',
      url: 'https://www.eventhubs.com/news/2025/aug/03/evo-2025-character-stats-most/',
    },
  ],
};

/** The duo shown on a first visit: the one with the most combos and practice pieces. */
export const defaultDuo: DuoSelection = { fighterId: 'ghostface', kameoId: 'scorpion' };
