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
  /** "Shop by collection" block; absent/null until the backend serves it, then the storefront default is used. */
  collections?: { enabled: boolean; title: string; subtitle: string } | null;
}

// Template content (admin: Online store > Template content). Each block is null until saved once;
// the template then shows its own default. Which template uses which block: src/templates/shared/useTemplateContent.ts
export interface TemplatePromoTile {
  id: string;
  tag: string;
  title: string;
  text: string;
  cta: string;
  link: string;
  imagePath: string | null;
}

export interface TemplateContent {
  /** Thin bar above the header, e.g. "Welcome offer: 15% off your first order" + code HELLO15 */
  announcement: { enabled: boolean; text: string; code: string; link: string } | null;
  /** Short note in the header, e.g. "Delivery in 30–60 min" */
  headerNote: { enabled: boolean; label: string; text: string } | null;
  promoTiles: { enabled: boolean; items: TemplatePromoTile[] } | null;
  stats: { enabled: boolean; items: { value: string; label: string }[] } | null;
  testimonials: { enabled: boolean; title: string; items: { name: string; text: string; rating: number; note: string }[] } | null;
  newsletter: { enabled: boolean; title: string; text: string } | null;
  /** Wide call-to-action band, e.g. "Thinking of selling?" with two buttons */
  cta: { enabled: boolean; tag: string; title: string; text: string; cta: string; link: string; cta2: string; link2: string; imagePath: string | null } | null;
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
  /** Older backends have no such route: every block is then null (template defaults). */
  getTemplateContent: async (): Promise<Partial<TemplateContent>> => {
    try {
      const response = await api.get("/settings/template-content");
      return response.data.data ?? {};
    } catch {
      return {};
    }
  },
};

export default storefrontSettingsApi;

export interface OnlineStoreSettings {
  name: string;
  slug: string;
  /** Accent colour hex, or "" for the theme's own accent */
  theme: string;
  /** Store theme id (src/themes); absent on older backends = default theme */
  themePreset?: string;
  /** "theme" = the theme's colours; "brand" (default) = Company settings brand colours */
  colorSource?: "theme" | "brand";
  /** Owner's default storefront language ("en" | "bn"); shoppers can switch. Absent on older backends = English */
  language?: string;
  published: boolean;
  policies: { returns: string; shipping: string; privacy: string };
  social: { facebook: string; instagram: string; whatsapp: string; youtube: string; twitter: string };
  /** Optional ad pixels + order-on-WhatsApp number (admin: Online store); absent on older backends. */
  facebookPixelId?: string | null;
  tiktokPixelId?: string | null;
  whatsappNumber?: string | null;
}

export const getOnlineStore = async (): Promise<OnlineStoreSettings> => {
  const response = await api.get("/settings/online-store");
  return response.data.data;
};
