import type { StoreTemplate } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";
import MobileNav from "./MobileNav";
import { hidesTabBar } from "@/lib/mobileNav";

/**
 * Tech Store: electronics and gadgets. Blue announcement bar, search-first header with a department row,
 * tinted hero slider, tabbed featured products, promo banners, best sellers beside new arrivals.
 */
const market: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav,
  mobileNavPadding: (p) => (hidesTabBar(p) ? "" : "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"),
  // Clear the 4rem tab bar, or the product page's 4rem action bar
  fabBottom: (p) => (hidesTabBar(p) ? "5.5rem" : "5.25rem"),
};

export default market;
