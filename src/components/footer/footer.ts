import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { baseStyles, visuallyHidden } from '../../styles/shared.styles.ts';

/** Site footer with the author credit, linking to their profile. */
@customElement('app-footer')
export class AppFooter extends LitElement {
  static override styles = [
    baseStyles,
    visuallyHidden,
    css`
      :host {
        display: block;
        border-block-start: 1px solid var(--color-border-default);
        background: var(--color-bg-bar);
      }

      p {
        max-inline-size: var(--layout-content-max-width);
        margin: 0 auto;
        padding-block: var(--spacing-inset-md);
        padding-inline: var(--spacing-inset-md);
        color: var(--color-content-muted);
        font-size: var(--typography-body-sm-size);
        text-align: center;
      }

      a {
        color: var(--color-content-strong);
        font-weight: var(--typography-label-weight);
        text-underline-offset: 0.2em;
      }

      a:hover {
        color: var(--color-content-brand);
      }

      a:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-border-focus);
        outline-offset: var(--focus-ring-offset);
      }
    `,
  ];

  @property({ attribute: 'author-name' }) authorName = '';
  @property({ attribute: 'author-url' }) authorUrl = '';

  override render() {
    return html`<p>
      Desenvolvido por
      <a href=${this.authorUrl} target="_blank" rel="noopener noreferrer"
        >${this.authorName}<span class="visually-hidden"> (LinkedIn, abre em nova aba)</span></a
      >
    </p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-footer': AppFooter;
  }
}
