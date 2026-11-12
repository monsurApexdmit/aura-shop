import type { TFunction } from "i18next";
import type { PromoTile } from "../shared/useTemplateContent";

/** Built-in tiles: copy lives under tpl_fresh:tiles.<key> and is translated at render. */
const TILES = [
  { id: "fresh-1", key: "produce", link: "/shop" },
  { id: "fresh-2", key: "deals", link: "/deals" },
  { id: "fresh-3", key: "dairy", link: "/shop" },
  { id: "fresh-4", key: "pantry", link: "/shop" },
  { id: "fresh-5", key: "snacks", link: "/categories" },
] as const;

/**
 * Defaults until the owner saves Template content > Promo tiles.
 * 0–1 sit beside the hero; 2–4 are the banners mid-page.
 * Build inside a component (useMemo on `t`) so the fallback stays stable per language.
 */
export function defaultTiles(t: TFunction): PromoTile[] {
  return TILES.map(({ id, key, link }) => ({
    id,
    tag: t(`tpl_fresh:tiles.${key}.tag`),
    title: t(`tpl_fresh:tiles.${key}.title`),
    text: t(`tpl_fresh:tiles.${key}.text`),
    cta: t(`tpl_fresh:tiles.${key}.cta`),
    link,
    image: null,
  }));
}
