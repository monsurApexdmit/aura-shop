import type { StoreTemplate } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";
import MobileNav from "./MobileNav";
import { hidesTabBar } from "@/lib/mobileNav";

const isProduct = (p: string) => /^\/product\/[^/]+\/?$/.test(p);

/** Property Listings: real-estate style. Navy bars, photo hero with search, listing cards with specs, teal actions, gold accents. */
const luxe: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav,
  mobileNavPadding: (p) => (hidesTabBar(p) ? "" : "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"),
  // Above the tab bar, and above the listing page's enquiry bar; low where neither shows (checkout)
  fabBottom: (p) => (hidesTabBar(p) && !isProduct(p) ? "1.5rem" : "5rem"),
};

export default luxe;
