/**
 * Colour layers that sit on top of the store theme (see storeTheme.ts):
 *   accent — Online store accent colour; recolours the highlight only
 *   brand  — Company settings brand colours; replace the theme's colours (fonts and shapes stay)
 *
 * Brand colours apply unless the owner chose the theme's colours (onlineStore.colorSource = "theme").
 */

function hexToHsl(hex: string): string | null {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return null;
  const r = parseInt(m[0], 16) / 255;
  const g = parseInt(m[1], 16) / 255;
  const b = parseInt(m[2], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hexLightness(hex: string): number {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return 50;
  const r = parseInt(m[0], 16) / 255;
  const g = parseInt(m[1], 16) / 255;
  const b = parseInt(m[2], 16) / 255;
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}

// Same specificity as the theme layer (src/themes) so layer order decides, and light values never leak into dark mode.
const LIGHT = "html:root:not(.dark)";
const DARK = "html:root.dark";

// The storefront's "accent" token is the subtle hover surface, so the admin accent
// colour drives --highlight (the brand pop: italic headline word, Sale link, badges).
// Settings > General brand colours: replace the theme's colours, keep its fonts and shapes.
function brandColorsCss(primary: string, accent: string, bg: string): string {
  const pH  = hexToHsl(primary)!;
  const aH  = hexToHsl(accent)!;
  const bgH = hexToHsl(bg)!;
  const pLight  = hexLightness(primary);
  const aLight  = hexLightness(accent);
  const bgLight = hexLightness(bg);

  const [bh, bs] = bgH.split(" ");
  const cardL   = bgLight > 50 ? Math.min(bgLight + 4, 100) : Math.max(bgLight - 4, 0);
  const borderL = bgLight > 50 ? Math.max(bgLight - 10, 60)  : Math.min(bgLight + 10, 40);
  const mutedL  = bgLight > 50 ? bgLight - 5 : bgLight + 5;
  const fg      = bgLight > 50 ? "0 0% 8%"   : "0 0% 96%";
  const fgMuted = bgLight > 50 ? "0 0% 45%"  : "0 0% 60%";
  const pFg     = pLight  < 50 ? "0 0% 98%"  : "0 0% 8%";
  const aFg     = aLight  < 50 ? "0 0% 98%"  : "0 0% 8%";

  // Dark mode keeps the default light-on-dark primary; only the ground and highlight follow the brand.
  const darkBgL   = 10;
  const darkCardL = 14;

  const [ah, as] = aH.split(" ");

  return `
${LIGHT} {
  --primary: ${pH};
  --primary-foreground: ${pFg};
  --highlight: ${aH};
  --highlight-foreground: ${aFg};
  --highlight-soft: ${ah} ${as} 86%;
  --background: ${bgH};
  --foreground: ${fg};
  --card: ${bh} ${bs} ${Math.round(cardL)}%;
  --card-foreground: ${fg};
  --popover: ${bh} ${bs} ${Math.round(cardL)}%;
  --popover-foreground: ${fg};
  --border: ${bh} ${bs} ${Math.round(borderL)}%;
  --input: ${bh} ${bs} ${Math.round(borderL)}%;
  --muted: ${bh} ${bs} ${Math.round(mutedL)}%;
  --muted-foreground: ${fgMuted};
  --ring: ${pH};
  --gradient-primary: linear-gradient(135deg, hsl(${pH}), hsl(${pH} / 0.8));
  --gradient-accent: linear-gradient(135deg, hsl(${aH}), hsl(${aH} / 0.8));
}
${DARK} {
  --highlight: ${aH};
  --highlight-foreground: ${aFg};
  --highlight-soft: ${ah} ${as} 86%;
  --background: ${bh} ${bs} ${darkBgL}%;
  --card: ${bh} ${bs} ${darkCardL}%;
  --popover: ${bh} ${bs} ${darkCardL}%;
  --border: ${bh} ${bs} 20%;
  --input: ${bh} ${bs} 20%;
  --muted: ${bh} ${bs} 18%;
  --ring: ${aH};
}`;
}

// Online store accent colour (admin: Online store > Theme > Accent) only recolours the highlight.
function accentCss(hex: string): string {
  const h = hexToHsl(hex)!;
  const [hh, hs] = h.split(" ");
  const fgOn = hexLightness(hex) < 50 ? "0 0% 98%" : "0 0% 8%";
  return `${LIGHT}, ${DARK} { --highlight: ${h}; --highlight-foreground: ${fgOn}; --highlight-soft: ${hh} ${hs} 86%; }`;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const hexOr = (v: string | null | undefined, fallback: string) => (v && HEX.test(v.trim()) ? v.trim() : fallback);

export interface ColorSettings {
  primaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
}

export interface ColorChoice {
  /** Accent colour hex, or "" for the theme's own */
  theme?: string | null;
  colorSource?: string | null;
}

export function colorLayers(store: ColorChoice, brand: ColorSettings): { accent: string; brand: string } {
  const useBrand = store.colorSource !== "theme" && !!(brand.primaryColor || brand.accentColor || brand.backgroundColor);
  const accent = store.theme?.trim() ?? "";
  // A brand accent outranks the online store accent, as before themes
  const accentApplies = HEX.test(accent) && !(useBrand && brand.accentColor);
  return {
    accent: accentApplies ? accentCss(accent) : "",
    brand: useBrand
      ? brandColorsCss(hexOr(brand.primaryColor, "#1C1917"), hexOr(brand.accentColor, "#94234A"), hexOr(brand.backgroundColor, "#FFFFFF"))
      : "",
  };
}
