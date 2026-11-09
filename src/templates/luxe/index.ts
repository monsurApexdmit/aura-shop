import type { StoreTemplate } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";

/** Luxe Lookbook: image-led fashion house. Full-screen photography, Didone serif, hairlines, no phone tab bar. */
const luxe: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav: null,
  mobileNavPadding: () => "",
  // No tab bar: sit low, except above the product page's add-to-bag bar
  fabBottom: (pathname) => (/^\/product\//.test(pathname) ? "5.5rem" : "1.5rem"),
};

export default luxe;
