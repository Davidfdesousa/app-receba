import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/button/button.ts';
import '../components/combo-trainer/combo-trainer.ts';
import '../components/duo-picker/duo-picker.ts';
import type { ComboSetStatus } from '../controllers/duo.controller.ts';
import type { ComboSet } from '../lib/combo/combo.types.ts';
import { findFighter, findKameo, kameoOptions } from '../lib/roster/roster.ts';
import type { DuoId, DuoSelection, FighterProfile, Roster } from '../lib/roster/roster.types.ts';
import { baseStyles } from '../styles/shared.styles.ts';

/**
 * Trainer page: the pitch, the duo picker and the trainer for the picked duo.
 * Stateless: data comes in as properties; `duo-change` bubbles up from the picker.
 */
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
        padding-block: var(--spacing-inset-md) var(--spacing-inset-xl);
        padding-inline: var(--spacing-inset-md);
      }

      .hero {
        position: relative;
        display: grid;
        gap: var(--spacing-stack-xs);
        margin-block-end: var(--spacing-stack-md);
        padding-block-end: var(--spacing-stack-md);
      }

      /* The burning edge under the pitch, as on the official site's sections. */
      .hero::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        block-size: var(--size-fire-edge);
        background: var(--gradient-fire);
        box-shadow: var(--shadow-fire);
      }

      p {
        margin: 0;
      }

      .eyebrow {
        color: var(--color-content-brand);
        font-family: var(--typography-font-family-label);
        font-size: var(--typography-label-size);
        font-weight: var(--typography-display-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-display-lg-size);
        font-weight: var(--typography-display-weight);
        line-height: var(--typography-display-line-height);
        letter-spacing: var(--typography-display-letter-spacing);
        text-transform: uppercase;
        text-wrap: balance;
        background: var(--gradient-brand-metal);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }

      h1 .brand {
        color: var(--color-content-brand);
        -webkit-text-fill-color: var(--color-content-brand);
      }

      .lede {
        max-inline-size: 62ch;
        color: var(--color-content-subtle);
      }

      .lede strong {
        color: var(--color-content-strong);
      }

      .content {
        display: grid;
        gap: var(--spacing-stack-md);
      }

      .duo-title {
        margin: 0;
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-title-md-size);
        font-weight: var(--typography-display-weight);
        line-height: var(--typography-title-line-height);
        letter-spacing: var(--typography-display-letter-spacing);
        text-transform: uppercase;
      }

      .duo-title .plus {
        color: var(--color-content-brand);
      }

      .trainer[aria-busy='true'] {
        opacity: 0.6;
        transition: opacity var(--motion-duration-normal) var(--motion-easing-standard);
      }

      .notice {
        display: grid;
        gap: var(--spacing-stack-sm);
        justify-items: start;
        padding-block: var(--spacing-inset-lg);
        padding-inline: var(--spacing-inset-md);
        border: 1px dashed var(--color-border-strong);
        border-radius: var(--radius-surface);
        background: var(--color-bg-default);
      }

      .notice h3 {
        margin: 0;
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-title-sm-size);
        letter-spacing: var(--typography-display-letter-spacing);
        text-transform: uppercase;
      }

      .notice p {
        max-inline-size: 60ch;
        color: var(--color-content-subtle);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-inline-xs);
      }

      .link {
        display: inline-flex;
        align-items: center;
        min-block-size: 2.5rem;
        color: var(--color-content-brand);
        /* The HUD face: Cinzel's "1" reads as "I" in "mk1kombo". */
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-body-md-size);
        font-weight: var(--typography-display-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-underline-offset: 0.25em;
      }

      .link:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-border-focus);
        outline-offset: var(--focus-ring-offset);
      }

      @media (min-width: 53.75rem) {
        :host {
          padding-block-start: var(--spacing-inset-lg);
        }

        .hero {
          margin-block-end: var(--spacing-stack-lg);
          padding-block-end: var(--spacing-stack-lg);
        }

        .content {
          gap: var(--spacing-stack-lg);
        }

        .notice {
          padding-inline: var(--spacing-inset-lg);
        }
      }
    `,
  ];

  @property({ attribute: false }) roster: Roster | null = null;
  @property({ attribute: false }) selection: DuoSelection | null = null;
  @property({ attribute: false }) availableDuos: ReadonlySet<DuoId> = new Set();
  @property({ attribute: false }) comboSet: ComboSet | null = null;
  @property() status: ComboSetStatus = 'loading';

  private requestDuo(selection: DuoSelection): void {
    this.dispatchEvent(new CustomEvent('duo-change', { detail: selection, bubbles: true, composed: true }));
  }

  private renderHero() {
    return html`<header class="hero">
      <p class="eyebrow">Mortal Kombat 1 · controle de PS5</p>
      <h1>Escolha a dupla. Aperte play. <span class="brand">Receba!!</span></h1>
      <p class="lede">
        Chega de caçar combo em fórum e pausar vídeo para decorar. O <strong>Receba!!</strong> indica o Kameo
        que a comunidade mais usa com o seu lutador e mostra cada botão no tempo certo, até o combo sair na
        mão.
      </p>
    </header>`;
  }

  /** "Em breve" card, with a shortcut to a recommended Kameo that already has combos. */
  private renderMissing(roster: Roster, fighter: FighterProfile, kameoName: string) {
    const ready = kameoOptions(roster, fighter, this.availableDuos).find(
      (option) => option.rank !== null && option.available,
    );

    return html`<div class="notice" role="status">
      <h3>Combos de ${fighter.name} + ${kameoName} em breve</h3>
      <p>
        Ainda não temos combos conferidos para essa dupla. Enquanto isso, veja o que a comunidade
        publicou${ready ? ` ou treine com ${ready.kameo.name}, outro Kameo indicado` : ''}.
      </p>
      <div class="actions">
        ${
          ready
            ? html`<app-button
                @click=${() => {
                  this.requestDuo({ fighterId: fighter.id, kameoId: ready.kameo.id });
                }}
                >Treinar com ${ready.kameo.name}</app-button
              >`
            : nothing
        }
        <a class="link" href=${fighter.communityUrl} target="_blank" rel="noopener noreferrer"
          >Combos de ${fighter.name} no mk1kombo ↗</a
        >
      </div>
    </div>`;
  }

  private renderTrainer(roster: Roster, selection: DuoSelection) {
    const fighter = findFighter(roster, selection.fighterId);
    const kameo = findKameo(roster, selection.kameoId);
    if (!fighter || !kameo) return nothing;

    const { comboSet, status } = this;
    const loadingOther = status === 'loading' && comboSet !== null;
    const showsSet = comboSet !== null && (status === 'ready' || loadingOther);

    return html`<section class="content" aria-labelledby="duo-title">
      <h2 id="duo-title" class="duo-title">${fighter.name} <span class="plus">+</span> ${kameo.name}</h2>
      ${
        showsSet
          ? html`<app-combo-trainer
              class="trainer"
              aria-busy=${loadingOther ? 'true' : 'false'}
              .comboSet=${comboSet}
            ></app-combo-trainer>`
          : status === 'missing'
            ? this.renderMissing(roster, fighter, kameo.name)
            : status === 'error'
              ? html`<div class="notice" role="alert">
                  <h3>Não foi possível carregar os combos</h3>
                  <p>Confira a conexão e recarregue a página.</p>
                </div>`
              : html`<div class="notice" role="status"><p>Carregando combos…</p></div>`
      }
    </section>`;
  }

  override render() {
    const { roster, selection } = this;

    return html`
      ${this.renderHero()}
      ${
        roster && selection
          ? html`<div class="content">
              <app-duo-picker
                .roster=${roster}
                .selection=${selection}
                .availableDuos=${this.availableDuos}
              ></app-duo-picker>
              ${this.renderTrainer(roster, selection)}
            </div>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-trainer-page': AppTrainerPage;
  }
}
