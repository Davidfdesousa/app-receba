import type { Combo, ComboStep, StepKind } from './combo.types.ts';
import { countMeterBars } from './notation.ts';

/** Display names for step kinds (pt-BR). */
export const stepKindLabels: Readonly<Record<StepKind, string>> = {
  normal: 'Normal',
  special: 'Especial',
  kameo: 'Kameo',
  air: 'No ar',
  finisher: 'Final',
};

/** Bars of meter the whole combo spends. */
export function comboMeterBars(combo: Pick<Combo, 'steps'>): number {
  return combo.steps.reduce((total, step) => total + countMeterBars(step.notation), 0);
}

export function formatMeterBars(bars: number): string {
  if (bars === 0) return 'sem barra';
  return bars === 1 ? '1 barra' : `${bars} barras`;
}

/** One-line summary for the combo list: "384 de dano, 18 golpes, 1 barra", or the piece description. */
export function comboListSummary(combo: Combo): string {
  if (combo.category === 'piece') return combo.description ?? '';

  const parts = [
    combo.damage === undefined ? null : `${combo.damage} de dano`,
    combo.hits === undefined ? null : `${combo.hits} golpes`,
    formatMeterBars(comboMeterBars(combo)),
  ];
  return parts.filter((part) => part !== null).join(', ');
}

const secondsFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Milliseconds as seconds with one decimal: 2350 → "2,4". */
export function formatSeconds(milliseconds: number): string {
  return secondsFormat.format(milliseconds / 1000);
}

/**
 * Extra instruction for a step, shown in the accent colour. Accepts inline notation.
 * The written note wins over the generic hold hint; a side swap is always mentioned.
 */
export function stepNote(step: ComboStep): string {
  const parts = [
    step.note ?? (step.holds ? 'Segure o botão' : null),
    step.swapsSide ? 'Troca de lado' : null,
  ];
  return parts.filter((part) => part !== null).join(' · ');
}
