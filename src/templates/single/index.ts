import type { StoreTemplate } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";
import MobileNav from "./MobileNav";
import { hidesTabBar } from "@/lib/mobileNav";

/** Kids & Baby: playful toy and baby store. Cream page, purple bars, coral-pink accents, pastel tiles, scalloped hero. */
const single: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav,
  mobileNavPadding: (p) => (hidesTabBar(p) ? "" : "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"),
};

export default single;
