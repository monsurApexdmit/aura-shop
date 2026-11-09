import type { StoreTemplate } from "../types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Home from "./Home";
import ProductPage from "./ProductPage";

/** Single Product: the store as one high-converting landing page that leads to the order form. */
const single: StoreTemplate = {
  Header,
  Footer,
  ProductCard,
  Home,
  ProductPage,
  MobileNav: null,
  mobileNavPadding: () => "",
  // The landing pages have a sticky order bar; elsewhere nothing at the bottom
  fabBottom: (pathname) => (pathname === "/" || /^\/product\//.test(pathname) ? "6.25rem" : "1.5rem"),
};

export default single;
