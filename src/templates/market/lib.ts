import { Truck, RotateCcw, ShieldCheck, Heart, Gift, Star, Sparkles, Package, Clock, Phone, type LucideIcon } from "lucide-react";
import type { CouponResult } from "@/services/couponApi";
import type { HomepagePerkIcon } from "@/services/storefrontSettingsApi";
import type { ApiCategory } from "@/services/categoryApi";
import { getImageUrl } from "@/lib/api";

/** Keyboard focus ring that reads on light, dark and ink surfaces. */
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
export const subCategoryLink = (cat: Pick<ApiCategory, "slug">, sub: { slug: string }) => `/shop?cat=${cat.slug}&sub=${sub.slug}`;
export const categoryImage = (cat: Pick<ApiCategory, "image">) => (cat.image ? getImageUrl(cat.image) : null);

/** "20% off", "৳200 off" or "Free delivery" for a coupon. */
export function couponOffer(c: CouponResult, format: (n: number) => string): string {
  if (c.free_shipping) return "Free delivery";
  return c.type === "fixed" ? `${format(Number(c.discount ?? 0))} off` : `${c.discount}% off`;
}

export function couponCondition(c: CouponResult, format: (n: number) => string): string {
  return c.min_order_amount ? `Min. spend ${format(Number(c.min_order_amount))}` : "No minimum spend";
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

export const PERK_ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift,
  star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};
