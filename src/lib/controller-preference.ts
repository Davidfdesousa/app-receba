import {
  defaultControllerId,
  isControllerId,
  layoutFor,
  type ControllerId,
  type ControllerLayout,
} from './combo/controller-layout.ts';
import { createStore, type Store } from './store.ts';

export const controllerStorageKey = 'app:controller';

export function readControllerId(storage: Pick<Storage, 'getItem'> = localStorage): ControllerId {
  try {
    const saved = storage.getItem(controllerStorageKey);
    return isControllerId(saved) ? saved : defaultControllerId;
  } catch {
    return defaultControllerId;
  }
}

/** The pad the player picked, shared by every glyph on the page. */
export const controllerStore: Store<ControllerId> = createStore<ControllerId>(readControllerId());

/** Switches every glyph to another pad and remembers the choice. */
export function selectController(
  id: ControllerId,
  storage: Pick<Storage, 'setItem'> = localStorage,
  store: Store<ControllerId> = controllerStore,
): void {
  try {
    storage.setItem(controllerStorageKey, id);
  } catch {
    // Storage can be unavailable. The choice still applies for this visit.
  }
  store.set(id);
}

export function activeLayout(store: Store<ControllerId> = controllerStore): ControllerLayout {
  return layoutFor(store.get());
}
