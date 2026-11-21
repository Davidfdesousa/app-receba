import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/header/header.ts';
import '../components/icon/icon.ts';
import { appConfig } from '../config/app.config.ts';
import { AuthController } from '../controllers/auth.controller.ts';
import { DuoController } from '../controllers/duo.controller.ts';
import { availableDuos, comboSetLoaders } from '../data/combo-sets/index.ts';
import { defaultDuo, roster } from '../data/roster.ts';
import '../pages/trainer-page.ts';
import { baseStyles } from '../styles/shared.styles.ts';

/**
 * Application shell. Owns the auth state and the picked duo (with its lazily loaded
 * combos). The trainer is public and shows in every auth state; signing in with Google
 * stays available for future features (favourites).
 * Pages stay stateless: data goes down as properties, actions come up as events.
 */
@customElement('app-root')
export class AppRoot extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-block-size: 100dvh;
      }

      main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      main > * {
        flex: 1;
      }

      .notice {
        inline-size: 100%;
        max-inline-size: var(--layout-content-max-width);
        margin-inline: auto;
        padding-block-start: var(--spacing-stack-sm);
        padding-inline: var(--spacing-inset-md);
      }

      .auth-error {
        display: flex;
        align-items: center;
        gap: var(--spacing-inline-xs);
        margin: 0;
        padding-block: var(--spacing-inset-sm);
        padding-inline: var(--spacing-inset-md);
        border: 1px solid var(--color-border-danger);
        border-radius: var(--radius-control);
        background: var(--color-bg-danger-subtle);
        color: var(--color-content-danger);
        font-size: var(--typography-body-sm-size);
      }
    `,
  ];

  private readonly auth = new AuthController(this);
  private readonly duo = new DuoController(this, {
    roster,
    loaders: comboSetLoaders,
    fallback: defaultDuo,
  });

  override render() {
    const { state, pending } = this.auth;
    const user = state.status === 'signed-in' ? state.user : null;
    const error = state.status === 'signed-out' ? state.error : undefined;

    return html`
      <app-header
        brand=${appConfig.title}
        .user=${user}
        ?can-sign-in=${state.status === 'signed-out'}
        ?pending=${pending}
        @sign-in=${() => this.auth.signInWithGoogle()}
        @sign-out=${() => this.auth.signOut()}
      ></app-header>
      ${
        error
          ? html`<div class="notice">
              <p class="auth-error" role="alert"><app-icon name="alert-circle"></app-icon>${error.message}</p>
            </div>`
          : nothing
      }
      <main>
        <app-trainer-page
          .roster=${roster}
          .selection=${this.duo.selection}
          .availableDuos=${availableDuos}
          .comboSet=${this.duo.comboSet}
          status=${this.duo.status}
          @duo-change=${(event: HTMLElementEventMap['duo-change']) => {
            this.duo.select(event.detail);
          }}
        ></app-trainer-page>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
