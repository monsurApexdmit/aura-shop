/**
 * Design tokens for each store template (src/templates), picked in the admin panel
 * (Online store > Template) and served as `onlineStore.themePreset`.
 *
 * A template has its own layouts (header, home, product card, product page, footer) and its own
 * tokens: colours for light and dark mode, fonts, corner radius and card shadows. Shared pages
 * (shop, cart, checkout, account) only use tokens, so they take on the template's look.
 *
 * "editorial" is the original look and its tokens live in index.css; the others override them.
 * To add a template: add its tokens here, its layouts in src/templates/<id>/, the id in the backend
 * list (StorefrontController::THEME_PRESETS) and in the admin gallery (ecommerce-admin lib/storeThemes.ts).
 */

import type { Palette, StoreTheme } from "./types";
import market from "./presets/market";
import luxe from "./presets/luxe";
import single from "./presets/single";
import fresh from "./presets/fresh";

export type { Palette, StoreTheme } from "./types";

export const THEME_IDS = ["editorial", "market", "luxe", "single", "fresh"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const DEFAULT_THEME: ThemeId = "editorial";

/** Only the non-default templates: editorial is index.css as-is. Each lives in presets/<id>.ts. */
export const THEMES: Record<Exclude<ThemeId, "editorial">, StoreTheme> = { market, luxe, single, fresh };

export const isThemeId = (v: unknown): v is ThemeId => typeof v === "string" && (THEME_IDS as readonly string[]).includes(v);

/** Every colour/shadow token index.css defines, filled from a palette. */
export function paletteTokens(p: Palette): Record<string, string> {
  return {
    "--background": p.background,
    "--foreground": p.foreground,
    "--card": p.card,
    "--card-foreground": p.foreground,
    "--popover": p.card,
    "--popover-foreground": p.foreground,
    "--primary": p.primary,
    "--primary-foreground": p.primaryForeground,
    "--secondary": p.secondary,
    "--secondary-foreground": p.foreground,
    "--muted": p.secondary,
    "--muted-foreground": p.mutedForeground,
    "--accent": p.accent,
    "--accent-foreground": p.foreground,
    "--highlight": p.highlight,
    "--highlight-foreground": p.highlightForeground,
    "--highlight-soft": p.highlightSoft,
    "--destructive": p.destructive,
    "--destructive-foreground": "0 0% 100%",
    "--border": p.border,
    "--input": p.input,
    "--ring": p.ring,
    "--ink": p.ink,
    "--ink-foreground": p.inkForeground,
    "--gradient-hero": `linear-gradient(0deg, hsl(${p.background}), hsl(${p.background}))`,
    "--gradient-primary": `linear-gradient(135deg, hsl(${p.primary}), hsl(${p.primary} / 0.85))`,
    "--gradient-accent": `linear-gradient(135deg, hsl(${p.highlight}), hsl(${p.highlight} / 0.85))`,
    "--card-shadow": p.cardShadow,
    "--card-shadow-hover": p.cardShadowHover,
    "--glow-primary": `0 0 22px hsl(${p.highlight} / 0.2)`,
    "--sidebar-background": p.background,
    "--sidebar-foreground": p.foreground,
    "--sidebar-primary": p.primary,
    "--sidebar-primary-foreground": p.primaryForeground,
    "--sidebar-accent": p.accent,
    "--sidebar-accent-foreground": p.foreground,
    "--sidebar-border": p.border,
    "--sidebar-ring": p.ring,
  };
}

const block = (selector: string, tokens: Record<string, string>) =>
  `${selector} {\n${Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;

/**
 * CSS for a theme. Selectors outrank index.css (`:root` / `.dark`) and split light and dark so the
 * light palette never leaks into dark mode. Empty for the default theme.
 */
export function themeCss(id: ThemeId): string {
  if (id === "editorial") return "";
  const t = THEMES[id];
  const shared: Record<string, string> = {
    "--font-display": t.fontDisplay,
    "--font-body": t.fontBody,
    "--radius": t.radius,
    "--radius-pill": t.radiusPill,
    ...Object.fromEntries(t.tiles.map((v, i) => [`--tile-${i + 1}`, v])),
  };
  return [
    block("html:root", shared),
    block("html:root:not(.dark)", paletteTokens(t.light)),
    block("html:root.dark", paletteTokens(t.dark)),
  ].join("\n");
}

export const themeFontsHref = (id: ThemeId): string | undefined => (id === "editorial" ? undefined : THEMES[id].fontsHref);
