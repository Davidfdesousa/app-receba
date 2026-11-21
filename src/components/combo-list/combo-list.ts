import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { comboListSummary } from '../../lib/combo/combo-summary.ts';
import type { Combo, ComboCategory } from '../../lib/combo/combo.types.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../notation-text/notation-text.ts';

export interface ComboSelectDetail {
  comboId: string;
}

/** What each kind of entry is, shown under the tabs so newcomers know what to pick. */
export const categoryInfo: readonly { category: ComboCategory; label: string; hint: string }[] = [
  {
    category: 'combo',
    label: 'Combos',
    hint: 'Combo é a sequência inteira, do primeiro golpe ao golpe final.',
  },
  {
    category: 'piece',
    label: 'Peças',
    hint: 'Peça é um trecho curto de um combo, para treinar uma parte de cada vez antes de juntar tudo.',
  },
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
 * both), grouped by `group`, with a line explaining the open tab. Mobile first: a
 * carousel that scrolls and snaps, with bullets for its position, which becomes a
 * vertical list with group titles from 640px (where the trainer gets two columns).
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
      }

      [role='tab'] {
        flex: 1;
        min-block-size: 2.5rem;
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

      .hint {
        margin-block: var(--spacing-stack-xs);
        color: var(--color-content-muted);
        font-size: var(--typography-caption-size);
        line-height: var(--typography-title-line-height);
      }

      .list {
        display: flex;
        gap: var(--spacing-inline-xs);
        overflow-x: auto;
        overscroll-behavior-inline: contain;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
      }

      .list::-webkit-scrollbar {
        display: none;
      }

      .dots {
        display: flex;
        justify-content: center;
        gap: var(--spacing-inline-2xs);
        margin-block-start: var(--spacing-stack-xs);
      }

      .dot {
        display: grid;
        place-items: center;
        inline-size: 1.25rem;
        block-size: 1rem;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
      }

      .dot::before {
        content: '';
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: var(--radius-full);
        background: var(--color-border-strong);
      }

      .dot[aria-current='true']::before {
        inline-size: 1rem;
        background: var(--color-bg-brand);
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
        flex: 0 0 13.5rem;
        align-content: start;
        scroll-snap-align: start;
        gap: var(--spacing-stack-2xs);
        min-block-size: 2.75rem;
        padding-block: var(--spacing-inset-sm);
        padding-inline: var(--spacing-inset-sm);
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
        font-size: var(--typography-body-md-size);
        font-weight: var(--typography-display-weight);
        line-height: var(--typography-title-line-height);
      }

      .summary {
        color: var(--color-content-muted);
        font-size: var(--typography-caption-size);
        line-height: var(--typography-title-line-height);
      }

      .item[aria-current='true'] .summary {
        color: var(--color-content-subtle);
      }

      @media (min-width: 40rem) {
        .list {
          display: grid;
          gap: var(--spacing-stack-2xs);
          overflow-x: visible;
        }

        .dots {
          display: none;
        }

        .group-title {
          display: block;
        }

        .item {
          padding-inline: var(--spacing-inset-md);
        }
      }
    `,
  ];

  @property({ attribute: false }) combos: readonly Combo[] = [];
  @property({ attribute: 'selected-id' }) selectedId: string | null = null;

  @state() private tab: ComboCategory = 'combo';
  /** Item the carousel is scrolled to, for the bullets. */
  @state() private position = 0;
  /** The carousel is wider than its box (the bullets only show then). */
  @state() private overflowing = false;

  @query('.list') private readonly listElement!: HTMLElement | null;

  private resizeObserver: ResizeObserver | null = null;

  /** Tabs for the categories this set has. */
  private get tabs() {
    return categoryInfo.filter((tab) => this.combos.some((combo) => combo.category === tab.category));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver === 'undefined') return;
    // Rotating the phone turns the list into a carousel: bring the selected combo back.
    this.resizeObserver = new ResizeObserver(() => {
      this.revealSelected();
      this.measure();
    });
    if (this.listElement) this.resizeObserver.observe(this.listElement);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  protected override firstUpdated(): void {
    if (this.listElement) this.resizeObserver?.observe(this.listElement);
  }

  /** Updates the bullets from the carousel's size and scroll position. */
  private measure(): void {
    const list = this.listElement;
    if (!list) return;

    const overflowing = list.scrollWidth > list.clientWidth + 1;
    const items = [...list.querySelectorAll<HTMLElement>('.item')];
    const start = list.getBoundingClientRect().left;
    const atEnd = overflowing && list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
    const position = atEnd
      ? items.length - 1
      : Math.max(
          0,
          items.findIndex((item) => item.getBoundingClientRect().right > start + 8),
        );

    if (overflowing !== this.overflowing) this.overflowing = overflowing;
    if (position !== this.position) this.position = position;
  }

  private scrollToItem(index: number): void {
    const list = this.listElement;
    const item = list?.querySelectorAll<HTMLElement>('.item')[index];
    if (!list || !item) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({
      left: list.scrollLeft + item.getBoundingClientRect().left - list.getBoundingClientRect().left,
      behavior: reduced ? 'auto' : 'smooth',
    });
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
    if (changed.has('selectedId') || changed.has('tab') || changed.has('combos')) {
      this.revealSelected();
      this.measure();
    }
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
    const hint = categoryInfo.find((info) => info.category === this.tab)?.hint ?? '';

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
      <p class="hint" id="list-hint">${hint}</p>
      <div
        id="panel"
        class="list"
        role=${tabbed ? 'tabpanel' : 'group'}
        aria-labelledby=${tabbed ? `tab-${this.tab}` : nothing}
        aria-label=${tabbed ? nothing : 'Combos'}
        aria-describedby="list-hint"
        @scroll=${() => {
          this.measure();
        }}
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
      ${
        this.overflowing
          ? html`<div class="dots" aria-hidden="true">
              ${visible.map(
                (_, index) =>
                  html`<button
                    class="dot"
                    type="button"
                    tabindex="-1"
                    aria-current=${index === this.position ? 'true' : 'false'}
                    @click=${() => {
                      this.scrollToItem(index);
                    }}
                  ></button>`,
              )}
            </div>`
          : nothing
      }
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
