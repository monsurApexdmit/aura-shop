import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDeals, useProducts } from "@/hooks/useProducts";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { mapApiProduct } from "@/lib/mappers";
import { getImageUrl } from "@/lib/api";
import storefrontSettingsApi from "@/services/storefrontSettingsApi";
import { couponApi } from "@/services/couponApi";
import type { DealFilter } from "@/services/productApi";
import type { HomepageProductSource } from "@/services/storefrontSettingsApi";

export interface HeroSlide {
  tag: string;
  /** May contain *word* for the template's accent styling (see AccentText) */
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string | null;
}

/** Enabled hero slides from admin (Online store > Homepage hero); [] until the owner adds one. */
export function useHeroSlides() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["homepage-hero"],
    queryFn: storefrontSettingsApi.getHomepageHero,
    staleTime: 1000 * 60 * 10,
  });
  const slides = useMemo<HeroSlide[]>(
    () =>
      (data?.slides ?? [])
        .filter((s) => s.enabled && s.title.trim())
        .map((s) => ({
          tag: s.tag,
          title: s.title,
          subtitle: s.subtitle,
          cta: s.cta || t("common:actions.shopNow"),
          link: s.link || "/shop",
          image: s.imagePath ? getImageUrl(s.imagePath) : null,
        })),
    [data, t],
  );
  return { slides, autoplayMs: data?.autoplayMs ?? 6000, isLoading };
}

/** Products from a source: "latest" (optionally one category) or a deals list. Mapped to the storefront Product. */
export function useProductList(source: HomepageProductSource | DealFilter = "latest", { limit = 8, categoryId, enabled = true }: { limit?: number; categoryId?: number | null; enabled?: boolean } = {}) {
  const isLatest = source === "latest";
  const latest = useProducts({ limit, category_id: categoryId ?? undefined }, { enabled: enabled && isLatest });
  const deals = useDeals(isLatest ? "all" : (source as DealFilter), limit, { enabled: enabled && !isLatest });
  const { data, isLoading } = isLatest ? latest : deals;
  const products = useMemo(() => (data?.data ?? []).map(mapApiProduct), [data]);
  return { products, isLoading: enabled && isLoading };
}

/** The homepage product block as configured in admin (Homepage sections > Products), with its products. */
export function useHomeProducts() {
  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const custom = sections?.products;
  const list = useProductList(custom?.source ?? "latest", {
    limit: custom?.limit ?? 8,
    categoryId: custom?.categoryId,
    enabled: !sectionsLoading,
  });
  return {
    enabled: !custom || custom.enabled,
    title: custom?.title || "",
    subtitle: custom?.subtitle || "",
    source: custom?.source ?? "latest",
    ...list,
    isLoading: sectionsLoading || list.isLoading,
  };
}

/** Active online coupons (admin: Coupons, channel Online), highest priority first. */
export function useActiveCoupons() {
  const { data = [] } = useQuery({ queryKey: ["coupons-active"], queryFn: couponApi.getActive, staleTime: 1000 * 60 * 10 });
  return data;
}

/** Promo banner text (admin: Online store > Promo banner), or null when off. */
export function usePromoBanner() {
  const { data } = useQuery({ queryKey: ["promo-banner"], queryFn: storefrontSettingsApi.getPromoBanner, staleTime: 1000 * 60 * 10 });
  return data?.enabled && data.title ? data : null;
}

/** Listing a homepage source leads to. */
export const SOURCE_LINK: Record<string, string> = {
  latest: "/shop",
  featured: "/deals",
  best_seller: "/deals",
  hot_deal: "/deals",
  on_sale: "/deals",
};
