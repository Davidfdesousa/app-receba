import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  findFighter,
  findKameo,
  idealKameoId,
  kameoOptions,
  type KameoOption,
} from '../../lib/roster/roster.ts';
import type { DuoId, DuoSelection, Roster } from '../../lib/roster/roster.types.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../notation-text/notation-text.ts';

export type DuoChangeDetail = DuoSelection;

const ordinal = (rank: number) => `${rank}º`;

/**
 * Picks the fighter and the Kameo. Choosing a fighter selects the partner the community
 * recommends most; the ranked suggestions stay one tap away, each with its reason.
 * Kameos without combos yet are marked "em breve".
 *
 * @fires duo-change - A new duo was picked. Detail: `{ fighterId, kameoId }`.
 */
@customElement('app-duo-picker')
export class AppDuoPicker extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .picker {
        display: grid;
        gap: var(--spacing-stack-md);
        padding-block: var(--spacing-inset-md);
        padding-inline: var(--spacing-inset-md);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-surface);
        background: var(--color-bg-default);
      }

      .title {
        margin: 0;
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-title-sm-size);
        font-weight: var(--typography-display-weight);
        letter-spacing: var(--typography-display-letter-spacing);
        text-transform: uppercase;
      }

      .fields {
        display: grid;
        gap: var(--spacing-stack-sm);
      }

      .field {
        display: grid;
        gap: var(--spacing-stack-2xs);
        min-inline-size: 0;
      }

      .field-label {
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-label);
        font-size: var(--typography-label-size);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
      }

      .select {
        position: relative;
        display: flex;
      }

      select {
        flex: 1;
        min-inline-size: 0;
        min-block-size: 3rem;
        padding-block: var(--spacing-inset-sm);
        padding-inline: var(--spacing-inset-md) var(--spacing-inset-xl);
        border: 1px solid var(--color-border-strong);
        border-radius: var(--radius-control);
        background: var(--color-bg-subtle);
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-ui);
        /* 16px or more keeps iOS from zooming in on focus. */
        font-size: var(--typography-title-sm-size);
        font-weight: var(--typography-display-weight);
        appearance: none;
        cursor: pointer;
      }

      select:hover {
        border-color: var(--color-border-brand);
      }

      select:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-border-focus);
        outline-offset: var(--focus-ring-offset);
      }

      .chevron {
        position: absolute;
        inset-block: 0;
        inset-inline-end: var(--spacing-inset-md);
        inline-size: 0.75rem;
        margin-block: auto;
        color: var(--color-content-brand);
        pointer-events: none;
      }

      .plus {
        display: none;
      }

      .advice {
        display: grid;
        gap: var(--spacing-stack-sm);
        padding-block-start: var(--spacing-stack-md);
        border-block-start: 1px solid var(--color-border-default);
      }

      p {
        margin: 0;
      }

      .advice-head {
        color: var(--color-content-subtle);
        font-size: var(--typography-body-sm-size);
      }

      .advice-head strong {
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-body-md-size);
        letter-spacing: var(--typography-display-letter-spacing);
        text-transform: uppercase;
      }

      .picks {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-inline-xs);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .pick {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-inline-xs);
        min-block-size: 2.75rem;
        padding-block: var(--spacing-inset-xs);
        padding-inline: var(--spacing-inset-sm) var(--spacing-inset-md);
        border: 1px solid var(--color-border-strong);
        border-radius: var(--radius-tag);
        background: var(--color-bg-subtle);
        color: var(--color-content-default);
        font-family: var(--typography-font-family-label);
        font-size: var(--typography-label-size);
        font-weight: var(--typography-display-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        cursor: pointer;
        transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
      }

      .pick:hover {
        border-color: var(--color-border-brand);
      }

      .pick:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-border-focus);
        outline-offset: var(--focus-ring-offset);
      }

      .pick[aria-pressed='true'] {
        border-color: var(--color-border-brand);
        background: var(--color-bg-brand-subtle);
        color: var(--color-content-strong);
      }

      .rank {
        display: inline-grid;
        place-items: center;
        min-inline-size: 1.75rem;
        block-size: 1.75rem;
        border-radius: var(--radius-tag);
        background: var(--gradient-brand-metal);
        color: var(--color-content-on-intense);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-caption-size);
        letter-spacing: 0;
      }

      .soon {
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-caption-size);
        letter-spacing: var(--typography-label-letter-spacing);
      }

      .reason {
        color: var(--color-content-default);
      }

      .ideal-tag {
        color: var(--color-content-highlight);
        font-family: var(--typography-font-family-label);
        font-size: var(--typography-caption-size);
        font-weight: var(--typography-display-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
      }

      .sources {
        color: var(--color-content-muted);
        font-size: var(--typography-caption-size);
      }

      .sources a {
        color: var(--color-content-subtle);
        text-underline-offset: 0.2em;
      }

      .sources a:hover {
        color: var(--color-content-brand);
      }

      @media (min-width: 40rem) {
        .picker {
          padding-inline: var(--spacing-inset-lg);
        }

        .fields {
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: end;
          gap: var(--spacing-inline-sm);
        }

        .plus {
          display: block;
          padding-block-end: var(--spacing-inset-sm);
          color: var(--color-content-brand);
          font-family: var(--typography-font-family-display);
          font-size: var(--typography-title-md-size);
          font-weight: var(--typography-display-weight);
          line-height: 1;
        }
      }
    `,
  ];

  @property({ attribute: false }) roster: Roster | null = null;
  @property({ attribute: false }) selection: DuoSelection | null = null;
  /** Duos that already have combos to train. */
  @property({ attribute: false }) availableDuos: ReadonlySet<DuoId> = new Set();

  override updated(): void {
    // `?selected` only sets the initial choice; once the player touched a select, its
    // value has to be synced by hand so a new selection from outside shows up.
    const { selection } = this;
    if (!selection) return;
    for (const [name, value] of [
      ['fighter', selection.fighterId],
      ['kameo', selection.kameoId],
    ] as const) {
      const select = this.renderRoot.querySelector<HTMLSelectElement>(`select[name='${name}']`);
      if (select && select.value !== value) select.value = value;
    }
  }

  private emit(selection: DuoSelection): void {
    const current = this.selection;
    if (current?.fighterId === selection.fighterId && current.kameoId === selection.kameoId) return;

    this.dispatchEvent(
      new CustomEvent<DuoChangeDetail>('duo-change', { detail: selection, bubbles: true, composed: true }),
    );
  }

  private onFighterChange(event: Event): void {
    const roster = this.roster;
    const fighterId = (event.target as HTMLSelectElement).value;
    const fighter = roster ? findFighter(roster, fighterId) : undefined;
    const kameoId = fighter ? idealKameoId(fighter) : undefined;
    if (fighter && kameoId) this.emit({ fighterId, kameoId });
  }

  private onKameoChange(kameoId: string): void {
    if (this.selection) this.emit({ fighterId: this.selection.fighterId, kameoId });
  }

  private renderKameoOption(option: KameoOption, selectedId: string) {
    const { kameo, rank, available } = option;
    const parts = [
      rank === null ? null : ordinal(rank),
      kameo.name,
      rank === 1 ? '(ideal)' : null,
      available ? null : '· em breve',
    ];
    return html`<option value=${kameo.id} ?selected=${kameo.id === selectedId}>
      ${parts.filter((part) => part !== null).join(' ')}
    </option>`;
  }

  private renderSources(roster: Roster) {
    const { sources } = roster;
    return html`<p class="sources">
      Indicações com base em
      ${sources.map(
        (source, index) =>
          html`${index === 0 ? '' : index === sources.length - 1 ? ' e ' : ', '}<a
              href=${source.url}
              target="_blank"
              rel="noopener noreferrer"
              >${source.label}</a
            >`,
      )}.
    </p>`;
  }

  override render() {
    const { roster, selection } = this;
    if (!roster || !selection) return nothing;

    const fighter = findFighter(roster, selection.fighterId);
    if (!fighter) return nothing;

    const options = kameoOptions(roster, fighter, this.availableDuos);
    let selected = options.find((option) => option.kameo.id === selection.kameoId);
    const current = findKameo(roster, selection.kameoId);
    if (!selected && current) {
      // A saved Kameo outside the suggestions still shows as the selected option.
      selected = { kameo: current, rank: null, pick: null, available: false };
      options.push(selected);
    }
    const recommended = options.filter((option) => option.rank !== null);
    const others = options.filter((option) => option.rank === null);
    const ideal = recommended[0];
    const fighters = [...roster.fighters].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const chevron = html`<svg class="chevron" viewBox="0 0 12 8" aria-hidden="true">
      <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" stroke-width="2" />
    </svg>`;

    return html`<section class="picker" aria-labelledby="picker-title">
      <h2 id="picker-title" class="title">Monte sua dupla</h2>
      <div class="fields">
        <label class="field">
          <span class="field-label">Lutador</span>
          <span class="select">
            <select name="fighter" @change=${this.onFighterChange}>
              ${fighters.map(
                (item) =>
                  html`<option value=${item.id} ?selected=${item.id === fighter.id}>${item.name}</option>`,
              )}
            </select>
            ${chevron}
          </span>
        </label>
        <span class="plus" aria-hidden="true">+</span>
        <label class="field">
          <span class="field-label">Kameo</span>
          <span class="select">
            <select
              name="kameo"
              @change=${(event: Event) => {
                this.onKameoChange((event.target as HTMLSelectElement).value);
              }}
            >
              <optgroup label="Indicados pela comunidade">
                ${recommended.map((option) => this.renderKameoOption(option, selection.kameoId))}
              </optgroup>
              ${
                others.length
                  ? html`<optgroup label="Outros Kameos">
                      ${others.map((option) => this.renderKameoOption(option, selection.kameoId))}
                    </optgroup>`
                  : nothing
              }
            </select>
            ${chevron}
          </span>
        </label>
      </div>

      <div class="advice">
        ${
          ideal
            ? html`<p class="advice-head">
                <span class="ideal-tag">Kameo ideal</span> para ${fighter.name}:
                <strong>${ideal.kameo.name}</strong>
              </p>`
            : nothing
        }
        <ol class="picks" aria-label="Kameos indicados para ${fighter.name}">
          ${recommended.map(
            (option) =>
              html`<li>
                <button
                  class="pick"
                  type="button"
                  aria-pressed=${option.kameo.id === selection.kameoId ? 'true' : 'false'}
                  @click=${() => {
                    this.onKameoChange(option.kameo.id);
                  }}
                >
                  <span class="rank" aria-hidden="true">${ordinal(option.rank ?? 0)}</span>
                  <span class="name">${option.kameo.name}</span>
                  ${option.available ? nothing : html`<span class="soon">em breve</span>`}
                </button>
              </li>`,
          )}
        </ol>
        <p class="reason" aria-live="polite">
          ${
            selected?.pick
              ? html`<app-notation-text text=${selected.pick.reason}></app-notation-text>`
              : ideal
                ? `Fora das indicações da comunidade. Para ${fighter.name}, o Kameo ideal é ${ideal.kameo.name}.`
                : nothing
          }
        </p>
        ${this.renderSources(roster)}
      </div>
    </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-duo-picker': AppDuoPicker;
  }

  interface HTMLElementEventMap {
    'duo-change': CustomEvent<DuoChangeDetail>;
  }
}
