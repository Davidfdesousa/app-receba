import { LitElement, css, html, nothing, svg, type SVGTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { ps5Layout, type GlyphShape } from '../../lib/combo/controller-layout.ts';
import { isInputToken } from '../../lib/combo/notation.ts';
import { baseStyles } from '../../styles/shared.styles.ts';

export type InputGlyphSize = 'inline' | 'sm' | 'md' | 'lg';

/** Stroke symbols drawn inside the caps (24×24). */
const symbols: Record<Exclude<GlyphShape, 'trigger'>, SVGTemplateResult> = {
  square: svg`<rect x="7" y="7" width="10" height="10" rx="1" />`,
  triangle: svg`<path d="M12 5.8 18.6 17.2H5.4Z" />`,
  cross: svg`<path d="M7 7 17 17M17 7 7 17" />`,
  circle: svg`<circle cx="12" cy="12" r="6" />`,
  arrow: svg`<path d="M5 12h13M13 7l5 5-5 5" />`,
};

/**
 * One controller input, drawn from the controller layout — the only place the UI
 * shows a button. Takes a universal notation token (`1`, `F`, `K`…).
 *
 * @example <app-input-glyph token="2" size="sm"></app-input-glyph>
 */
@customElement('app-input-glyph')
export class AppInputGlyph extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        --_size: var(--size-input-md);

        display: inline-flex;
        flex: none;
        block-size: var(--_size);
        min-inline-size: var(--_size);
        vertical-align: middle;
      }

      :host([size='inline']) {
        --_size: var(--size-input-inline);
      }

      :host([size='sm']) {
        --_size: var(--size-input-sm);
      }

      :host([size='lg']) {
        --_size: var(--size-input-lg);
      }

      .cap {
        display: inline-grid;
        place-items: center;
        inline-size: var(--_size);
        block-size: 100%;
        border: 1px solid var(--color-border-input-cap);
        border-radius: var(--radius-input-cap);
        background: var(--color-bg-input-cap);
        box-shadow: var(--shadow-input-cap);
      }

      svg {
        inline-size: 62%;
        block-size: 62%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .direction {
        border-radius: var(--radius-input-direction);
        background: var(--color-bg-input-cap-direction);
        color: var(--color-content-input-direction);
      }

      [data-tone='triangle'] {
        color: var(--color-content-input-triangle);
      }

      [data-tone='circle'] {
        color: var(--color-content-input-circle);
      }

      [data-tone='cross'] {
        color: var(--color-content-input-cross);
      }

      [data-tone='square'] {
        color: var(--color-content-input-square);
      }

      .trigger {
        inline-size: auto;
        min-inline-size: calc(var(--_size) * 1.2);
        padding-inline: calc(var(--_size) * 0.24);
        border-color: transparent;
      }

      .caption {
        font-family: var(--typography-font-family-ui);
        font-size: calc(var(--_size) * 0.46);
        font-weight: var(--typography-figure-weight);
        line-height: 1;
        letter-spacing: var(--typography-label-letter-spacing);
      }

      [data-tone='kameo'] {
        background: var(--color-bg-input-kameo);
        color: var(--color-content-on-input-kameo);
      }

      [data-tone='amplify'] {
        background: var(--color-bg-input-amplify);
        color: var(--color-content-on-input-amplify);
      }

      [data-tone='grab'] {
        background: var(--color-bg-input-grab);
        color: var(--color-content-on-input-grab);
      }
    `,
  ];

  /** Universal notation token: 1 2 3 4, F B U D UF, K EX TH. */
  @property({ reflect: true }) token = '';
  @property({ reflect: true }) size: InputGlyphSize = 'md';

  override render() {
    if (!isInputToken(this.token)) return nothing;

    const glyph = ps5Layout[this.token];

    if (glyph.shape === 'trigger') {
      return html`<span class="cap trigger" data-tone=${glyph.tone} role="img" aria-label=${glyph.name}>
        <span class="caption" aria-hidden="true">${glyph.caption}</span>
      </span>`;
    }

    const rotation = glyph.rotation ? { transform: `rotate(${glyph.rotation}deg)` } : {};

    return html`<span
      class="cap ${glyph.shape === 'arrow' ? 'direction' : 'face'}"
      data-tone=${glyph.tone}
      role="img"
      aria-label=${glyph.name}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style=${styleMap(rotation)}>
        ${symbols[glyph.shape]}
      </svg>
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-input-glyph': AppInputGlyph;
  }
}
