export type StepKind = 'normal' | 'special' | 'kameo' | 'air' | 'finisher';

export interface ComboStep {
  /** Universal notation for this step, e.g. `D B 3+EX`. See notation.ts. */
  notation: string;
  kind: StepKind;
  /** Short name of the move. Accepts inline notation in brackets: `Pulo e [2 2] no ar`. */
  label: string;
  /** Extra instruction shown while the step runs. Accepts inline notation too. */
  note?: string;
  /** The fighters swap sides after this step. */
  swapsSide?: boolean;
  /** A button is held during this step, so the next one starts later. */
  holds?: boolean;
}

export type ComboCategory = 'combo' | 'piece';

export interface ComboSource {
  site: string;
  url: string;
  reference: string;
  author: string;
  /** Word shown before the reference, e.g. `Vídeo` for `Vídeo 0:58 por …`. Defaults to `Combo`. */
  label?: string;
}

export interface Combo {
  id: string;
  category: ComboCategory;
  /** Section in the list, e.g. `1 barra` or `Finalizar`. */
  group: string;
  /** Accepts inline notation in brackets. */
  title: string;
  description?: string;
  damage?: number;
  hits?: number;
  position?: string;
  source?: ComboSource;
  steps: readonly ComboStep[];
}

export interface ComboSet {
  id: string;
  game: string;
  fighter: string;
  kameo: string;
  /** Combo opened when there is no saved choice; falls back to the first one. */
  defaultComboId?: string;
  combos: readonly Combo[];
}
