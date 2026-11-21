import { describe, expect, it } from 'vitest';

import { ghostfaceScorpion } from '../../data/combo-sets/ghostface-scorpion.ts';
import { readTrainerPreferences, storeTrainerPreferences, trainerStorageKey } from '../../lib/preferences.ts';
import type { AppComboTrainer } from './combo-trainer.ts';
import './combo-trainer.ts';

async function mountTrainer(): Promise<AppComboTrainer> {
  const element = document.createElement('app-combo-trainer');
  element.comboSet = ghostfaceScorpion;
  document.body.append(element);
  await element.updateComplete;
  return element;
}

function part<K extends keyof HTMLElementTagNameMap>(
  trainer: AppComboTrainer,
  tag: K,
): HTMLElementTagNameMap[K] {
  const node = trainer.shadowRoot?.querySelector(tag);
  if (!node) throw new Error(`${tag} not rendered`);
  return node;
}

function title(trainer: AppComboTrainer): string | undefined {
  return (
    trainer.shadowRoot?.querySelector('.combo-title app-notation-text')?.getAttribute('text') ?? undefined
  );
}

describe('app-combo-trainer', () => {
  it('opens the default combo without saved preferences', async () => {
    const trainer = await mountTrainer();

    expect(part(trainer, 'app-combo-list').selectedId).toBe('combo-469');
    expect(title(trainer)).toBe('O mais curto');
  });

  it('switching combo stops playback, rewinds to the count-in and remembers the choice', async () => {
    const trainer = await mountTrainer();
    const controls = part(trainer, 'app-playback-controls');

    controls.dispatchEvent(new CustomEvent('playback-toggle', { bubbles: true, composed: true }));
    await trainer.updateComplete;
    expect(controls.status).toBe('playing');

    part(trainer, 'app-combo-list').dispatchEvent(
      new CustomEvent('combo-select', { detail: { comboId: 'combo-340' }, bubbles: true, composed: true }),
    );
    await trainer.updateComplete;

    expect(title(trainer)).toBe('Dois pulos com troca');
    expect(controls.status).toBe('stopped');
    expect(part(trainer, 'app-input-display').getAttribute('state')).toBe('ready');
    expect(readTrainerPreferences().comboId).toBe('combo-340');
  });

  it('saves practice options and restores them on the next visit', async () => {
    const trainer = await mountTrainer();
    const controls = part(trainer, 'app-playback-controls');
    const emit = (type: string, detail: unknown) => {
      controls.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
    };

    emit('speed-change', { speed: 0.75 });
    emit('loop-change', { loop: true });
    emit('input-clicks-change', { enabled: false });
    emit('metronome-change', { tempo: 150 });

    expect(JSON.parse(localStorage.getItem(trainerStorageKey) ?? '')).toEqual({
      comboId: 'combo-469',
      speed: 0.75,
      loop: true,
      inputClicks: false,
      metronomeTempo: 150,
    });

    trainer.remove();
    const again = await mountTrainer();
    const restored = part(again, 'app-playback-controls');

    expect(restored.speed).toBe(0.75);
    expect(restored.loop).toBe(true);
    expect(restored.inputClicks).toBe(false);
    expect(restored.metronomeTempo).toBe(150);
  });

  it('reopens the last combo and ignores one that no longer exists', async () => {
    storeTrainerPreferences({ ...readTrainerPreferences(), comboId: 'piece-finisher' });
    const trainer = await mountTrainer();
    expect(title(trainer)).toBe('Finalizador padrão');
    trainer.remove();

    storeTrainerPreferences({ ...readTrainerPreferences(), comboId: 'removed-combo' });
    expect(title(await mountTrainer())).toBe('O mais curto');
  });

  it('jumps to a step chosen in the list', async () => {
    const trainer = await mountTrainer();
    const steps = part(trainer, 'app-combo-steps');

    steps.dispatchEvent(
      new CustomEvent('step-seek', { detail: { stepIndex: 3 }, bubbles: true, composed: true }),
    );
    await trainer.updateComplete;

    // Playback lands just before the chosen step, so the previous one is still active.
    expect(steps.activeIndex).toBe(2);
    expect(part(trainer, 'app-input-display').getAttribute('state')).toBe('running');
  });

  it('toggles playback with Space unless a control has focus', async () => {
    const trainer = await mountTrainer();
    const controls = part(trainer, 'app-playback-controls');

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true }),
    );
    await trainer.updateComplete;
    expect(controls.status).toBe('playing');

    const button = document.createElement('button');
    document.body.append(button);
    button.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true }));
    await trainer.updateComplete;
    expect(controls.status).toBe('playing');
  });
});
