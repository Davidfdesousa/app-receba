import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ControllerLayoutController } from '../../controllers/controller-layout.controller.ts';
import { describeNotation, type ControllerLayout } from '../../lib/combo/controller-layout.ts';
import { parseNotation, type NotationPart } from '../../lib/combo/notation.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../input-glyph/input-glyph.ts';
import type { InputGlyphSize } from '../input-glyph/input-glyph.ts';

function readNotation(notation: string, layout: ControllerLayout): { parts: NotationPart[]; label: string } {
  try {
    return { parts: parseNotation(notation), label: describeNotation(notation, layout) };
  } catch {
    // Data is validated in tests; a bad string should not take the page down.
    return { parts: [], label: '' };
  }
}

/**
 * A notation string as glyphs: `D B 3+EX` → ↓ ← (X + R2). Buttons pressed together
 * are joined by `+`; a `,` pause shows as a quiet comma.
 *
 * With `litCount`, the first N presses are lit and the rest dimmed, so the current
 * step can follow the playback.
 *
 * @example <app-input-sequence notation="F+2 1" size="sm"></app-input-sequence>
 */
@customElement('app-input-sequence')
export class AppInputSequence extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        --_size: var(--size-input-md);

        display: inline-flex;
        max-inline-size: 100%;
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

      .sequence {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: calc(var(--_size) * 0.2);
      }

      .press {
        display: inline-flex;
        align-items: center;
        gap: calc(var(--_size) * 0.08);
        transition: opacity var(--motion-duration-fast) var(--motion-easing-standard);
      }

      .joiner {
        color: var(--color-content-input-joiner);
        font-family: var(--typography-font-family-ui);
        font-size: max(var(--typography-min-size), calc(var(--_size) * 0.5));
        font-weight: var(--typography-label-weight);
        line-height: 1;
      }

      .pause {
        align-self: flex-end;
        color: var(--color-content-muted);
        font-size: max(var(--typography-min-size), calc(var(--_size) * 0.6));
        line-height: 1;
      }

      .press.unlit {
        opacity: 0.28;
      }

      .press.lit {
        animation: pop 160ms var(--motion-easing-standard);
      }

      @keyframes pop {
        40% {
          transform: scale(1.12);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .press {
          transition: none;
        }

        .press.lit {
          animation: none;
        }
      }
    `,
  ];

  /** Universal notation, e.g. `D B 3+EX` or `D F 3 , 1`. */
  @property() notation = '';
  @property({ reflect: true }) size: InputGlyphSize = 'md';
  /** Presses lit from the start; leave unset to show every press normally. */
  @property({ type: Number, attribute: 'lit-count' }) litCount: number | undefined;

  private readonly controller = new ControllerLayoutController(this);

  override render() {
    const { parts, label } = readNotation(this.notation, this.controller.layout);
    if (parts.length === 0) return nothing;

    const tracksProgress = typeof this.litCount === 'number';
    let pressIndex = 0;

    return html`<span class="sequence" role="img" aria-label=${label}>
      ${parts.map((part) => {
        if (part.kind === 'pause') return html`<span class="pause" aria-hidden="true">,</span>`;

        const index = pressIndex++;
        const state = tracksProgress ? (index < (this.litCount ?? 0) ? 'lit' : 'unlit') : '';

        return html`<span class="press ${state}">
          ${part.press.map(
            (token, tokenIndex) =>
              html`${tokenIndex > 0 ? html`<span class="joiner" aria-hidden="true">+</span>` : nothing}<app-input-glyph
                  token=${token}
                  size=${this.size}
                ></app-input-glyph>`,
          )}
        </span>`;
      })}
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-input-sequence': AppInputSequence;
  }
}
