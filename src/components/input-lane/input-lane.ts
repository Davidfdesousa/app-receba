import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import type { ComboStep } from '../../lib/combo/combo.types.ts';
import { lastIndexAtOrBefore, type Timeline, type TimelineNote } from '../../lib/combo/timeline.ts';
import { baseStyles } from '../../styles/shared.styles.ts';
import '../input-sequence/input-sequence.ts';

/** Minimum horizontal gap between two notes, in px. */
const noteGap = 10;
/** Width assumed for a note that has not been laid out yet, in px. */
const fallbackNoteWidth = 40;
/** Below this lane width the notes use smaller glyphs. */
const compactWidth = 560;

function noteNotation(note: TimelineNote): string {
  return note.inputs.map((input) => input.press.join('+')).join(' ');
}

/**
 * Rhythm-game lane: notes slide left and cross the "now" line exactly at their time.
 *
 * Notes are spaced by time (`px` per ms) but never overlap, so dense stretches spread
 * out; the scroll offset interpolates between neighbouring notes so each one still
 * reaches the line on time. Only transforms change per frame — the template renders
 * again only when the timeline changes.
 */
@customElement('app-input-lane')
export class AppInputLane extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .lane {
        --_hit-x: max(3.5rem, 18%);

        position: relative;
        block-size: 6.75rem;
        overflow: hidden;
        border-block-start: 1px solid var(--color-border-default);
        background: repeating-linear-gradient(
          90deg,
          var(--color-bg-track) 0 2.5rem,
          color-mix(in oklab, var(--color-bg-track), var(--color-bg-default) 40%) 2.5rem 5rem
        );
        -webkit-mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent);
        mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent);
      }

      .lane.compact {
        block-size: 6rem;
      }

      .hit {
        position: absolute;
        inset-block: 0;
        inset-inline-start: var(--_hit-x);
        inline-size: 3px;
        margin-inline-start: -1px;
        background: var(--color-border-brand);
        box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-border-brand) 18%, transparent);
      }

      .hit-label {
        position: absolute;
        inset-block-end: var(--spacing-stack-2xs);
        inset-inline-start: var(--spacing-inline-xs);
        color: var(--color-content-brand);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-caption-size);
        font-weight: var(--typography-label-weight);
        letter-spacing: var(--typography-label-letter-spacing);
        text-transform: uppercase;
        white-space: nowrap;
      }

      .note {
        position: absolute;
        inset-block-start: 54%;
        inset-inline-start: 0;
        display: flex;
        padding: var(--spacing-inset-xs);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-control);
        background: var(--color-bg-muted);
        will-change: transform;
      }

      .note[data-kind='special'] {
        border-color: color-mix(in oklab, var(--color-content-step-special) 55%, var(--color-border-default));
      }

      .note[data-kind='kameo'] {
        border-color: color-mix(in oklab, var(--color-content-step-kameo) 55%, var(--color-border-default));
      }

      .note[data-kind='air'] {
        border-color: color-mix(in oklab, var(--color-content-step-air) 55%, var(--color-border-default));
      }

      .note[data-kind='finisher'] {
        border-color: color-mix(
          in oklab,
          var(--color-content-step-finisher) 55%,
          var(--color-border-default)
        );
      }

      .note.done {
        opacity: 0.3;
      }

      .note.hot {
        border-color: var(--color-border-brand);
        background: var(--color-bg-brand-subtle);
      }

      .step-number {
        position: absolute;
        inset-block-end: calc(100% + var(--spacing-stack-2xs));
        inset-inline-start: var(--spacing-inline-2xs);
        color: var(--color-content-muted);
        font-family: var(--typography-font-family-ui);
        font-size: var(--typography-label-size);
        font-weight: var(--typography-label-weight);
        line-height: 1;
      }
    `,
  ];

  @property({ attribute: false }) timeline: Timeline | null = null;
  @property({ attribute: false }) steps: readonly ComboStep[] = [];
  /** Combo time in ms (0 is the first input). */
  @property({ type: Number }) time = 0;

  @state() private compact = false;

  @query('.lane') private readonly laneElement!: HTMLElement | null;

  private noteElements: HTMLElement[] = [];
  private positions: number[] = [];
  private pxPerMs = 0.3;
  private hitX = 56;
  /** Note last painted as current; -2 forces a repaint of the classes. */
  private paintedIndex = -2;
  private resizeObserver: ResizeObserver | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver === 'function') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCompact();
        this.layout();
        this.paint();
      });
      if (this.hasUpdated) this.observe();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  /** Per-frame time changes skip rendering and only move the notes. */
  protected override shouldUpdate(changed: PropertyValues): boolean {
    if (this.hasUpdated && changed.size === 1 && changed.has('time')) {
      this.paint();
      return false;
    }
    return true;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('timeline') || changed.has('steps') || changed.has('compact')) {
      this.noteElements = [...this.renderRoot.querySelectorAll<HTMLElement>('.note')];
      this.paintedIndex = -2;
      this.observe();
      this.layout();
    }
    this.paint();
  }

  /** Watches the lane width and every note's size (glyphs and fonts load after the first paint). */
  private observe(): void {
    const observer = this.resizeObserver;
    if (!observer || !this.laneElement) return;

    observer.disconnect();
    observer.observe(this.laneElement);
    for (const note of this.noteElements) observer.observe(note);
  }

  private updateCompact(): void {
    const width = this.laneElement?.clientWidth ?? 0;
    if (width > 0) this.compact = width < compactWidth;
  }

  private layout(): void {
    const lane = this.laneElement;
    if (!lane) return;

    const width = lane.clientWidth || 600;
    this.pxPerMs = Math.min(0.4, Math.max(0.18, width / 1700));
    this.hitX = Math.max(56, width * 0.18);
    lane.style.setProperty('--_hit-x', `${this.hitX}px`);

    const notes = this.timeline?.notes ?? [];
    const positions: number[] = [];
    notes.forEach((note, index) => {
      if (index === 0) {
        positions.push(0);
        return;
      }
      const previous = positions[index - 1]!;
      const measured = this.noteElements[index - 1]?.offsetWidth ?? 0;
      const previousWidth = measured > 0 ? measured : fallbackNoteWidth;
      const byTime = previous + (note.time - notes[index - 1]!.time) * this.pxPerMs;
      positions.push(Math.max(previous + previousWidth + noteGap, byTime));
    });
    this.positions = positions;
  }

  /** Scroll offset at a time, interpolated between the neighbouring notes. */
  private offsetAt(time: number): number {
    const notes = this.timeline?.notes ?? [];
    const last = notes.length - 1;
    if (last < 0) return 0;

    const first = notes[0]!;
    if (time <= first.time) return (this.positions[0] ?? 0) + (time - first.time) * this.pxPerMs;

    for (let index = 0; index < last; index++) {
      const next = notes[index + 1]!;
      if (time < next.time) {
        const current = notes[index]!;
        const from = this.positions[index] ?? 0;
        const to = this.positions[index + 1] ?? from;
        return from + ((time - current.time) / (next.time - current.time)) * (to - from);
      }
    }

    return (this.positions[last] ?? 0) + (time - notes[last]!.time) * this.pxPerMs;
  }

  private paint(): void {
    const notes = this.timeline?.notes;
    if (!notes || notes.length === 0) return;

    const offset = this.offsetAt(this.time);
    this.noteElements.forEach((element, index) => {
      const x = this.hitX + (this.positions[index] ?? 0) - offset;
      element.style.transform = `translate(${x.toFixed(1)}px, -50%)`;
    });

    const current = lastIndexAtOrBefore(notes, this.time);
    if (current === this.paintedIndex) return;

    this.noteElements.forEach((element, index) => {
      element.classList.toggle('done', index < current);
      element.classList.toggle('hot', index === current);
    });
    this.paintedIndex = current;
  }

  override render() {
    const notes = this.timeline?.notes ?? [];
    const size = this.compact ? 'sm' : 'md';

    return html`<div class="lane ${this.compact ? 'compact' : ''}" aria-hidden="true">
      <div class="hit"><span class="hit-label">agora</span></div>
      ${notes.map((note, index) => {
        const startsStep = index === 0 || notes[index - 1]!.stepIndex !== note.stepIndex;
        const kind = this.steps[note.stepIndex]?.kind ?? 'normal';

        return html`<div class="note" data-kind=${kind}>
          ${startsStep ? html`<span class="step-number">${note.stepIndex + 1}</span>` : nothing}
          <app-input-sequence notation=${noteNotation(note)} size=${size}></app-input-sequence>
        </div>`;
      })}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-input-lane': AppInputLane;
  }
}
