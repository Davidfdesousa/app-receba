import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { PlaybackController } from '../../controllers/playback.controller.ts';
import { comboMeterBars, formatSeconds } from '../../lib/combo/combo-summary.ts';
import type { Combo, ComboSet } from '../../lib/combo/combo.types.ts';
import { legendTokens, ps5Layout } from '../../lib/combo/controller-layout.ts';
import { buildTimeline, lastIndexAtOrBefore, type Timeline } from '../../lib/combo/timeline.ts';
import { readTrainerPreferences, storeTrainerPreferences } from '../../lib/preferences.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../combo-list/combo-list.ts';
import '../combo-steps/combo-steps.ts';
import '../input-display/input-display.ts';
import type { InputDisplayState } from '../input-display/input-display.ts';
import '../input-glyph/input-glyph.ts';
import '../input-lane/input-lane.ts';
import '../notation-text/notation-text.ts';
import '../playback-controls/playback-controls.ts';
import type { PlaybackStatus } from '../playback-controls/playback-controls.ts';

/** Result line at the end: "384 de dano em 18 golpes", or whatever the source gave. */
function comboResult(combo: Combo): string {
  const { damage, hits } = combo;
  if (damage !== undefined && hits !== undefined) return `${damage} de dano em ${hits} golpes`;
  if (damage !== undefined) return `${damage} de dano`;
  if (hits !== undefined) return `${hits} golpes`;
  return 'Combo completo';
}

/** Jumping to a step starts slightly before its first input. */
const stepSeekLeadMs = 250;

const interactiveSelector =
  'button, a[href], input, select, textarea, summary, [contenteditable=""], [contenteditable="true"], [role="button"], [role="tab"]';

function resolveComboId(
  comboSet: ComboSet | null,
  ...candidates: (string | null | undefined)[]
): string | null {
  const combos = comboSet?.combos ?? [];
  const found = candidates.find((id) => id && combos.some((combo) => combo.id === id));
  return found ?? combos[0]?.id ?? null;
}

/**
 * Combo trainer feature: owns the selected combo, the playback clock and the saved
 * practice preferences. Space toggles playback when focus is not on a control.
 */
@customElement('app-combo-trainer')
export class AppComboTrainer extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: var(--spacing-stack-sm);
        align-items: start;
      }

      .main {
        display: grid;
        gap: var(--spacing-stack-md);
        min-inline-size: 0;
      }

      .stage {
        overflow: hidden;
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-surface);
        background: var(--color-bg-default);
      }

      .stage-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: var(--spacing-stack-sm) var(--spacing-inline-lg);
        padding-block: var(--spacing-inset-md);
        padding-inline: var(--spacing-inset-md);
        border-block-end: 1px solid var(--color-border-default);
      }

      .combo-title {
        margin: 0;
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-display);
        font-size: var(--typography-display-md-size);
        font-weight: var(--typography-display-weight);
        line-height: var(--typography-display-line-height);
        letter-spacing: var(--typography-display-letter-spacing);
      }

      .meta {
        margin-block: var(--spacing-stack-2xs) 0;
        color: var(--color-content-muted);
        font-size: var(--typography-body-sm-size);
      }

      .meta a {
        color: var(--color-content-brand);
        text-underline-offset: 0.2em;
      }

      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-stack-xs) var(--spacing-inline-lg);
        margin: 0;
      }

      .stat {
        display: flex;
        flex-direction: column-reverse;
      }

      .stat dd {
        margin: 0;
        color: var(--color-content-strong);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-figure-size);
        font-weight: var(--typography-figure-weight);
        line-height: 1;
        white-space: nowrap;
      }

      .stat dt {
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-caption-size);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
      }

      .progress {
        block-size: 0.25rem;
        background: var(--color-bg-track);
      }

      .progress-fill {
        block-size: 100%;
        background: var(--color-bg-brand);
        transform-origin: 0 50%;
      }

      .hint {
        margin: 0;
        padding-block: var(--spacing-inset-sm) var(--spacing-inset-md);
        padding-inline: var(--spacing-inset-md);
        color: var(--color-content-muted);
        font-size: var(--typography-body-sm-size);
      }

      details {
        padding-inline: var(--spacing-inset-md);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-surface);
        background: var(--color-bg-default);
      }

      summary {
        display: flex;
        align-items: center;
        min-block-size: 2.75rem;
        font-family: var(--typography-font-family-label);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        cursor: pointer;
      }

      .legend {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
        gap: var(--spacing-stack-xs) var(--spacing-inline-lg);
        padding-block: var(--spacing-inset-xs) var(--spacing-inset-md);
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-inline-sm);
      }

      .legend-note,
      .credits {
        margin: 0;
        color: var(--color-content-muted);
        font-size: var(--typography-body-sm-size);
      }

      .legend-note {
        padding-block-end: var(--spacing-inset-md);
      }

      @media (min-width: 37.5rem) {
        .stage-head,
        .hint {
          padding-inline: var(--spacing-inset-lg);
        }
      }

      @media (min-width: 53.75rem) {
        .layout {
          grid-template-columns: 18.125rem minmax(0, 1fr);
          gap: var(--spacing-inline-lg);
        }
      }
    `,
  ];

  @property({ attribute: false }) comboSet: ComboSet | null = null;

  @state() private comboId: string | null = null;

  private readonly savedPreferences = readTrainerPreferences();
  private readonly playback = new PlaybackController(this, {
    speed: this.savedPreferences.speed,
    loop: this.savedPreferences.loop,
    inputClicks: this.savedPreferences.inputClicks,
    metronomeTempo: this.savedPreferences.metronomeTempo,
  });

  private loadedCombo: Combo | undefined;
  private timeline: Timeline | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this.onDocumentKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.onDocumentKeydown);
  }

  private get combo(): Combo | undefined {
    return this.comboSet?.combos.find((combo) => combo.id === this.comboId);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('comboSet')) {
      this.comboId = resolveComboId(
        this.comboSet,
        this.comboId,
        this.savedPreferences.comboId,
        this.comboSet?.defaultComboId,
      );
    }

    const combo = this.combo;
    if (combo !== this.loadedCombo) {
      this.loadedCombo = combo;
      this.timeline = combo ? buildTimeline(combo.steps) : null;
      if (this.timeline) this.playback.load(this.timeline);
    }
  }

  private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.code !== 'Space' || event.repeat || event.defaultPrevented) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const target = event.composedPath()[0];
    if (target instanceof Element && target.closest(interactiveSelector)) return;

    event.preventDefault();
    this.playback.toggle();
  };

  private savePreferences(): void {
    storeTrainerPreferences({
      comboId: this.comboId,
      speed: this.playback.speed,
      loop: this.playback.loop,
      inputClicks: this.playback.inputClicks,
      metronomeTempo: this.playback.metronomeTempo,
    });
  }

  private selectCombo(comboId: string): void {
    if (comboId === this.comboId) return;
    this.comboId = comboId;
    this.savePreferences();
  }

  private seekStep(stepIndex: number): void {
    const step = this.timeline?.steps[stepIndex];
    if (step) this.playback.seek(step.start - stepSeekLeadMs);
  }

  private get activeStepIndex(): number {
    const { phase, time } = this.playback;
    if (phase === 'ended') return this.combo?.steps.length ?? -1;
    if (phase !== 'running' || !this.timeline) return -1;

    const index = lastIndexAtOrBefore(this.timeline.inputs, time);
    return index >= 0 ? this.timeline.inputs[index]!.stepIndex : -1;
  }

  private get playbackStatus(): PlaybackStatus {
    if (this.playback.playing) return 'playing';
    return this.playback.resumable ? 'paused' : 'stopped';
  }

  private renderMeta(combo: Combo) {
    if (combo.category === 'piece' || !combo.source) return combo.description ?? '';

    const { source } = combo;
    return html`Combo
      <a
        href=${source.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Combo ${source.reference} no ${source.site} (abre em nova aba)"
        >${source.reference}</a
      >
      por ${source.author}${combo.position ? `, ${combo.position}` : ''}`;
  }

  private renderStats(combo: Combo, timeline: Timeline) {
    type Stat = [value: string | number, label: string];
    const bars = comboMeterBars(combo);
    const lead: Stat[] =
      combo.category === 'combo'
        ? [
            ...(combo.damage === undefined ? [] : [[combo.damage, 'de dano'] satisfies Stat]),
            ...(combo.hits === undefined ? [] : [[combo.hits, 'golpes'] satisfies Stat]),
          ]
        : [[combo.steps.length, 'passos']];
    const stats: Stat[] = [
      ...lead,
      [bars, bars === 1 ? 'barra' : 'barras'],
      [`${formatSeconds(timeline.duration)} s`, 'em 1x'],
    ];

    return html`<dl class="stats">
      ${stats.map(
        ([value, label]) =>
          html`<div class="stat">
            <dt>${label}</dt>
            <dd>${value}</dd>
          </div>`,
      )}
    </dl>`;
  }

  private renderStage(combo: Combo, timeline: Timeline) {
    const { playback } = this;
    const summary = combo.category === 'combo' ? comboResult(combo) : 'Peça completa';
    const displayState: InputDisplayState = playback.phase;

    return html`<section class="stage" aria-labelledby="combo-title">
      <header class="stage-head">
        <div>
          <h2 id="combo-title" class="combo-title">
            <app-notation-text text=${combo.title}></app-notation-text>
          </h2>
          <p class="meta">${this.renderMeta(combo)}</p>
        </div>
        ${this.renderStats(combo, timeline)}
      </header>
      <app-input-display
        .steps=${combo.steps}
        .timeline=${timeline}
        .time=${playback.time}
        .countIn=${playback.countIn}
        state=${displayState}
        summary=${summary}
      ></app-input-display>
      <app-input-lane .steps=${combo.steps} .timeline=${timeline} .time=${playback.time}></app-input-lane>
      <div class="progress" aria-hidden="true">
        <div class="progress-fill" style=${styleMap({ transform: `scaleX(${playback.progress})` })}></div>
      </div>
      <p class="hint">
        Ritmo aproximado: o tempo exato depende do hitstun. Comece em 0,5x e ajuste no Modo Treino.
      </p>
    </section>`;
  }

  private renderLegend() {
    return html`<details>
      <summary>Legenda dos botões</summary>
      <div class="legend">
        ${legendTokens.map(
          (token) =>
            html`<div class="legend-item">
              <span aria-hidden="true"><app-input-glyph token=${token} size="sm"></app-input-glyph></span>
              <span>${ps5Layout[token].name}</span>
            </div>`,
        )}
      </div>
      <p class="legend-note">
        <app-notation-text
          text="As direções valem para o personagem virado para a direita: [F] aponta sempre para o oponente."
        ></app-notation-text>
      </p>
    </details>`;
  }

  override render() {
    const combo = this.combo;
    const timeline = this.timeline;
    if (!this.comboSet || !combo || !timeline) return nothing;

    const { playback } = this;

    return html`<div class="layout">
      <aside aria-label="Combos">
        <app-combo-list
          .combos=${this.comboSet.combos}
          selected-id=${combo.id}
          @combo-select=${(event: HTMLElementEventMap['combo-select']) => {
            this.selectCombo(event.detail.comboId);
          }}
        ></app-combo-list>
      </aside>
      <div class="main">
        ${this.renderStage(combo, timeline)}
        <app-playback-controls
          status=${this.playbackStatus}
          .speed=${playback.speed}
          .loop=${playback.loop}
          .inputClicks=${playback.inputClicks}
          .metronomeTempo=${playback.metronomeTempo}
          @playback-toggle=${() => {
            playback.toggle();
          }}
          @playback-restart=${() => {
            playback.restart();
          }}
          @speed-change=${(event: HTMLElementEventMap['speed-change']) => {
            playback.setSpeed(event.detail.speed);
            this.savePreferences();
          }}
          @loop-change=${(event: HTMLElementEventMap['loop-change']) => {
            playback.setLoop(event.detail.loop);
            this.savePreferences();
          }}
          @input-clicks-change=${(event: HTMLElementEventMap['input-clicks-change']) => {
            playback.setInputClicks(event.detail.enabled);
            this.savePreferences();
          }}
          @metronome-change=${(event: HTMLElementEventMap['metronome-change']) => {
            playback.setMetronomeTempo(event.detail.tempo);
            this.savePreferences();
          }}
        ></app-playback-controls>
        <app-combo-steps
          .steps=${combo.steps}
          active-index=${this.activeStepIndex}
          @step-seek=${(event: HTMLElementEventMap['step-seek']) => {
            this.seekStep(event.detail.stepIndex);
          }}
        ></app-combo-steps>
        ${this.renderLegend()}
        <p class="credits">Combos da comunidade mk1kombo, com o autor indicado em cada um.</p>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-combo-trainer': AppComboTrainer;
  }
}
