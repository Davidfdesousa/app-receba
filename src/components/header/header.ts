import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { AuthUser } from '../../services/auth/index.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../avatar/avatar.ts';
import '../button/button.ts';
import '../controller-picker/controller-picker.ts';
import '../icon/icon.ts';
import '../theme-toggle/theme-toggle.ts';

/**
 * @fires sign-in - The user asked to sign in with Google.
 * @fires sign-out - The user asked to sign out.
 */
@customElement('app-header')
export class AppHeader extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        border-block-end: var(--size-accent-rule) solid var(--color-border-brand);
        background: var(--color-bg-bar);
      }

      .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-inline-md);
        max-inline-size: var(--layout-content-max-width);
        margin-inline: auto;
        padding-block: var(--spacing-inset-sm);
        padding-inline: var(--spacing-inset-md);
      }

      .brand {
        margin: 0;
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-title-sm-size);
        font-weight: var(--typography-display-weight);
        line-height: 1;
        letter-spacing: var(--typography-display-letter-spacing);
        text-transform: uppercase;
        color: var(--color-content-strong);
      }

      .brand-accent {
        color: var(--color-content-brand);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-inline-xs);
      }

      .user {
        display: flex;
        align-items: center;
        gap: var(--spacing-inline-xs);
        color: var(--color-content-subtle);
        font-size: var(--typography-body-sm-size);
      }

      .user-name {
        display: none;
      }

      @media (min-width: 40rem) {
        .user-name {
          display: inline;
        }
      }
    `,
  ];

  @property() brand = '';
  @property({ attribute: false }) user: AuthUser | null = null;
  /** Shows the "Entrar" button (signed out, with auth configured). */
  @property({ type: Boolean, attribute: 'can-sign-in' }) canSignIn = false;
  @property({ type: Boolean }) pending = false;

  private requestSignIn(): void {
    this.dispatchEvent(new CustomEvent('sign-in', { bubbles: true, composed: true }));
  }

  private requestSignOut(): void {
    this.dispatchEvent(new CustomEvent('sign-out', { bubbles: true, composed: true }));
  }

  private renderUser(user: AuthUser) {
    const name = user.displayName ?? user.email ?? 'Usuário';

    return html`
      <div class="user">
        <app-avatar name=${name} src=${user.photoUrl ?? nothing}></app-avatar>
        <span class="user-name">${name}</span>
      </div>
      <app-button variant="ghost" size="sm" @click=${this.requestSignOut}>
        <app-icon slot="icon-start" name="log-out"></app-icon>
        Sair
      </app-button>
    `;
  }

  private renderSignIn() {
    return html`<app-button
      variant="secondary"
      size="sm"
      ?loading=${this.pending}
      @click=${this.requestSignIn}
    >
      <app-icon slot="icon-start" name="log-in"></app-icon>
      Entrar
    </app-button>`;
  }

  /** "Receba!!" → "Receba" + red "!!". */
  private renderBrand() {
    const match = /^(.*?)(!+)$/.exec(this.brand);
    return match ? html`${match[1]}<span class="brand-accent">${match[2]}</span>` : this.brand;
  }

  override render() {
    return html`
      <header class="container">
        <p class="brand">${this.renderBrand()}</p>
        <div class="actions">
          ${this.user ? this.renderUser(this.user) : this.canSignIn ? this.renderSignIn() : nothing}
          <app-controller-picker></app-controller-picker>
          <app-theme-toggle></app-theme-toggle>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-header': AppHeader;
  }

  interface HTMLElementEventMap {
    'sign-in': CustomEvent<void>;
    'sign-out': CustomEvent<void>;
  }
}
