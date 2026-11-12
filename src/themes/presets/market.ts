import type { StoreTheme } from "../types";
import { gf } from "./gf";

// Tech Store: electronics and gadgets. Cool grey-blue page, white cards, one confident blue for
// buttons and links, red sale tags, amber stars (drawn by the template). Crisp, compact type.
const market: StoreTheme = {
  id: "market",
  name: "Tech Store",
  fontsHref: gf(["Plus+Jakarta+Sans:wght@500;600;700;800", "Inter:wght@400;500;600;700", "Hind+Siliguri:wght@400;500;600;700"]),
  fontDisplay: '"Plus Jakarta Sans", Inter, "Hind Siliguri", "Segoe UI", system-ui, sans-serif',
  fontBody: 'Inter, "Hind Siliguri", "Segoe UI", system-ui, sans-serif',
  radius: "0.625rem",
  radiusPill: "0.5rem",
  tiles: ["221 85% 95%", "199 85% 94%", "250 75% 96%", "165 55% 93%", "32 90% 94%"],
  light: {
    background: "220 33% 97%",
    foreground: "222 47% 11%",
    card: "0 0% 100%",
    primary: "221 83% 53%",
    primaryForeground: "0 0% 100%",
    secondary: "220 30% 95%",
    mutedForeground: "220 9% 44%",
    accent: "221 90% 96%",
    highlight: "217 91% 55%",
    highlightForeground: "0 0% 100%",
    highlightSoft: "214 95% 86%",
    destructive: "0 80% 55%",
    border: "220 20% 90%",
    input: "220 18% 85%",
    ring: "221 83% 53%",
    ink: "222 47% 11%",
    inkForeground: "0 0% 100%",
    cardShadow: "0 1px 2px hsl(222 47% 11% / 0.04)",
    cardShadowHover: "0 14px 30px -14px hsl(221 60% 25% / 0.25)",
  },
  dark: {
    background: "222 36% 7%",
    foreground: "214 32% 94%",
    card: "222 30% 11%",
    primary: "217 91% 60%",
    primaryForeground: "0 0% 100%",
    secondary: "222 26% 15%",
    mutedForeground: "218 14% 66%",
    accent: "221 40% 17%",
    highlight: "213 94% 66%",
    highlightForeground: "222 47% 8%",
    highlightSoft: "214 95% 80%",
    destructive: "0 72% 58%",
    border: "222 22% 19%",
    input: "222 20% 26%",
    ring: "217 91% 60%",
    ink: "222 34% 13%",
    inkForeground: "214 32% 94%",
    cardShadow: "0 1px 2px hsl(0 0% 0% / 0.3)",
    cardShadowHover: "0 14px 30px -14px hsl(0 0% 0% / 0.65)",
  },
};

export default market;
