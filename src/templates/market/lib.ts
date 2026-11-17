import type { TFunction } from "i18next";
import type { CouponResult } from "@/services/couponApi";
import type { ApiCategory } from "@/services/categoryApi";
import { getImageUrl } from "@/lib/api";

/** Keyboard focus ring that reads on light, dark and blue surfaces. */
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Page width: a centred 1280px column (the reference grid), 16px gutters on phones. */
export const WRAP = "mx-auto w-full max-w-[1280px] px-4 md:px-6 lg:px-8";

/** White panel used by most home blocks. */
export const PANEL = "rounded-xl border border-border bg-card";

/** Tile grounds for lettered placeholders (full class names so Tailwind keeps them). */
export const TILES = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4", "bg-tile-5"] as const;
export const tile = (i: number) => TILES[((i % TILES.length) + TILES.length) % TILES.length];

/** 950 → "950", 1200 → "1.2k", 2_500_000 → "2.5M" */
export function compactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export const categoryLink = (cat: Pick<ApiCategory, "slug">) => `/shop?cat=${cat.slug}`;
export const categoryImage = (cat: Pick<ApiCategory, "image">) => (cat.image ? getImageUrl(cat.image) : null);

/** "20% off", "৳200 off" or "Free delivery" for a coupon. */
export function couponOffer(c: CouponResult, format: (n: number) => string, t: TFunction): string {
  if (c.free_shipping) return t("tpl_market:buyBox.freeDelivery");
  return t("common:product.off", { value: c.type === "fixed" ? format(Number(c.discount ?? 0)) : `${c.discount}%` });
}

/**
 * Link labels the shared chrome hook builds in English, by route + label. Owner pages and aisles keep
 * their own titles (they never match both).
 */
const CHROME_LABELS: Record<string, string> = {
  "/shop|Shop all": "tpl_market:nav.shopAll",
  "/collections|Collections": "common:nav.collections",
  "/deals|Deals": "common:nav.deals",
  "/contact|Contact": "common:nav.contact",
  "/track-order|Track order": "common:nav.trackOrder",
  "/account|My account": "common:nav.myAccount",
};

export function navLabel(t: TFunction, link: { label: string; to: string }): string {
  const key = CHROME_LABELS[`${link.to}|${link.label}`];
  return key ? t(key) : link.label;
}

/** Copies text, falling back to a hidden input where the Clipboard API is missing (older Android browsers). */
export async function copyText(text: string): Promise<void> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement("input");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
}
