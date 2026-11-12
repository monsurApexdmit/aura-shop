import type { StoreTemplate } from "../types";
import { hidesTabBar } from "@/lib/mobileNav";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";
import MobileNav from "./MobileNav";

/**
 * Fresh Mart: a full supermarket storefront. Green announcement bar, search with a category scope,
 * "All categories" menu, photo hero with side tiles, category circles, a peach weekly-deals panel,
 * product rows per category, promo banners, perks and a green newsletter panel. Cards have an
 * outlined "+ Add" that turns into a [− qty +] stepper; phones get a bottom nav and a cart pill.
 */
const fresh: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav,
  // Phones: bottom nav (4rem) + floating cart pill (3.5rem + 0.5rem gap) + breathing room + home indicator.
  mobileNavPadding: (pathname) => (hidesTabBar(pathname) ? "" : "pb-[calc(9rem+env(safe-area-inset-bottom))] md:pb-0"),
  // Clear the bottom nav plus the cart pill above it
  fabBottom: (pathname) => (hidesTabBar(pathname) ? "6.25rem" : "9.75rem"),
};

export default fresh;
