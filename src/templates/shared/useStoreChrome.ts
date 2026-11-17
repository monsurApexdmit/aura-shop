import { Facebook, Instagram, MessageCircle, Youtube, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCategories } from "@/hooks/useCategories";
import { useCollections } from "@/hooks/useCollections";
import { useHomepageSections, useShopNavLinks } from "@/hooks/useHomepageSections";
import { useStorefrontPages, pageLinkHref } from "@/hooks/useStorefrontPages";

export interface NavLink {
  label: string;
  to: string;
}

/**
 * Store identity, navigation and shopper state for every template's header, footer and phone nav.
 * Links come from admin (homepage aisles, categories, collections, published pages).
 */
export function useStoreChrome() {
  const { t } = useTranslation();
  const currency = useCurrency();
  const { storeName, bannerUrl, logoUrl, onlineStore, paymentMethods, storePhone, storeEmail, storeAddress } = currency;
  const cart = useCart();
  const { totalWishlistItems } = useWishlist();
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();
  const { data: sections } = useHomepageSections();
  const { data: pages = [] } = useStorefrontPages();
  const shopNav = useShopNavLinks();

  const toLink = (p: (typeof pages)[number]): NavLink => ({ label: p.title, to: pageLinkHref(p.slug) });
  const headerPages = pages.filter((p) => p.place === "header").map(toLink);
  const footerPages = pages.filter((p) => p.place === "footer");

  const rawSocial = onlineStore?.social;
  const waRaw = rawSocial?.whatsapp?.trim() ?? "";
  const waHref = waRaw && (/^https?:\/\//i.test(waRaw) ? waRaw : `https://wa.me/${waRaw.replace(/[^0-9]/g, "")}`);
  const socials = [
    { label: "Facebook", href: rawSocial?.facebook, Icon: Facebook },
    { label: "Instagram", href: rawSocial?.instagram, Icon: Instagram },
    { label: "YouTube", href: rawSocial?.youtube, Icon: Youtube },
    { label: "WhatsApp", href: waHref, Icon: MessageCircle },
  ].filter((x): x is { label: string; href: string; Icon: LucideIcon } => !!x.href && /^https?:\/\//i.test(x.href));

  const cartSubtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    storeName,
    /** Wide logo (admin banner) if uploaded, else square logo, else null: show the name */
    logo: bannerUrl ?? logoUrl ?? null,
    /** Admin: Homepage sections > Footer text */
    tagline: sections?.footer?.tagline ?? "",
    contact: { phone: storePhone, email: storeEmail, address: storeAddress },
    paymentMethods,
    socials,
    /** Department / aisle links (admin homepage aisles, else categories) */
    shopNav,
    /** Shop links for menus: aisles, all products, collections (only when published), deals */
    shopLinks: [
      ...shopNav,
      { label: t("shop:links.shopAll"), to: "/shop" },
      ...(collections.length > 0 ? [{ label: t("common:nav.collections"), to: "/collections" }] : []),
      { label: t("common:nav.deals"), to: "/deals" },
    ] as NavLink[],
    /** Pages published to the header menu, plus Contact */
    utilityLinks: [...headerPages, { label: t("common:nav.contact"), to: "/contact" }] as NavLink[],
    helpLinks: [
      ...footerPages.filter((p) => p.type === "policy" || p.type === "faq").map(toLink),
      { label: t("common:nav.contact"), to: "/contact" },
      { label: t("common:nav.trackOrder"), to: "/track-order" },
    ] as NavLink[],
    companyLinks: [
      ...footerPages.filter((p) => p.type !== "policy" && p.type !== "faq").map(toLink),
      { label: t("common:nav.myAccount"), to: "/account" },
    ] as NavLink[],
    categories,
    collections,
    cart: {
      count: cart.totalItems,
      subtotal: cartSubtotal,
      formatted: currency.formatCurrency(cartSubtotal),
      open: () => cart.setIsOpen(true),
    },
    wishlistCount: totalWishlistItems,
    auth: { isLoggedIn: auth.isLoggedIn, user: auth.user, logout: auth.logout },
    darkMode: { isDark: theme === "dark", toggle: toggleTheme },
    formatCurrency: currency.formatCurrency,
    freeShippingThreshold: currency.freeShippingThreshold,
    year: new Date().getFullYear(),
  };
}
