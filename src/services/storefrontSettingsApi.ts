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

export const storefrontSettingsApi = {
  getHomepageHero: async (): Promise<AuraShopHeroSettings> => {
    const response = await api.get("/settings/homepage-hero");
    return response.data.data;
  },
};

export default storefrontSettingsApi;
