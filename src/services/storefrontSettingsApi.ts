import { api } from "@/lib/api";

export interface AuraShopHeroSlide {
  imagePath?: string | null;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  gradient: string;
  enabled: boolean;
}

export interface AuraShopHeroSettings {
  autoplayMs: number;
  slides: AuraShopHeroSlide[];
}

export interface PromoBannerSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

// Homepage blocks below the hero (admin: Online store > Homepage sections).
// A null section has never been customised; the storefront builds it automatically.
export interface HomepageAisle {
  id: string;
  label: string;
  tagline: string;
  emoji: string;
  imagePath: string | null;
  link: string;
}

export type HomepageProductSource = "latest" | "featured" | "best_seller" | "hot_deal" | "on_sale";

export type HomepagePerkIcon = "truck" | "rotate" | "shield" | "heart" | "gift" | "star" | "sparkles" | "package" | "clock" | "phone";

export interface HomepageSections {
  aisles: { enabled: boolean; title: string; subtitle: string; items: HomepageAisle[] } | null;
  products: { enabled: boolean; title: string; subtitle: string; source: HomepageProductSource; categoryId: number | null; limit: number } | null;
  lookbook: { enabled: boolean; tag: string; title: string; text: string; cta: string; link: string; images: string[] } | null;
  perks: { enabled: boolean; items: { icon: HomepagePerkIcon; title: string; text: string; link: string | null }[] } | null;
  footer: { tagline: string } | null;
}

export const storefrontSettingsApi = {
  getHomepageHero: async (): Promise<AuraShopHeroSettings> => {
    const response = await api.get("/settings/homepage-hero");
    return response.data.data;
  },
  getPromoBanner: async (): Promise<PromoBannerSettings> => {
    const response = await api.get("/settings/promo-banner");
    return response.data.data;
  },
  getHomepageSections: async (): Promise<HomepageSections> => {
    const response = await api.get("/settings/homepage-sections");
    return response.data.data;
  },
};

export default storefrontSettingsApi;

export interface OnlineStoreSettings {
  name: string;
  slug: string;
  theme: string;
  published: boolean;
  policies: { returns: string; shipping: string; privacy: string };
  social: { facebook: string; instagram: string; whatsapp: string; youtube: string; twitter: string };
}

export const getOnlineStore = async (): Promise<OnlineStoreSettings> => {
  const response = await api.get("/settings/online-store");
  return response.data.data;
};
