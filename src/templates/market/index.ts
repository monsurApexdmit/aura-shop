import type { StoreTemplate } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";
import MobileNav from "./MobileNav";
import { hidesTabBar } from "@/lib/mobileNav";

/** Mega Market: dense multi-category marketplace. Grey page, white cards, navy bars, raspberry prices. */
const market: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav,
  mobileNavPadding: (p) => (hidesTabBar(p) ? "" : "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"),
};

export default market;
