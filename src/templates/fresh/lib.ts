import {
  Apple, Baby, Beef, Carrot, Coffee, Cookie, Croissant, CupSoda, Fish, Milk, PawPrint, Salad, ShoppingBasket, Snowflake,
  Sparkles, SprayCan, Wheat, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { TFunction } from "i18next";
import i18n from "@/i18n";
import { getImageUrl } from "@/lib/api";
import type { ApiCategory } from "@/services/categoryApi";

/** Keyboard focus ring that reads on white, dark and green surfaces. */
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
/** Focus ring for controls on green / ink / photo surfaces. */
export const FOCUS_ON_DARK = "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0";

/** Pastel grounds, cycled by index (always light: use `text-ink` / dark text on them). */
const TILES = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4", "bg-tile-5"] as const;
export const tile = (i: number) => TILES[((i % TILES.length) + TILES.length) % TILES.length];

export const categoryLink = (cat: Pick<ApiCategory, "slug">) => `/shop?cat=${cat.slug}`;
export const categoryImage = (cat: Pick<ApiCategory, "image">) => (cat.image ? getImageUrl(cat.image) : null);

const ICON_RULES: [RegExp, LucideIcon][] = [
  [/fruit|produce|apple/i, Apple],
  [/veg|green|salad/i, Carrot],
  [/bak|bread|cake|pastr/i, Croissant],
  [/coffee|tea/i, Coffee],
  [/bever|drink|juice|water|soda/i, CupSoda],
  [/dairy|milk|egg|chees|yog/i, Milk],
  [/fish|sea/i, Fish],
  [/meat|chicken|beef|butcher|poultry/i, Beef],
  [/frozen|ice/i, Snowflake],
  [/snack|sweet|chocol|candy|biscuit|cookie/i, Cookie],
  [/pantry|rice|grain|flour|staple|oil|spice|pasta/i, Wheat],
  [/house|clean|laundry|home/i, SprayCan],
  [/pet|dog|cat/i, PawPrint],
  [/baby|kid/i, Baby],
  [/beauty|care|health|personal/i, Sparkles],
  [/organic|deli|ready|meal/i, Salad],
];

/** A small icon for a category or aisle name; a basket when nothing matches. */
export function categoryIcon(name: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(name))?.[1] ?? ShoppingBasket;
}

/** "Ends Sunday" / "Ends tonight": weekly deals run Monday to Sunday. */
export function weekEndLabel(t: TFunction, now = new Date()): string {
  return now.getDay() === 0 ? t("tpl_fresh:lib.endsTonight") : t("tpl_fresh:lib.endsSunday");
}

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
  toast.success(i18n.t("tpl_fresh:lib.codeCopied", { code }), { description: i18n.t("tpl_fresh:lib.pasteAtCheckout") });
}

/** Light green that reads on the dark green ink footer in both modes. */
export const ON_INK_ACCENT = "text-[hsl(142_60%_62%)]";
