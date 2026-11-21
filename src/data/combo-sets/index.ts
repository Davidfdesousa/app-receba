import type { ComboSet } from '../../lib/combo/combo.types.ts';
import type { DuoId } from '../../lib/roster/roster.types.ts';

export type ComboSetLoader = () => Promise<ComboSet>;

/**
 * Every duo with combos to train, keyed by `fighterId+kameoId` (ids from roster.ts).
 * Each set is its own chunk, loaded only when the duo is picked.
 *
 * To add a duo: create `<fighter>-<kameo>.ts` next to this file exporting a ComboSet,
 * then register it here. The data tests check notation, credits and roster ids.
 */
export const comboSetLoaders: Readonly<Record<DuoId, ComboSetLoader>> = {
  'ghostface+scorpion': () => import('./ghostface-scorpion.ts').then((module) => module.ghostfaceScorpion),
  'johnny-cage+kano': () => import('./johnny-cage-kano.ts').then((module) => module.johnnyCageKano),
  'johnny-cage+sonya': () => import('./johnny-cage-sonya.ts').then((module) => module.johnnyCageSonya),
  'kitana+scorpion': () => import('./kitana-scorpion.ts').then((module) => module.kitanaScorpion),
  'liu-kang+kung-lao': () => import('./liu-kang-kung-lao.ts').then((module) => module.liuKangKungLao),
  'liu-kang+sareena': () => import('./liu-kang-sareena.ts').then((module) => module.liuKangSareena),
  'raiden+frost': () => import('./raiden-frost.ts').then((module) => module.raidenFrost),
  'raiden+jax': () => import('./raiden-jax.ts').then((module) => module.raidenJax),
  'scorpion+sareena': () => import('./scorpion-sareena.ts').then((module) => module.scorpionSareena),
  'sektor+mavado': () => import('./sektor-mavado.ts').then((module) => module.sektorMavado),
  'sub-zero+sareena': () => import('./sub-zero-sareena.ts').then((module) => module.subZeroSareena),
  'sub-zero+sonya': () => import('./sub-zero-sonya.ts').then((module) => module.subZeroSonya),
  't-1000+janet-cage': () => import('./t-1000-janet-cage.ts').then((module) => module.t1000JanetCage),
  't-1000+mavado': () => import('./t-1000-mavado.ts').then((module) => module.t1000Mavado),
};

/** Duos that already have combos. */
export const availableDuos: ReadonlySet<DuoId> = new Set(Object.keys(comboSetLoaders) as DuoId[]);
