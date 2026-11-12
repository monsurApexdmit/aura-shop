import { Bath, BedDouble, CalendarDays, Car, Compass, Layers, Ruler, Sofa, Tag, type LucideIcon } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import type { ApiCategory } from "@/services/categoryApi";
import type { Product, ProductAttribute } from "@/types/product";

/** Keyboard focus ring that reads on white cards, the grey page and navy bands. */
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Focus ring for controls sitting on navy (top bar, hero, footer, CTA band). */
export const FOCUS_ON_INK = "outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

/** Teal solid button. */
export const BTN_PRIMARY = "inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

/** Photo grounds for tiles without a photo (full class names so Tailwind keeps them). */
export const TILES = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4", "bg-tile-5"] as const;
export const tile = (i: number) => TILES[((i % TILES.length) + TILES.length) % TILES.length];

export const hasPhoto = (src: string | null | undefined): src is string => !!src && !src.includes("placeholder");

export const categoryLink = (cat: Pick<ApiCategory, "slug">) => `/shop?cat=${cat.slug}`;
export const categoryImage = (cat: Pick<ApiCategory, "image">) => (cat.image ? getImageUrl(cat.image) : null);

/** "Featured" badges get the gold pill; anything else ("For sale", "For rent", deal labels) the light one. */
export const isFeaturedBadge = (badge: string | null | undefined) => !!badge && /featured/i.test(badge);

export interface Spec {
  key: string;
  label: string;
  value: string;
  Icon: LucideIcon;
  /** Short text for the card's spec row, e.g. "4 Beds" or "310 m²" */
  short: string;
}

/** Icon guessed from the attribute name: beds, baths, area, parking, floors, year, furnishing, facing. */
export function specIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/bed|room/.test(n)) return BedDouble;
  if (/bath|toilet|wash|wc/.test(n)) return Bath;
  if (/area|size|sq|sft|m2|m²|acre|katha|plot|land/.test(n)) return Ruler;
  if (/park|garage|car/.test(n)) return Car;
  if (/floor|storey|story|level/.test(n)) return Layers;
  if (/year|built|age|handover/.test(n)) return CalendarDays;
  if (/furnish/.test(n)) return Sofa;
  if (/fac|direction|view/.test(n)) return Compass;
  return Tag;
}

const isCount = (name: string) => /bed|room|bath|toilet|wash|park|garage|car|floor|storey|level/i.test(name);

/** Listing specs from the product's attributes, else from its variant options. */
export function listingSpecs(product: Pick<Product, "attributes" | "variants">): Spec[] {
  let attrs: ProductAttribute[] = product.attributes ?? [];
  if (attrs.length === 0 && product.variants?.length) {
    const map = new Map<string, Set<string>>();
    for (const v of product.variants) {
      for (const [k, val] of Object.entries(v.attributes)) {
        if (!map.has(k)) map.set(k, new Set());
        if (val) map.get(k)!.add(String(val));
      }
    }
    attrs = Array.from(map, ([name, vals]) => ({ name, displayName: name.charAt(0).toUpperCase() + name.slice(1), values: Array.from(vals) }));
  }
  return attrs
    .filter((a) => a.values.length > 0 && !/^colou?r$/i.test(a.name.trim()))
    .map((a) => {
      const label = a.displayName || a.name;
      const value = a.values.slice(0, 2).join(" / ");
      const short = isCount(a.name) && /^\d+(\.\d+)?\+?$/.test(value.trim()) ? `${value} ${label}` : value;
      return { key: a.name, label, value, Icon: specIcon(a.name), short };
    });
}

/** Where the listing is, when the store records it (subcategory); else null. */
export const listingLocation = (product: Pick<Product, "subcategory">) => product.subcategory?.trim() || null;
