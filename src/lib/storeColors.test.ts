import { describe, expect, it } from "vitest";
import { colorLayers } from "./storeColors";

const brand = { primaryColor: "#6B1A2A", accentColor: "#B8963E", backgroundColor: "#F0EBE3" };

describe("colorLayers", () => {
  it("applies brand colours by default, as before themes", () => {
    const out = colorLayers({ theme: "" }, brand);
    expect(out.brand).toContain("html:root:not(.dark)");
    expect(out.brand).toContain("html:root.dark");
    expect(out.accent).toBe("");
  });

  it("drops brand colours when the owner picks the theme's colours", () => {
    expect(colorLayers({ colorSource: "theme" }, brand)).toEqual({ accent: "", brand: "" });
  });

  it("uses the online store accent with theme colours, even if a brand accent exists", () => {
    const out = colorLayers({ colorSource: "theme", theme: "#0F766E" }, brand);
    expect(out.accent).toContain("--highlight: 175 77% 26%");
    expect(out.brand).toBe("");
  });

  it("lets a brand accent outrank the online store accent when brand colours are on", () => {
    expect(colorLayers({ colorSource: "brand", theme: "#0F766E" }, brand).accent).toBe("");
    expect(colorLayers({ colorSource: "brand", theme: "#0F766E" }, { backgroundColor: "#FFFFFF" }).accent).not.toBe("");
  });

  it("ignores bad values instead of breaking the page", () => {
    expect(colorLayers({ theme: "blue" }, {}).accent).toBe("");
    expect(colorLayers({}, { primaryColor: "red" }).brand).toContain("--primary: 24 10% 10%");
  });
});
