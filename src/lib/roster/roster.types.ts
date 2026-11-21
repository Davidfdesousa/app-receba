/** A Kameo partner (assist character). */
export interface Kameo {
  /** Stable slug, e.g. `sub-zero`. */
  id: string;
  name: string;
}

/** A Kameo the community recommends for a fighter, best first in `FighterProfile.picks`. */
export interface KameoPick {
  kameoId: string;
  /** Why players pick this partner, in Brazilian Portuguese. Accepts inline notation. */
  reason: string;
}

/** A playable fighter with the Kameos the community recommends for them. */
export interface FighterProfile {
  /** Stable slug, e.g. `johnny-cage`. */
  id: string;
  name: string;
  /** Recommended partners, best first. The first one is the ideal partner. */
  picks: readonly KameoPick[];
  /** Community combo list for this fighter, for duos we have not covered yet. */
  communityUrl: string;
}

export interface RecommendationSource {
  label: string;
  url: string;
}

/** Everything the duo picker needs: who can be picked and who goes well together. */
export interface Roster {
  fighters: readonly FighterProfile[];
  kameos: readonly Kameo[];
  /** Where the recommendations come from, shown to the player. */
  sources: readonly RecommendationSource[];
}

/** Fighter plus Kameo, e.g. `ghostface+scorpion`. */
export type DuoId = `${string}+${string}`;

export interface DuoSelection {
  fighterId: string;
  kameoId: string;
}
