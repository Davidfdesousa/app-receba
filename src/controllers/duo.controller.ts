import type { ReactiveController, ReactiveControllerHost } from 'lit';

import type { ComboSetLoader } from '../data/combo-sets/index.ts';
import type { ComboSet } from '../lib/combo/combo.types.ts';
import { readDuoPreference, storeDuoPreference } from '../lib/preferences.ts';
import { duoId, findFighter, findKameo, resolveDuo } from '../lib/roster/roster.ts';
import type { DuoId, DuoSelection, FighterProfile, Kameo, Roster } from '../lib/roster/roster.types.ts';

/**
 * - `loading`: fetching the combos of the selected duo (the previous set stays visible);
 * - `ready`: `comboSet` holds the selected duo's combos;
 * - `missing`: the duo has no combos yet;
 * - `error`: the combos could not be loaded (offline after a deploy, for instance).
 */
export type ComboSetStatus = 'loading' | 'ready' | 'missing' | 'error';

export interface DuoControllerOptions {
  roster: Roster;
  loaders: Readonly<Record<DuoId, ComboSetLoader>>;
  /** Duo used when nothing valid was saved. */
  fallback: DuoSelection;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
}

/**
 * Owns the picked duo: restores the saved one, remembers new picks and loads the
 * duo's combo set on demand. Out-of-order loads are ignored, so only the latest pick lands.
 */
export class DuoController implements ReactiveController {
  selection: DuoSelection;
  comboSet: ComboSet | null = null;
  status: ComboSetStatus = 'loading';

  private request = 0;
  private started = false;
  private pending: Promise<void> | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: DuoControllerOptions,
  ) {
    host.addController(this);
    const saved = readDuoPreference(options.storage);
    this.selection = resolveDuo(options.roster, saved, options.fallback);
  }

  hostConnected(): void {
    if (this.started) return;
    this.started = true;
    void this.load();
  }

  get fighter(): FighterProfile | undefined {
    return findFighter(this.options.roster, this.selection.fighterId);
  }

  get kameo(): Kameo | undefined {
    return findKameo(this.options.roster, this.selection.kameoId);
  }

  select(next: DuoSelection): void {
    const resolved = resolveDuo(this.options.roster, next, this.selection);
    const { fighterId, kameoId } = this.selection;
    if (resolved.fighterId === fighterId && resolved.kameoId === kameoId) return;

    this.selection = resolved;
    storeDuoPreference(resolved, this.options.storage);
    void this.load();
  }

  /** Resolves once the current selection has loaded (or failed). Useful in tests. */
  get settled(): Promise<void> {
    return this.pending ?? Promise.resolve();
  }

  private load(): Promise<void> {
    const request = ++this.request;
    const loader = this.options.loaders[duoId(this.selection.fighterId, this.selection.kameoId)];

    if (!loader) {
      this.comboSet = null;
      this.status = 'missing';
      this.host.requestUpdate();
      this.pending = null;
      return Promise.resolve();
    }

    this.status = 'loading';
    this.host.requestUpdate();

    this.pending = loader().then(
      (comboSet) => {
        if (request !== this.request) return;
        this.comboSet = comboSet;
        this.status = 'ready';
        this.host.requestUpdate();
      },
      () => {
        if (request !== this.request) return;
        this.comboSet = null;
        this.status = 'error';
        this.host.requestUpdate();
      },
    );
    return this.pending;
  }
}
