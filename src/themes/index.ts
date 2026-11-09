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

export const THEME_IDS = ["editorial", "market", "luxe", "single", "fresh"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const DEFAULT_THEME: ThemeId = "editorial";

/** HSL triplets ("220 15% 9%") unless noted. */
interface Palette {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  primaryForeground: string;
  /** Quiet surfaces: secondary buttons, muted panels */
  secondary: string;
  mutedForeground: string;
  /** Hover surface for ghost buttons and menu items */
  accent: string;
  /** Brand pop: sale tags, badges, key buttons, highlighted words */
  highlight: string;
  highlightForeground: string;
  /** Highlight tint readable on top of photos */
  highlightSoft: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  /** Inverse surface: footers, bars, banners */
  ink: string;
  inkForeground: string;
  /** Full CSS box-shadow values */
  cardShadow: string;
  cardShadowHover: string;
}

export interface StoreTheme {
  id: ThemeId;
  name: string;
  /** Google Fonts stylesheet for the fonts below; omitted when index.css already loads them */
  fontsHref?: string;
  fontDisplay: string;
  fontBody: string;
  /** Base corner radius; cards and panels scale from it */
  radius: string;
  /** Buttons, chips and the search box */
  radiusPill: string;
  /** Photo backgrounds, cycled by index. Keep them light: dark text sits on them in both modes. */
  tiles: [string, string, string, string, string];
  light: Palette;
  dark: Palette;
}

const gf = (families: string[]) =>
  `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;

/** Only the non-default templates: editorial is index.css as-is. */
export const THEMES: Record<Exclude<ThemeId, "editorial">, StoreTheme> = {
  // Big marketplace: grey page, white cards, navy bars, raspberry for prices and deals. Dense and legible.
  market: {
    id: "market",
    name: "Mega Market",
    fontsHref: gf(["Sora:wght@600;700;800", "Inter:wght@400;500;600;700"]),
    fontDisplay: 'Sora, "Segoe UI", system-ui, sans-serif',
    fontBody: 'Inter, "Segoe UI", system-ui, sans-serif',
    radius: "0.5rem",
    radiusPill: "0.375rem",
    tiles: ["220 20% 94%", "210 40% 94%", "30 60% 94%", "150 30% 93%", "270 30% 95%"],
    light: {
      background: "220 20% 95%",
      foreground: "222 30% 12%",
      card: "0 0% 100%",
      primary: "222 47% 16%",
      primaryForeground: "0 0% 100%",
      secondary: "220 18% 92%",
      mutedForeground: "220 9% 42%",
      accent: "220 20% 93%",
      highlight: "350 80% 47%",
      highlightForeground: "0 0% 100%",
      highlightSoft: "350 100% 85%",
      destructive: "0 75% 45%",
      border: "220 14% 88%",
      input: "220 12% 80%",
      ring: "222 47% 16%",
      ink: "222 47% 13%",
      inkForeground: "0 0% 100%",
      cardShadow: "0 1px 2px hsl(222 30% 12% / 0.06)",
      cardShadowHover: "0 8px 22px -8px hsl(222 30% 12% / 0.22)",
    },
    dark: {
      background: "222 30% 7%",
      foreground: "220 15% 93%",
      card: "222 25% 11%",
      primary: "220 15% 93%",
      primaryForeground: "222 30% 8%",
      secondary: "222 20% 15%",
      mutedForeground: "220 9% 62%",
      accent: "222 20% 17%",
      highlight: "350 90% 62%",
      highlightForeground: "0 0% 100%",
      highlightSoft: "350 100% 85%",
      destructive: "0 70% 55%",
      border: "222 18% 19%",
      input: "222 16% 26%",
      ring: "350 90% 62%",
      ink: "222 35% 10%",
      inkForeground: "220 15% 93%",
      cardShadow: "0 1px 2px hsl(0 0% 0% / 0.3)",
      cardShadowHover: "0 10px 24px -8px hsl(0 0% 0% / 0.6)",
    },
  },

  // Fashion and luxury: pure white, black type, Didone serif, square corners, almost no colour.
  luxe: {
    id: "luxe",
    name: "Luxe Lookbook",
    fontsHref: gf(["Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;1,6..96,400;1,6..96,500", "Jost:wght@300;400;500;600"]),
    fontDisplay: '"Bodoni Moda", Didot, "Times New Roman", serif',
    fontBody: 'Jost, Futura, "Helvetica Neue", system-ui, sans-serif',
    radius: "0rem",
    radiusPill: "0rem",
    tiles: ["30 10% 94%", "20 8% 91%", "40 12% 93%", "0 0% 93%", "35 14% 90%"],
    light: {
      background: "0 0% 100%",
      foreground: "0 0% 7%",
      card: "0 0% 100%",
      primary: "0 0% 7%",
      primaryForeground: "0 0% 100%",
      secondary: "30 8% 96%",
      mutedForeground: "0 0% 40%",
      accent: "30 8% 94%",
      highlight: "12 40% 40%",
      highlightForeground: "0 0% 100%",
      highlightSoft: "20 50% 86%",
      destructive: "0 60% 42%",
      border: "0 0% 88%",
      input: "0 0% 70%",
      ring: "0 0% 7%",
      ink: "0 0% 7%",
      inkForeground: "0 0% 100%",
      cardShadow: "none",
      cardShadowHover: "none",
    },
    dark: {
      background: "0 0% 5%",
      foreground: "30 10% 92%",
      card: "0 0% 7%",
      primary: "30 10% 92%",
      primaryForeground: "0 0% 5%",
      secondary: "0 0% 11%",
      mutedForeground: "30 5% 60%",
      accent: "0 0% 13%",
      highlight: "18 45% 66%",
      highlightForeground: "0 0% 5%",
      highlightSoft: "20 50% 86%",
      destructive: "0 60% 55%",
      border: "0 0% 17%",
      input: "0 0% 30%",
      ring: "30 10% 92%",
      ink: "0 0% 9%",
      inkForeground: "30 10% 92%",
      cardShadow: "none",
      cardShadowHover: "none",
    },
  },

  // One-product landing page for ad traffic: bold rounded display face, Bengali-ready body, green "order" action.
  single: {
    id: "single",
    name: "Single Product",
    fontsHref: gf(["Unbounded:wght@500;600;700;800", "Hind+Siliguri:wght@400;500;600;700"]),
    fontDisplay: 'Unbounded, "Arial Black", system-ui, sans-serif',
    fontBody: '"Hind Siliguri", system-ui, sans-serif',
    radius: "1.25rem",
    radiusPill: "9999px",
    tiles: ["40 100% 92%", "152 50% 90%", "260 60% 94%", "200 70% 92%", "20 90% 92%"],
    light: {
      background: "40 40% 98%",
      foreground: "250 30% 12%",
      card: "0 0% 100%",
      primary: "250 30% 12%",
      primaryForeground: "0 0% 100%",
      secondary: "40 30% 94%",
      mutedForeground: "250 8% 40%",
      accent: "40 30% 92%",
      highlight: "152 76% 32%",
      highlightForeground: "0 0% 100%",
      highlightSoft: "152 70% 80%",
      destructive: "0 75% 45%",
      border: "40 15% 87%",
      input: "40 10% 78%",
      ring: "152 76% 32%",
      ink: "250 30% 12%",
      inkForeground: "40 40% 98%",
      cardShadow: "0 2px 6px hsl(250 30% 12% / 0.06)",
      cardShadowHover: "0 16px 36px -14px hsl(250 30% 12% / 0.3)",
    },
    dark: {
      background: "250 25% 7%",
      foreground: "40 30% 95%",
      card: "250 20% 11%",
      primary: "40 30% 95%",
      primaryForeground: "250 25% 8%",
      secondary: "250 16% 15%",
      mutedForeground: "250 8% 65%",
      accent: "250 16% 17%",
      highlight: "152 65% 48%",
      highlightForeground: "250 25% 7%",
      highlightSoft: "152 70% 80%",
      destructive: "0 70% 55%",
      border: "250 14% 19%",
      input: "250 12% 27%",
      ring: "152 65% 48%",
      ink: "250 22% 11%",
      inkForeground: "40 30% 95%",
      cardShadow: "0 2px 6px hsl(0 0% 0% / 0.3)",
      cardShadowHover: "0 16px 36px -14px hsl(0 0% 0% / 0.6)",
    },
  },

  // Grocery and daily needs: fresh green, warm yellow offers, rounded friendly type, quick add buttons.
  fresh: {
    id: "fresh",
    name: "Daily Fresh",
    fontsHref: gf(["Baloo+Da+2:wght@500;600;700;800", "Nunito:ital,wght@0,400;0,600;0,700;0,800;1,700"]),
    fontDisplay: '"Baloo Da 2", "Trebuchet MS", system-ui, sans-serif',
    fontBody: 'Nunito, system-ui, sans-serif',
    radius: "1rem",
    radiusPill: "9999px",
    tiles: ["95 45% 90%", "48 90% 88%", "16 85% 90%", "180 35% 88%", "130 35% 88%"],
    light: {
      background: "100 30% 97%",
      foreground: "150 30% 12%",
      card: "0 0% 100%",
      primary: "150 62% 27%",
      primaryForeground: "0 0% 100%",
      secondary: "100 25% 93%",
      mutedForeground: "150 8% 38%",
      accent: "100 25% 91%",
      highlight: "40 96% 52%",
      highlightForeground: "150 30% 10%",
      highlightSoft: "45 100% 75%",
      destructive: "0 72% 45%",
      border: "100 15% 86%",
      input: "100 12% 76%",
      ring: "150 62% 27%",
      ink: "150 50% 17%",
      inkForeground: "100 30% 97%",
      cardShadow: "0 1px 3px hsl(150 30% 12% / 0.07)",
      cardShadowHover: "0 12px 26px -12px hsl(150 30% 12% / 0.3)",
    },
    dark: {
      background: "150 25% 6%",
      foreground: "100 20% 93%",
      card: "150 20% 9%",
      primary: "145 55% 50%",
      primaryForeground: "150 30% 6%",
      secondary: "150 16% 13%",
      mutedForeground: "100 8% 62%",
      accent: "150 16% 16%",
      highlight: "42 96% 58%",
      highlightForeground: "150 30% 8%",
      highlightSoft: "45 100% 75%",
      destructive: "0 65% 55%",
      border: "150 14% 18%",
      input: "150 12% 25%",
      ring: "145 55% 50%",
      ink: "150 35% 10%",
      inkForeground: "100 20% 93%",
      cardShadow: "0 1px 3px hsl(0 0% 0% / 0.3)",
      cardShadowHover: "0 12px 26px -12px hsl(0 0% 0% / 0.6)",
    },
  },
};

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
