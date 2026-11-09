import { useSyncExternalStore } from "react";
import { currentThemeId, subscribeTheme } from "@/lib/storeTheme";
import type { ThemeId } from "@/themes";
import type { StoreTemplate } from "./types";
import editorial from "./editorial";

/**
 * Store templates by id (the admin's Online store > Template, `onlineStore.themePreset`).
 * Editorial ships in the main bundle; the others load on demand, so a store only downloads its own.
 */
const loaders: Record<Exclude<ThemeId, "editorial">, () => Promise<{ default: StoreTemplate }>> = {
  market: () => import("./market"),
  luxe: () => import("./luxe"),
  single: () => import("./single"),
  fresh: () => import("./fresh"),
};

const loaded: Partial<Record<ThemeId, StoreTemplate>> = { editorial };
const pending = new Set<ThemeId>();
const listeners = new Set<() => void>();
let version = 0;

function notify() {
  version++;
  listeners.forEach((l) => l());
}

function ensure(id: ThemeId) {
  if (loaded[id] || pending.has(id) || id === "editorial") return;
  pending.add(id);
  loaders[id]()
    .then((m) => { loaded[id] = m.default; })
    // A failed chunk (offline, old deploy) falls back to the original look rather than a blank page
    .catch(() => { loaded[id] = editorial; })
    .finally(() => { pending.delete(id); notify(); });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const off = subscribeTheme(() => { ensure(currentThemeId()); listener(); });
  return () => { listeners.delete(listener); off(); };
}

// Start loading the remembered template right away, before the first render asks for it.
ensure(currentThemeId());

/** The active template, or null for a moment while its code loads. */
export function useStoreTemplate(): StoreTemplate | null {
  useSyncExternalStore(subscribe, () => `${currentThemeId()}:${version}`);
  const id = currentThemeId();
  ensure(id);
  return loaded[id] ?? null;
}
