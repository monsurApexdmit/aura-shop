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

export const storefrontSettingsApi = {
  getHomepageHero: async (): Promise<AuraShopHeroSettings> => {
    const response = await api.get("/settings/homepage-hero");
    return response.data.data;
  },
  getPromoBanner: async (): Promise<PromoBannerSettings> => {
    const response = await api.get("/settings/promo-banner");
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
