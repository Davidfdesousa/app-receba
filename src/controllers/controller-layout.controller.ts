import type { ReactiveController, ReactiveControllerHost } from 'lit';

import { layoutFor, type ControllerId, type ControllerLayout } from '../lib/combo/controller-layout.ts';
import { controllerStore } from '../lib/controller-preference.ts';
import type { Store } from '../lib/store.ts';

/** Keeps a component on the pad the player picked (PlayStation or Xbox), re-rendering on change. */
export class ControllerLayoutController implements ReactiveController {
  id: ControllerId;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly store: Store<ControllerId> = controllerStore,
  ) {
    this.id = store.get();
    host.addController(this);
  }

  get layout(): ControllerLayout {
    return layoutFor(this.id);
  }

  hostConnected(): void {
    this.unsubscribe = this.store.subscribe((id) => {
      if (id === this.id) return;
      this.id = id;
      this.host.requestUpdate();
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }
}
