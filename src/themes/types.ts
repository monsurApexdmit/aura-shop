import type { ThemeId } from "./index";

/** HSL triplets ("220 15% 9%") unless noted. */
export interface Palette {
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

