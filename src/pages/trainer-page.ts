import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/combo-trainer/combo-trainer.ts';
import type { ComboSet } from '../lib/combo/combo.types.ts';
import { baseStyles } from '../styles/shared.styles.ts';

/** Combo trainer page. Stateless: the combo set comes in as a property. */
@customElement('app-trainer-page')
export class AppTrainerPage extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        inline-size: 100%;
        max-inline-size: var(--layout-content-max-width);
        margin-inline: auto;
        padding-block: var(--spacing-inset-lg) var(--spacing-inset-xl);
        padding-inline: var(--spacing-inset-md);
      }

      .intro {
        margin-block-end: var(--spacing-stack-lg);
      }

      h1 {
        margin: 0;
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-display-lg-size);
        font-weight: var(--typography-display-weight);
        line-height: var(--typography-display-line-height);
        letter-spacing: var(--typography-display-letter-spacing);
        text-transform: uppercase;
        background: var(--gradient-brand-metal);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }

      .lede {
        max-inline-size: 60ch;
        margin-block: var(--spacing-stack-xs) 0;
        color: var(--color-content-subtle);
      }

      @media (max-width: 53.75rem) {
        .intro {
          margin-block-end: var(--spacing-stack-md);
        }
      }
    `,
  ];

  @property({ attribute: false }) comboSet: ComboSet | null = null;

  override render() {
    const set = this.comboSet;
    if (!set) return nothing;

    return html`
      <header class="intro">
        <h1>${set.fighter} + ${set.kameo}</h1>
        <p class="lede">Combos de ${set.game} no controle de PS5. Escolha um combo e toque em Tocar.</p>
      </header>
      <app-combo-trainer .comboSet=${set}></app-combo-trainer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-trainer-page': AppTrainerPage;
  }
}
