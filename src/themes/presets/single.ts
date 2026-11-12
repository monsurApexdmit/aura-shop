import type { StoreTheme } from "../types";
import { gf } from "./gf";

// Kids & Baby: cream page, soft purple primary, coral-pink highlight, pastel tiles, chunky rounded type.
const single: StoreTheme = {
  id: "single",
  name: "Kids & Baby",
  fontsHref: gf(["Fredoka:wght@500;600;700", "Nunito:wght@400;500;600;700;800", "Hind+Siliguri:wght@400;500;600;700"]),
  fontDisplay: 'Fredoka, "Hind Siliguri", "Arial Rounded MT Bold", system-ui, sans-serif',
  fontBody: 'Nunito, "Hind Siliguri", system-ui, sans-serif',
  radius: "1rem",
  radiusPill: "9999px",
  // Lavender, butter, mint, blush, sky
  tiles: ["252 85% 94%", "42 95% 90%", "158 52% 89%", "345 85% 93%", "205 85% 92%"],
  light: {
    background: "40 60% 98%",
    foreground: "248 38% 18%",
    card: "0 0% 100%",
    primary: "252 58% 60%",
    primaryForeground: "0 0% 100%",
    secondary: "40 40% 95%",
    mutedForeground: "248 12% 42%",
    accent: "252 70% 96%",
    highlight: "346 70% 52%",
    highlightForeground: "0 0% 100%",
    highlightSoft: "343 80% 92%",
    destructive: "0 72% 48%",
    border: "250 30% 91%",
    input: "250 20% 84%",
    ring: "252 58% 60%",
    ink: "252 42% 24%",
    inkForeground: "40 60% 98%",
    cardShadow: "0 2px 8px hsl(252 40% 30% / 0.06)",
    cardShadowHover: "0 18px 36px -16px hsl(252 50% 40% / 0.35)",
  },
  dark: {
    background: "250 28% 8%",
    foreground: "40 40% 96%",
    card: "250 24% 12%",
    primary: "252 85% 74%",
    primaryForeground: "250 30% 10%",
    secondary: "250 20% 16%",
    mutedForeground: "250 12% 68%",
    accent: "252 30% 20%",
    highlight: "346 85% 68%",
    highlightForeground: "250 30% 10%",
    highlightSoft: "343 80% 88%",
    destructive: "0 72% 60%",
    border: "250 18% 20%",
    input: "250 16% 28%",
    ring: "252 85% 74%",
    ink: "252 35% 16%",
    inkForeground: "40 40% 96%",
    cardShadow: "0 2px 8px hsl(0 0% 0% / 0.35)",
    cardShadowHover: "0 18px 36px -16px hsl(0 0% 0% / 0.7)",
  },
};

export default single;
