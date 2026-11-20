import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { parseRichText } from '../../lib/combo/rich-text.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import type { InputGlyphSize } from '../input-glyph/input-glyph.ts';
import '../input-sequence/input-sequence.ts';

/**
 * Copy with inline notation in brackets: `Pulo e [2 2] no ar` renders the two
 * triangles with the same glyphs as the combo itself.
 *
 * @example <app-notation-text text="Segure [4] para atrasar o golpe"></app-notation-text>
 */
@customElement('app-notation-text')
export class AppNotationText extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: inline;
      }

      app-input-sequence {
        margin-inline: 0.08em;
      }
    `,
  ];

  @property() text = '';
  @property({ reflect: true }) size: InputGlyphSize = 'inline';

  override render() {
    return parseRichText(this.text).map((segment) =>
      segment.kind === 'text'
        ? segment.text
        : html`<app-input-sequence notation=${segment.notation} size=${this.size}></app-input-sequence>`,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-notation-text': AppNotationText;
  }
}
