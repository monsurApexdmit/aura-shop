import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/api";
import storefrontSettingsApi, { type TemplateContent } from "@/services/storefrontSettingsApi";

/**
 * Template content blocks (admin: Online store > Template content). One shared set; each template
 * shows the blocks it has a place for. Keep in sync with ecommerce-admin lib/storeThemes.ts TEMPLATE_BLOCKS.
 *
 *   market (Tech Store)        announcement, promoTiles (3 banners), stats, testimonials, newsletter
 *   single (Kids & Baby)       announcement, promoTiles (4 tiles), testimonials, newsletter
 *   fresh  (Fresh Mart)        announcement, headerNote, promoTiles (2 beside the hero + 3 mid-page), newsletter
 *   luxe   (Property Listings) stats, cta
 *
 * Homepage sections (useHomeContent / useStoreChrome) still apply to every template: hero slides,
 * products block, perks, aisles (nav links) and footer tagline.
 */
export type BlockKey = keyof TemplateContent;
type Block<K extends BlockKey> = Omit<NonNullable<TemplateContent[K]>, "enabled">;

export interface PromoTile {
  id: string;
  tag: string;
  title: string;
  text: string;
  cta: string;
  link: string;
  /** Full URL, or null: the template draws a designed tile */
  image: string | null;
}

function useRaw() {
  return useQuery({
    queryKey: ["template-content"],
    queryFn: storefrontSettingsApi.getTemplateContent,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * One block: the owner's saved content; the template's `fallback` while never saved; null when the
 * owner turned it off (render nothing). Pass a stable fallback (module constant). Testimonials must pass
 * null: a store only shows reviews its owner added, never sample quotes.
 */
export function useTemplateBlock<K extends Exclude<BlockKey, "promoTiles" | "cta">>(key: K, fallback: Block<K> | null): { block: Block<K> | null; isLoading: boolean } {
  const { data, isLoading } = useRaw();
  const block = useMemo(() => {
    const saved = data?.[key] as TemplateContent[K] | undefined;
    if (saved == null) return fallback;
    if (!saved.enabled) return null;
    const { enabled: _enabled, ...rest } = saved;
    return rest as Block<K>;
  }, [data, key, fallback]);
  return { block, isLoading };
}

/** Promo tiles with image URLs resolved; `fallback` while never saved, [] when turned off. */
export function usePromoTiles(fallback: PromoTile[]): { tiles: PromoTile[]; isLoading: boolean } {
  const { data, isLoading } = useRaw();
  const tiles = useMemo(() => {
    const saved = data?.promoTiles;
    if (saved == null) return fallback;
    if (!saved.enabled) return [];
    return saved.items.map((t) => ({ ...t, link: t.link || "/shop", image: t.imagePath ? getImageUrl(t.imagePath) : null }));
  }, [data, fallback]);
  return { tiles, isLoading };
}

export type CtaBlock = Omit<Block<"cta">, "imagePath"> & { image: string | null };

/** Call-to-action band with its image URL resolved; `fallback` while never saved, null when turned off. */
export function useCtaBlock(fallback: CtaBlock): { cta: CtaBlock | null; isLoading: boolean } {
  const { data, isLoading } = useRaw();
  const cta = useMemo(() => {
    const saved = data?.cta;
    if (saved == null) return fallback;
    if (!saved.enabled) return null;
    const { enabled: _enabled, imagePath, ...rest } = saved;
    return { ...rest, image: imagePath ? getImageUrl(imagePath) : null };
  }, [data, fallback]);
  return { cta, isLoading };
}
