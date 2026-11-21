import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { stepNote } from '../../lib/combo/combo-summary.ts';
import type { ComboStep } from '../../lib/combo/combo.types.ts';
import { lastIndexAtOrBefore, type Timeline } from '../../lib/combo/timeline.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../input-sequence/input-sequence.ts';
import '../notation-text/notation-text.ts';

export type InputDisplayState = 'ready' | 'count-in' | 'running' | 'ended';

/**
 * The big panel: the step to play now, lit press by press, with its note and what
 * comes next. Before starting it previews the first step dimmed (no play icon: the
 * panel is not a button), then shows the 3-2-1 count-in and the result.
 */
@customElement('app-input-display')
export class AppInputDisplay extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      /* Every row keeps a fixed minimum height, so nothing jumps while the combo plays. */
      .display {
        display: grid;
        align-content: start;
        gap: var(--spacing-stack-2xs);
        padding-block: var(--spacing-inset-sm) var(--spacing-inset-xs);
        padding-inline: var(--spacing-inset-md);
      }

      p {
        margin: 0;
      }

      .status {
        min-block-size: 1.5em;
        color: var(--color-content-strong);
        font-size: var(--typography-body-sm-size);
      }

      .step-count {
        margin-inline-end: var(--spacing-inline-xs);
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-ui);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
      }

      .current {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        min-block-size: calc(var(--size-input-lg) + var(--spacing-stack-2xs));
      }

      /* As tall as the large glyphs, so the count-in does not resize the panel. */
      .figure {
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-display);
        font-size: var(--size-input-lg);
        font-weight: var(--typography-display-weight);
        line-height: 1;
        letter-spacing: var(--typography-display-letter-spacing);
      }

      .note {
        min-block-size: 1.4em;
        color: var(--color-content-accent);
        font-size: var(--typography-body-sm-size);
        font-weight: var(--typography-label-weight);
      }

      .next {
        display: flex;
        align-items: center;
        min-block-size: calc(var(--size-input-sm) + var(--spacing-stack-2xs));
        color: var(--color-content-muted);
        font-size: var(--typography-body-sm-size);
      }

      @media (min-width: 40rem) {
        .display {
          padding-inline: var(--spacing-inset-lg);
        }
      }

      /* More air only when the screen is tall enough to spare it. */
      @media (min-width: 40rem) and (min-height: 37.5rem) {
        .display {
          gap: var(--spacing-stack-xs);
        }
      }
    `,
  ];

  @property({ attribute: false }) steps: readonly ComboStep[] = [];
  @property({ attribute: false }) timeline: Timeline | null = null;
  /** Combo time in ms (0 is the first input). */
  @property({ type: Number }) time = 0;
  @property({ reflect: true }) state: InputDisplayState = 'ready';
  /** 3, 2, 1 during the count-in. */
  @property({ attribute: false }) countIn: number | null = null;
  /** Result line shown at the end, e.g. "384 de dano em 18 golpes". */
  @property() summary = '';

  private renderFirst() {
    const first = this.steps[0];
    return first
      ? html`<app-notation-text size="sm" text="Primeiro: [${first.notation}]"></app-notation-text>`
      : nothing;
  }

  private renderRunning() {
    const inputs = this.timeline?.inputs ?? [];
    const current = lastIndexAtOrBefore(inputs, this.time);
    const stepIndex = current >= 0 ? inputs[current]!.stepIndex : 0;
    const step = this.steps[stepIndex];
    if (!step) return nothing;

    const firstOfStep = inputs.findIndex((input) => input.stepIndex === stepIndex);
    const litCount = current >= firstOfStep && firstOfStep >= 0 ? current - firstOfStep + 1 : 0;
    const next = this.steps[stepIndex + 1];
    const note = stepNote(step);

    return html`
      <p class="status">
        <span class="step-count">Passo ${stepIndex + 1} de ${this.steps.length}</span>
        <app-notation-text text=${step.label}></app-notation-text>
      </p>
      <div class="current">
        <app-input-sequence notation=${step.notation} size="lg" .litCount=${litCount}></app-input-sequence>
      </div>
      <p class="note">${note ? html`<app-notation-text text=${note}></app-notation-text>` : nothing}</p>
      <p class="next">
        ${
          next
            ? html`<app-notation-text size="sm" text="Próximo: [${next.notation}]"></app-notation-text>`
            : 'Último passo'
        }
      </p>
    `;
  }

  private renderContent() {
    switch (this.state) {
      case 'ready': {
        const first = this.steps[0];
        return html`
          <p class="status">Pronto para começar</p>
          <div class="current">
            ${
              first
                ? html`<app-input-sequence
                    notation=${first.notation}
                    size="lg"
                    .litCount=${0}
                  ></app-input-sequence>`
                : nothing
            }
          </div>
          <p class="note"></p>
          <p class="next">
            ${first ? html`<app-notation-text size="sm" text="Primeiro passo: ${first.label}"></app-notation-text>` : nothing}
          </p>
        `;
      }
      case 'count-in':
        return html`
          <p class="status">Prepare</p>
          <div class="current"><span class="figure">${this.countIn ?? ''}</span></div>
          <p class="note"></p>
          <p class="next">${this.renderFirst()}</p>
        `;
      case 'running':
        return this.renderRunning();
      case 'ended':
        return html`
          <p class="status">Fim</p>
          <div class="current"><span class="figure">Feito</span></div>
          <p class="note">${this.summary}</p>
          <p class="next">Toque em Tocar para repetir</p>
        `;
    }
  }

  override render() {
    return html`<div class="display" aria-live="polite">${this.renderContent()}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-input-display': AppInputDisplay;
  }
}
