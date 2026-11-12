import { beforeEach, describe, expect, it, vi } from "vitest";

const load = async () => {
  vi.resetModules();
  return import("./storeTheme");
};

const styleText = () => document.getElementById("store-theme")?.textContent ?? "";
const fontsLink = () => document.getElementById("store-theme-fonts") as HTMLLinkElement | null;

describe("storeTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = "";
  });

  it("applies a theme with its fonts and caches it", async () => {
    const { applyStoreTheme, STORAGE_KEY } = await load();
    expect(applyStoreTheme("luxe")).toBe("luxe");

    expect(styleText()).toContain("Playfair Display");
    expect(fontsLink()?.href).toContain("fonts.googleapis.com");
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(cached.themeId).toBe("luxe");
    expect(cached.layers.theme).toContain("--radius: 0.75rem");
  });

  it("falls back to the default theme for unknown ids and drops the extra fonts", async () => {
    const { applyStoreTheme } = await load();
    applyStoreTheme("fresh");
    expect(fontsLink()).not.toBeNull();

    expect(applyStoreTheme("#2449E8")).toBe("editorial");
    expect(styleText()).toBe("");
    expect(fontsLink()).toBeNull();
  });

  it("writes layers in order: theme, accent, brand", async () => {
    const { applyStoreTheme, setThemeLayer } = await load();
    setThemeLayer("brand", "/* brand */");
    setThemeLayer("accent", "/* accent */");
    applyStoreTheme("market");

    const text = styleText();
    expect(text.indexOf("Hind Siliguri")).toBeLessThan(text.indexOf("/* accent */"));
    expect(text.indexOf("/* accent */")).toBeLessThan(text.indexOf("/* brand */"));
  });

  it("keeps cached layers on reload until fresh settings replace them", async () => {
    (await load()).setThemeLayer("brand", "/* brand */");
    document.head.innerHTML = "";

    const { applyStoreTheme } = await load();
    applyStoreTheme("fresh");
    expect(styleText()).toContain("/* brand */");
  });

  it("survives broken storage", async () => {
    localStorage.setItem("store-theme", "{not json");
    const { applyStoreTheme, currentThemeId } = await load();
    expect(currentThemeId()).toBe("editorial");
    applyStoreTheme("market");
    expect(styleText()).toContain("Hind Siliguri");
  });
});
