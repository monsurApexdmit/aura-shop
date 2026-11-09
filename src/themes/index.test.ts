import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { THEMES, THEME_IDS, isThemeId, paletteTokens, themeCss } from "./index";

const css = readFileSync(path.resolve(__dirname, "../index.css"), "utf8");
const varsIn = (selector: RegExp) => {
  const body = css.match(selector)?.[1] ?? "";
  return [...body.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]);
};
// Status colours stay the same in every theme
const SHARED_STATUS = ["--success", "--warning", "--info"];

describe("store themes", () => {
  it("override every token the default theme defines, in light and dark", () => {
    const light = varsIn(/:root\s*{([^}]*)}/).filter((v) => !SHARED_STATUS.includes(v));
    const dark = varsIn(/\.dark\s*{([^}]*)}/);
    expect(light.length).toBeGreaterThan(30);

    for (const theme of Object.values(THEMES)) {
      const out = themeCss(theme.id);
      for (const v of light) expect(out, `${theme.id} light ${v}`).toMatch(new RegExp(`${v}:`));
      const darkBlock = out.split("html:root.dark")[1];
      for (const v of dark) expect(darkBlock, `${theme.id} dark ${v}`).toMatch(new RegExp(`${v}:`));
    }
  });

  it("emits nothing for the default theme", () => {
    expect(themeCss("editorial")).toBe("");
  });

  it("scopes light and dark so neither leaks into the other", () => {
    const out = themeCss("market");
    expect(out).toContain("html:root:not(.dark) {");
    expect(out).toContain("html:root.dark {");
    expect(out).toContain('--font-display: Sora');
  });

  it("uses HSL triplets for colour tokens", () => {
    for (const theme of Object.values(THEMES)) {
      for (const p of [theme.light, theme.dark]) {
        for (const [k, v] of Object.entries(paletteTokens(p))) {
          if (/gradient|shadow|glow/.test(k)) continue;
          expect(v, `${theme.id} ${k}`).toMatch(/^\d+(\.\d+)? \d+(\.\d+)?% \d+(\.\d+)?%$/);
        }
      }
      for (const t of theme.tiles) expect(t).toMatch(/^\d+(\.\d+)? \d+(\.\d+)?% \d+(\.\d+)?%$/);
    }
  });

  it("knows its ids", () => {
    expect(THEME_IDS).toEqual(["editorial", "market", "luxe", "single", "fresh"]);
    expect(isThemeId("luxe")).toBe(true);
    expect(isThemeId("#2449E8")).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
  });
});
