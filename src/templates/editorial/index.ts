import type { StoreTemplate } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";
import MobileNav from "./MobileNav";
import { hidesTabBar } from "@/lib/mobileNav";

/** The original Aura look: magazine serif, pastel photo tiles, floating phone tab bar. */
const editorial: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav,
  mobileNavPadding: (pathname) => (hidesTabBar(pathname) ? "" : "pb-tabbar md:pb-0"),
};

export default editorial;
