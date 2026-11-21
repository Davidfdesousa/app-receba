import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { effectiveTempo, metronomeTempos, type MetronomeTempo } from '../../lib/audio/metronome.ts';
import { playbackSpeeds, type PlaybackSpeed } from '../../lib/preferences.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../button/button.ts';
import '../icon/icon.ts';

export type PlaybackStatus = 'stopped' | 'playing' | 'paused';

export interface SpeedChangeDetail {
  speed: PlaybackSpeed;
}
export interface LoopChangeDetail {
  loop: boolean;
}
export interface InputClicksChangeDetail {
  enabled: boolean;
}
export interface MetronomeChangeDetail {
  tempo: MetronomeTempo | null;
}

/** Events this component fires, with their detail. */
interface PlaybackControlsEvents {
  'playback-toggle': undefined;
  'playback-restart': undefined;
  'speed-change': SpeedChangeDetail;
  'loop-change': LoopChangeDetail;
  'input-clicks-change': InputClicksChangeDetail;
  'metronome-change': MetronomeChangeDetail;
}

const speedFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatSpeed(speed: number): string {
  return `${speedFormat.format(speed)}x`;
}

const playLabels: Record<PlaybackStatus, string> = {
  stopped: 'Tocar',
  playing: 'Pausar',
  paused: 'Continuar',
};

/**
 * Transport and practice options. Stateless: every change goes out as an event.
 *
 * @fires playback-toggle - Play or pause.
 * @fires playback-restart - Back to the count-in, playing.
 * @fires speed-change - Detail: `{ speed }`.
 * @fires loop-change - Detail: `{ loop }`.
 * @fires input-clicks-change - Detail: `{ enabled }`.
 * @fires metronome-change - Detail: `{ tempo }` (null turns it off).
 */
@customElement('app-playback-controls')
export class AppPlaybackControls extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      /* Phone first: play, restart and speed share one row, right under the stage. */
      .controls {
        display: grid;
        gap: var(--spacing-stack-sm);
      }

      .main-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-inline-xs);
      }

      .play {
        flex: 1 1 auto;
        min-inline-size: 0;
      }

      app-button::part(control) {
        min-block-size: 2.75rem;
      }

      .restart::part(control) {
        min-inline-size: 2.75rem;
        padding-inline: 0;
      }

      .restart-text {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }

      .field {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing-inline-xs);
      }

      .speed .field-label {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }

      .field-label {
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-label);
        font-size: var(--typography-caption-size);
        font-weight: var(--typography-display-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
      }

      .extras {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing-stack-xs) var(--spacing-inline-sm);
      }

      .toggles {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-inline-xs);
      }

      .segmented {
        display: inline-flex;
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-control);
        background: var(--color-bg-default);
      }

      .segmented button {
        min-block-size: 2.75rem;
        min-inline-size: 2.75rem;
        padding-inline: var(--spacing-inset-xs);
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--color-content-default);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-body-sm-size);
        font-weight: var(--typography-figure-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        cursor: pointer;
      }

      .segmented button + button {
        border-inline-start: 1px solid var(--color-border-default);
      }

      .segmented button:hover {
        background: var(--color-bg-neutral-hover);
      }

      .segmented button[aria-pressed='true'] {
        background: var(--color-bg-brand-subtle);
        color: var(--color-content-strong);
        box-shadow: inset 0 0 0 1px var(--color-border-brand);
      }

      .segmented button:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-border-focus);
        outline-offset: calc(var(--focus-ring-offset) * -1);
      }

      .segmented button:first-child {
        border-start-start-radius: var(--radius-control);
        border-end-start-radius: var(--radius-control);
      }

      .segmented button:last-child {
        border-start-end-radius: var(--radius-control);
        border-end-end-radius: var(--radius-control);
      }

      .heard {
        color: var(--color-content-subtle);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-body-sm-size);
        white-space: nowrap;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-inline-xs);
        min-block-size: 2.75rem;
        padding-inline: var(--spacing-inset-sm);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-control);
        background: var(--color-bg-default);
        color: var(--color-content-default);
        font-family: var(--typography-font-family-label);
        font-size: var(--typography-caption-size);
        font-weight: var(--typography-display-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        cursor: pointer;
      }

      .toggle:hover {
        background: var(--color-bg-neutral-hover);
      }

      .toggle:has(input:checked) {
        border-color: var(--color-border-brand);
      }

      .toggle input {
        inline-size: 1.125rem;
        block-size: 1.125rem;
        margin: 0;
        accent-color: var(--color-bg-brand);
        cursor: pointer;
      }

      @media (min-width: 40rem) {
        .play {
          flex: 0 1 auto;
          min-inline-size: 9rem;
        }

        .segmented button {
          min-inline-size: 3.25rem;
          padding-inline: var(--spacing-inset-sm);
        }
      }

      /* Room for the written labels only on wide screens: the row must stay one line. */
      @media (min-width: 64rem) {
        .restart::part(control) {
          padding-inline: var(--spacing-inset-md);
        }

        .restart-text,
        .speed .field-label {
          position: static;
          inline-size: auto;
          block-size: auto;
          overflow: visible;
          clip: auto;
        }

        .speed {
          margin-inline-start: var(--spacing-inline-sm);
        }
      }
    `,
  ];

  @property() status: PlaybackStatus = 'stopped';
  @property({ type: Number }) speed: PlaybackSpeed = 1;
  @property({ type: Boolean }) loop = false;
  @property({ type: Boolean, attribute: 'input-clicks' }) inputClicks = true;
  @property({ attribute: false }) metronomeTempo: MetronomeTempo | null = null;

  private emit<K extends keyof PlaybackControlsEvents>(type: K, detail: PlaybackControlsEvents[K]): void {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  override render() {
    const playing = this.status === 'playing';

    return html`
      <div class="controls">
        <div class="main-row">
          <app-button
            class="play"
            @click=${() => {
              this.emit('playback-toggle', undefined);
            }}
          >
            <app-icon slot="icon-start" name=${playing ? 'pause' : 'play'}></app-icon>
            ${playLabels[this.status]}
          </app-button>
          <app-button
            class="restart"
            variant="secondary"
            title="Reiniciar"
            @click=${() => {
              this.emit('playback-restart', undefined);
            }}
          >
            <app-icon slot="icon-start" name="restart"></app-icon>
            <span class="restart-text">Reiniciar</span>
          </app-button>

          <div class="field speed">
            <span class="field-label" id="speed-label">Velocidade</span>
            <div class="segmented" role="group" aria-labelledby="speed-label">
              ${playbackSpeeds.map(
                (speed) =>
                  html`<button
                    type="button"
                    aria-pressed=${speed === this.speed ? 'true' : 'false'}
                    @click=${() => {
                      this.emit('speed-change', { speed });
                    }}
                  >
                    ${formatSpeed(speed)}
                  </button>`,
              )}
            </div>
          </div>
        </div>

        <div class="extras">
          <div class="toggles">
            <label class="toggle">
              <input
                type="checkbox"
                .checked=${this.loop}
                @change=${(event: Event) => {
                  this.emit('loop-change', { loop: (event.target as HTMLInputElement).checked });
                }}
              />
              Repetir
            </label>
            <label class="toggle">
              <input
                type="checkbox"
                .checked=${this.inputClicks}
                @change=${(event: Event) => {
                  this.emit('input-clicks-change', {
                    enabled: (event.target as HTMLInputElement).checked,
                  });
                }}
              />
              Cliques dos botões
            </label>
          </div>

          <div class="field">
            <span class="field-label" id="metronome-label">Metrônomo (BPM)</span>
            <div class="field-row">
              <div class="segmented" role="group" aria-labelledby="metronome-label">
                <button
                  type="button"
                  aria-pressed=${this.metronomeTempo === null ? 'true' : 'false'}
                  @click=${() => {
                    this.emit('metronome-change', { tempo: null });
                  }}
                >
                  Desligado
                </button>
                ${metronomeTempos.map(
                  (tempo) =>
                    html`<button
                      type="button"
                      aria-pressed=${tempo === this.metronomeTempo ? 'true' : 'false'}
                      @click=${() => {
                        this.emit('metronome-change', { tempo });
                      }}
                    >
                      ${tempo}
                    </button>`,
                )}
              </div>
              ${
                this.metronomeTempo === null
                  ? nothing
                  : html`<span class="heard"
                      >${effectiveTempo(this.metronomeTempo, this.speed)} bpm em
                      ${formatSpeed(this.speed)}</span
                    >`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-playback-controls': AppPlaybackControls;
  }

  interface HTMLElementEventMap {
    'playback-toggle': CustomEvent<void>;
    'playback-restart': CustomEvent<void>;
    'speed-change': CustomEvent<SpeedChangeDetail>;
    'loop-change': CustomEvent<LoopChangeDetail>;
    'input-clicks-change': CustomEvent<InputClicksChangeDetail>;
    'metronome-change': CustomEvent<MetronomeChangeDetail>;
  }
}
