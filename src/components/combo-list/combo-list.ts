import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { comboListSummary } from '../../lib/combo/combo-summary.ts';
import type { Combo, ComboCategory } from '../../lib/combo/combo.types.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../notation-text/notation-text.ts';

export interface ComboSelectDetail {
  comboId: string;
}

const tabs: readonly { category: ComboCategory; label: string }[] = [
  { category: 'combo', label: 'Combos' },
  { category: 'piece', label: 'Peças' },
];

function groupCombos(combos: readonly Combo[]): [group: string, combos: Combo[]][] {
  const groups = new Map<string, Combo[]>();
  for (const combo of combos) {
    const list = groups.get(combo.group);
    if (list) list.push(combo);
    else groups.set(combo.group, [combo]);
  }
  return [...groups];
}

/**
 * Picks a combo. Full combos and practice pieces live in two tabs (only when the set has
 * both), grouped by `group`. Mobile first: a horizontal strip that scrolls and snaps,
 * which becomes a vertical list with group titles from ~860px.
 *
 * @fires combo-select - A combo was chosen. Detail: `{ comboId }`.
 */
@customElement('app-combo-list')
export class AppComboList extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        min-inline-size: 0;
      }

      .tabs {
        display: flex;
        gap: var(--spacing-inline-2xs);
        margin-block-end: var(--spacing-stack-sm);
      }

      [role='tab'] {
        flex: 1;
        min-block-size: 2.75rem;
        padding-inline: var(--spacing-inset-sm);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-control);
        background: var(--color-bg-default);
        color: var(--color-content-subtle);
        font-family: var(--typography-font-family-label);
        font-size: var(--typography-body-sm-size);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        cursor: pointer;
      }

      [role='tab']:hover {
        background: var(--color-bg-neutral-hover);
      }

      [role='tab'][aria-selected='true'] {
        border-color: var(--color-border-brand);
        background: var(--color-bg-brand-subtle);
        color: var(--color-content-brand);
      }

      .list {
        display: flex;
        gap: var(--spacing-inline-xs);
        padding-block-end: var(--spacing-stack-2xs);
        overflow-x: auto;
        overscroll-behavior-inline: contain;
        scroll-snap-type: x proximity;
        scroll-padding-inline: var(--spacing-inline-2xs);
      }

      .group-title {
        display: none;
        margin-block: var(--spacing-stack-xs) 0;
        margin-inline: var(--spacing-inline-2xs);
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-label-size);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
      }

      .group-title:first-child {
        margin-block-start: 0;
      }

      .item {
        display: grid;
        flex: 0 0 12.5rem;
        align-content: start;
        scroll-snap-align: start;
        gap: var(--spacing-stack-2xs);
        min-block-size: 2.75rem;
        padding-block: var(--spacing-inset-sm);
        padding-inline: var(--spacing-inset-md);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-control);
        background: var(--color-bg-default);
        color: var(--color-content-default);
        font: inherit;
        text-align: start;
        cursor: pointer;
      }

      .item:hover {
        border-color: var(--color-border-strong);
      }

      .item[aria-current='true'] {
        border-color: var(--color-border-brand);
        background: var(--color-bg-brand-subtle);
      }

      .title {
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-title-sm-size);
        font-weight: var(--typography-display-weight);
        line-height: var(--typography-title-line-height);
      }

      .summary {
        color: var(--color-content-muted);
        font-size: var(--typography-body-sm-size);
        line-height: var(--typography-title-line-height);
      }

      .item[aria-current='true'] .summary {
        color: var(--color-content-subtle);
      }

      @media (min-width: 53.75rem) {
        .list {
          display: grid;
          gap: var(--spacing-stack-2xs);
          padding-block-end: 0;
          overflow-x: visible;
        }

        .group-title {
          display: block;
        }
      }
    `,
  ];

  @property({ attribute: false }) combos: readonly Combo[] = [];
  @property({ attribute: 'selected-id' }) selectedId: string | null = null;

  @state() private tab: ComboCategory = 'combo';

  @query('.list') private readonly listElement!: HTMLElement | null;

  /** Tabs for the categories this set has. */
  private get tabs() {
    return tabs.filter((tab) => this.combos.some((combo) => combo.category === tab.category));
  }

  override willUpdate(changed: PropertyValues): void {
    // Open the tab that holds the selected combo; switching tabs by hand is kept otherwise.
    if (changed.has('selectedId') || changed.has('combos')) {
      const selected = this.combos.find((combo) => combo.id === this.selectedId);
      if (selected) this.tab = selected.category;
      else if (!this.tabs.some((tab) => tab.category === this.tab))
        this.tab = this.tabs[0]?.category ?? 'combo';
    }
  }

  override updated(changed: PropertyValues): void {
    if (changed.has('selectedId') || changed.has('tab')) this.revealSelected();
  }

  /** In the horizontal strip, scrolls the selected item into view without moving the page. */
  private revealSelected(): void {
    const list = this.listElement;
    const item = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !item || list.scrollWidth <= list.clientWidth) return;

    const listBox = list.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();
    if (itemBox.left >= listBox.left && itemBox.right <= listBox.right) return;

    // Align the item's start, as the scroll snap does, so the snap does not pull it back.
    list.scrollLeft += itemBox.left - listBox.left;
  }

  private select(comboId: string): void {
    this.dispatchEvent(
      new CustomEvent<ComboSelectDetail>('combo-select', {
        detail: { comboId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onTabKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const available = this.tabs;
    const index = available.findIndex((tab) => tab.category === this.tab);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? available.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + available.length) % available.length;

    this.tab = available[next]!.category;
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`#tab-${this.tab}`)?.focus();
    });
  }

  override render() {
    const visible = this.combos.filter((combo) => combo.category === this.tab);
    const available = this.tabs;
    const tabbed = available.length > 1;

    return html`
      <div class="tabs" role="tablist" aria-label="Tipo" ?hidden=${!tabbed} @keydown=${this.onTabKeydown}>
        ${available.map(
          (tab) =>
            html`<button
              id="tab-${tab.category}"
              type="button"
              role="tab"
              aria-selected=${tab.category === this.tab ? 'true' : 'false'}
              aria-controls="panel"
              tabindex=${tab.category === this.tab ? 0 : -1}
              @click=${() => (this.tab = tab.category)}
            >
              ${tab.label}
            </button>`,
        )}
      </div>
      <div
        id="panel"
        class="list"
        role=${tabbed ? 'tabpanel' : 'group'}
        aria-labelledby=${tabbed ? `tab-${this.tab}` : nothing}
        aria-label=${tabbed ? nothing : 'Combos'}
      >
        ${groupCombos(visible).map(
          ([group, combos]) => html`
            <p class="group-title">${group}</p>
            ${combos.map(
              (combo) =>
                html`<button
                  class="item"
                  type="button"
                  aria-current=${combo.id === this.selectedId ? 'true' : 'false'}
                  @click=${() => {
                    this.select(combo.id);
                  }}
                >
                  <span class="title"><app-notation-text text=${combo.title}></app-notation-text></span>
                  <span class="summary">${comboListSummary(combo)}</span>
                </button>`,
            )}
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-combo-list': AppComboList;
  }

  interface HTMLElementEventMap {
    'combo-select': CustomEvent<ComboSelectDetail>;
  }
}
