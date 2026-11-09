import { toast } from "sonner";
import type { CouponResult } from "@/services/couponApi";

/** Soft produce-tile grounds behind photos, cycled by index (always light, so use `text-ink` on them). */
const TILES = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4", "bg-tile-5"] as const;
export const tile = (i: number) => TILES[((i % TILES.length) + TILES.length) % TILES.length];

/** Copies a coupon code (with a fallback for older phone browsers) and confirms with a toast. */
export async function copyCode(code: string) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(code);
  } catch {
    const input = document.createElement("input");
    input.value = code;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
  toast.success(`Code ${code} copied`, { description: "Paste it at checkout." });
}

/** "10% off", "৳50 off" or "Free delivery" for a coupon. */
export function couponOffer(c: CouponResult, formatCurrency: (n: number) => string) {
  if (c.free_shipping) return "Free delivery";
  return c.type === "fixed" ? `${formatCurrency(Number(c.discount ?? 0))} off` : `${Number(c.discount)}% off`;
}

export function couponCondition(c: CouponResult, formatCurrency: (n: number) => string) {
  return c.min_order_amount ? `On orders over ${formatCurrency(Number(c.min_order_amount))}` : "No minimum order";
}

/** Width of a product card inside a rail (phones / desktop). */
export const RAIL_ITEM = "w-[150px] shrink-0 snap-start md:w-[190px]";
