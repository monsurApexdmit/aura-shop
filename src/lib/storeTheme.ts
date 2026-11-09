import { DEFAULT_THEME, isThemeId, themeCss, themeFontsHref, type ThemeId } from "@/themes";

/**
 * The store's look is three CSS layers written, in this order, into one <style id="store-theme">:
 *   1. theme   — the theme picked in admin (Online store > Theme)
 *   2. accent  — optional accent colour from the same page (recolours the highlight only)
 *   3. brand   — Settings > General brand colours, which win over both
 *
 * The layers and the font stylesheet are cached in localStorage. The inline script in index.html
 * applies the cache before the app boots, so returning visitors never see the default theme flash.
 */

export type ThemeLayer = "theme" | "accent" | "brand";
const ORDER: ThemeLayer[] = ["theme", "accent", "brand"];

export const STORAGE_KEY = "store-theme";
export const STYLE_ID = "store-theme";
export const FONTS_ID = "store-theme-fonts";

interface Cached {
  themeId: ThemeId;
  fontsHref: string | null;
  layers: Partial<Record<ThemeLayer, string>>;
}

function readCache(): Cached {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (raw && typeof raw === "object" && raw.layers && typeof raw.layers === "object") {
      const themeId = isThemeId(raw.themeId) ? raw.themeId : DEFAULT_THEME;
      return {
        themeId,
        fontsHref: themeFontsHref(themeId) ?? null,
        layers: raw.layers,
      };
    }
  } catch {
    /* private mode or bad JSON: start clean */
  }
  return { themeId: DEFAULT_THEME, fontsHref: null, layers: {} };
}

const state: Cached = readCache();

function write() {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = ORDER.map((l) => state.layers[l] || "").filter(Boolean).join("\n");

  let link = document.getElementById(FONTS_ID) as HTMLLinkElement | null;
  if (state.fontsHref) {
    if (!link) {
      link = document.createElement("link");
      link.id = FONTS_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.getAttribute("href") !== state.fontsHref) link.href = state.fontsHref;
  } else {
    link?.remove();
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: the theme still applies for this visit */
  }
}

export function setThemeLayer(layer: ThemeLayer, css: string) {
  if ((state.layers[layer] || "") === css) return;
  state.layers[layer] = css;
  write();
}

/** Apply a theme by id; unknown or empty ids fall back to the default theme. */
export function applyStoreTheme(id: string | null | undefined): ThemeId {
  const themeId = isThemeId(id) ? id : DEFAULT_THEME;
  const changed = state.themeId !== themeId;
  state.themeId = themeId;
  state.fontsHref = themeFontsHref(themeId) ?? null;
  state.layers.theme = themeCss(themeId);
  write();
  if (changed) listeners.forEach((l) => l());
  return themeId;
}

export const currentThemeId = (): ThemeId => state.themeId;

// The store template (layouts) follows the theme id; components subscribe via useStoreTemplate().
const listeners = new Set<() => void>();
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
