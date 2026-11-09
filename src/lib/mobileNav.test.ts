import { describe, it, expect } from "vitest";
import { hidesTabBar, isTabRoot } from "./mobileNav";

describe("mobileNav", () => {
  it("treats tab screens as roots", () => {
    expect(isTabRoot("/")).toBe(true);
    expect(isTabRoot("/categories")).toBe(true);
    expect(isTabRoot("/account/")).toBe(true);
    expect(isTabRoot("/product/t-shirt")).toBe(false);
    expect(isTabRoot("/account/orders")).toBe(false);
  });

  it("hides the tab bar on screens with their own action bar", () => {
    expect(hidesTabBar("/product/t-shirt")).toBe(true);
    expect(hidesTabBar("/checkout")).toBe(true);
    expect(hidesTabBar("/order/t-shirt")).toBe(true);
    expect(hidesTabBar("/order/result")).toBe(false);
    expect(hidesTabBar("/shop")).toBe(false);
  });
});
