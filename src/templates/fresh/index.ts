import type { StoreTemplate } from "../types";
import { hidesTabBar } from "@/lib/mobileNav";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";
import MobileNav from "./MobileNav";

/**
 * Daily Fresh: grocery / quick-commerce. Category chips and rails for fast repeat buying,
 * an inline [− qty +] on every card, and an always-visible cart total (header pill, phone cart bar).
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
