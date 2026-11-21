import type { DuoId, DuoSelection, FighterProfile, Kameo, KameoPick, Roster } from './roster.types.ts';

export function duoId(fighterId: string, kameoId: string): DuoId {
  return `${fighterId}+${kameoId}`;
}

export function findFighter(roster: Roster, fighterId: string): FighterProfile | undefined {
  return roster.fighters.find((fighter) => fighter.id === fighterId);
}

export function findKameo(roster: Roster, kameoId: string): Kameo | undefined {
  return roster.kameos.find((kameo) => kameo.id === kameoId);
}

/** The partner the community recommends most for this fighter. */
export function idealKameoId(fighter: FighterProfile): string | undefined {
  return fighter.picks[0]?.kameoId;
}

export interface KameoOption {
  kameo: Kameo;
  /** 1 for the ideal partner, 2 and 3 for the alternatives; null when not recommended. */
  rank: number | null;
  pick: KameoPick | null;
  /** There are combos to train for this duo. */
  available: boolean;
}

/**
 * The Kameos worth offering for a fighter: the recommended ones in order, then any other
 * Kameo that already has combos for this fighter, by name. Kameos with neither are left out.
 */
export function kameoOptions(
  roster: Roster,
  fighter: FighterProfile,
  availableDuos: ReadonlySet<DuoId>,
): KameoOption[] {
  const isAvailable = (kameoId: string) => availableDuos.has(duoId(fighter.id, kameoId));

  const recommended = fighter.picks.flatMap((pick, index): KameoOption[] => {
    const kameo = findKameo(roster, pick.kameoId);
    return kameo ? [{ kameo, rank: index + 1, pick, available: isAvailable(kameo.id) }] : [];
  });

  const others = roster.kameos
    .filter((kameo) => isAvailable(kameo.id) && !fighter.picks.some((pick) => pick.kameoId === kameo.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((kameo): KameoOption => ({ kameo, rank: null, pick: null, available: true }));

  return [...recommended, ...others];
}

/**
 * Turns a saved or requested selection into a valid one: an unknown fighter falls back
 * to `fallback`, and an unknown Kameo to the fighter's ideal partner.
 */
export function resolveDuo(
  roster: Roster,
  requested: Partial<DuoSelection> | null,
  fallback: DuoSelection,
): DuoSelection {
  const fighter = requested?.fighterId ? findFighter(roster, requested.fighterId) : undefined;
  if (!fighter) return fallback;

  const kameoId =
    requested?.kameoId && findKameo(roster, requested.kameoId) ? requested.kameoId : idealKameoId(fighter);
  return kameoId ? { fighterId: fighter.id, kameoId } : fallback;
}
