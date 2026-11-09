import type { ComponentType } from "react";
import type { Product } from "@/types/product";

export interface ProductCardProps {
  product: Product;
  /** Position in its grid; templates may use it for staggered motion or tile colours */
  index?: number;
}

/**
 * A store template: its own layouts for what shoppers see first. Shop, cart, checkout and
 * account pages are shared and pick up the template's tokens (src/themes).
 */
export interface StoreTemplate {
  /** Sticky site header (rendered once, above every page) */
  Header: ComponentType;
  /** Page footer (each page renders it at its end) */
  Footer: ComponentType;
  ProductCard: ComponentType<ProductCardProps>;
  /** The "/" page */
  Home: ComponentType;
  /** The "/product/:slug" page; reads the slug from the route */
  ProductPage: ComponentType;
  /** Phone bottom navigation, or null for none */
  MobileNav: ComponentType | null;
  /**
   * Bottom padding for pages on phones so the bottom nav never covers content,
   * e.g. "pb-tabbar md:pb-0". Called with the current path (some screens hide the nav).
   */
  mobileNavPadding: (pathname: string) => string;
  /**
   * Phone distance from the screen bottom for floating buttons (live chat) so they clear the
   * template's bottom bars, e.g. "9.5rem". Defaults to just above a 4rem tab bar.
   */
  fabBottom?: (pathname: string) => string;
}
