import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { ControllerLayoutController } from '../../controllers/controller-layout.controller.ts';
import { controllers, type ControllerId } from '../../lib/combo/controller-layout.ts';
import { selectController } from '../../lib/controller-preference.ts';
import { baseStyles } from '../../styles/shared.styles.ts';

const shortLabels: Readonly<Record<ControllerId, string>> = {
  playstation: 'PS',
  xbox: 'Xbox',
};

/**
 * Picks the pad whose buttons the whole app shows: PlayStation (default) or Xbox.
 * The choice is shared through `controllerStore` and remembered in the browser.
 */
@customElement('app-controller-picker')
export class AppControllerPicker extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: inline-flex;
      }

      .segmented {
        display: inline-flex;
        border: 1px solid var(--color-border-strong);
        border-radius: var(--radius-control);
      }

      button {
        min-block-size: 2rem;
        min-inline-size: 2.75rem;
        padding-inline: var(--spacing-inset-sm);
        border: 0;
        background: transparent;
        color: var(--color-content-subtle);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-label-size);
        font-weight: var(--typography-figure-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        cursor: pointer;
      }

      button + button {
        border-inline-start: 1px solid var(--color-border-strong);
      }

      button:hover {
        background: var(--color-bg-neutral-hover);
      }

      button[aria-pressed='true'] {
        background: var(--color-bg-brand-subtle);
        color: var(--color-content-strong);
        box-shadow: inset 0 0 0 1px var(--color-border-brand);
      }

      button:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-border-focus);
        outline-offset: var(--focus-ring-offset);
      }
    `,
  ];

  private readonly controller = new ControllerLayoutController(this);

  override render() {
    return html`<div class="segmented" role="group" aria-label="Controle">
      ${controllers.map(
        ({ id, label }) =>
          html`<button
            type="button"
            aria-pressed=${id === this.controller.id ? 'true' : 'false'}
            aria-label=${label}
            title="Botões do controle de ${label}"
            @click=${() => {
              selectController(id);
            }}
          >
            ${shortLabels[id]}
          </button>`,
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-controller-picker': AppControllerPicker;
  }
}
