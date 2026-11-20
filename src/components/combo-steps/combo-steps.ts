import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { stepKindLabels, stepNote } from '../../lib/combo/combo-summary.ts';
import type { ComboStep } from '../../lib/combo/combo.types.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../input-sequence/input-sequence.ts';
import '../notation-text/notation-text.ts';

export interface StepSeekDetail {
  stepIndex: number;
}

/**
 * Numbered list of the combo steps. The active step is outlined in gold and the
 * finished ones fade. Choosing a step jumps the playback there.
 *
 * @fires step-seek - A step was chosen. Detail: `{ stepIndex }`.
 */
@customElement('app-combo-steps')
export class AppComboSteps extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      ol {
        display: grid;
        gap: var(--spacing-stack-2xs);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .row {
        display: grid;
        grid-template-columns: 2.125rem minmax(0, 1fr) auto;
        gap: var(--spacing-inline-sm);
        align-items: center;
        inline-size: 100%;
        min-block-size: 2.75rem;
        padding-block: var(--spacing-inset-sm);
        padding-inline: var(--spacing-inset-md);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-control);
        background: var(--color-bg-default);
        color: var(--color-content-default);
        font: inherit;
        text-align: start;
        cursor: pointer;
      }

      .row:hover {
        border-color: var(--color-border-strong);
      }

      .row.done {
        opacity: 0.55;
      }

      .row[aria-current='step'] {
        border-color: var(--color-border-brand);
        background: var(--color-bg-brand-subtle);
        opacity: 1;
      }

      .number {
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-title-md-size);
        font-weight: var(--typography-figure-weight);
        line-height: 1;
      }

      .row[aria-current='step'] .number {
        color: var(--color-content-brand);
      }

      .body {
        display: grid;
        gap: var(--spacing-stack-2xs);
        justify-items: start;
      }

      .label {
        font-size: var(--typography-body-md-size);
      }

      .note {
        color: var(--color-content-accent);
        font-weight: var(--typography-label-weight);
      }

      .kind {
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-label-size);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        white-space: nowrap;
      }

      .kind[data-kind='normal'] {
        color: var(--color-content-step-normal);
      }

      .kind[data-kind='special'] {
        color: var(--color-content-step-special);
      }

      .kind[data-kind='kameo'] {
        color: var(--color-content-step-kameo);
      }

      .kind[data-kind='air'] {
        color: var(--color-content-step-air);
      }

      .kind[data-kind='finisher'] {
        color: var(--color-content-step-finisher);
      }

      @media (max-width: 37.5rem) {
        .row {
          grid-template-columns: 1.75rem minmax(0, 1fr);
          padding-inline: var(--spacing-inset-sm);
        }

        .kind {
          grid-column: 2;
        }
      }
    `,
  ];

  @property({ attribute: false }) steps: readonly ComboStep[] = [];
  /** Step being played; earlier steps show as done. -1 before the start. */
  @property({ type: Number, attribute: 'active-index' }) activeIndex = -1;

  private seek(stepIndex: number): void {
    this.dispatchEvent(
      new CustomEvent<StepSeekDetail>('step-seek', { detail: { stepIndex }, bubbles: true, composed: true }),
    );
  }

  override render() {
    return html`<ol aria-label="Passos">
      ${this.steps.map((step, index) => {
        const note = stepNote(step);

        return html`<li>
          <button
            type="button"
            class="row ${index < this.activeIndex ? 'done' : ''}"
            aria-current=${index === this.activeIndex ? 'step' : 'false'}
            @click=${() => {
              this.seek(index);
            }}
          >
            <span class="number">${index + 1}</span>
            <span class="body">
              <app-input-sequence notation=${step.notation} size="sm"></app-input-sequence>
              <span class="label">
                <app-notation-text text=${step.label}></app-notation-text>
                ${note ? html`<span class="note"><app-notation-text text=${note}></app-notation-text></span>` : nothing}
              </span>
            </span>
            <span class="kind" data-kind=${step.kind}>${stepKindLabels[step.kind]}</span>
          </button>
        </li>`;
      })}
    </ol>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-combo-steps': AppComboSteps;
  }

  interface HTMLElementEventMap {
    'step-seek': CustomEvent<StepSeekDetail>;
  }
}
