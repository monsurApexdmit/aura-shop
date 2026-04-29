import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import BackToTop from "@/components/BackToTop";
import LiveChat from "@/components/LiveChat";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import ContentPage, {
  defaultFaqPageContent,
  defaultPrivacyPolicyPageContent,
  defaultReturnsRefundsPageContent,
  defaultShippingPolicyPageContent,
} from "./pages/ContentPage";
import Contact from "./pages/Contact";
import Deals from "./pages/Deals";
import TrackOrder from "./pages/TrackOrder";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import AccountOrders from "./pages/AccountOrders";
import OrderDetail from "./pages/OrderDetail";
import AccountProfile from "./pages/AccountProfile";
import AccountAddresses from "./pages/AccountAddresses";
import Support from "./pages/Support";
import GuestSupport from "./pages/GuestSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.18, ease: "easeIn"  } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<ContentPage slug="faq" fallbackContent={defaultFaqPageContent} />} />
          <Route path="/returns" element={<ContentPage slug="returns" fallbackContent={defaultReturnsRefundsPageContent} />} />
          <Route path="/shipping" element={<ContentPage slug="shipping" fallbackContent={defaultShippingPolicyPageContent} />} />
          <Route path="/privacy" element={<ContentPage slug="privacy" fallbackContent={defaultPrivacyPolicyPageContent} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="/account/orders" element={<RequireAuth><AccountOrders /></RequireAuth>} />
          <Route path="/account/orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="/account/profile" element={<RequireAuth><AccountProfile /></RequireAuth>} />
          <Route path="/account/addresses" element={<RequireAuth><AccountAddresses /></RequireAuth>} />
          <Route path="/support" element={<Support />} />
          <Route path="/support/guest/:ticketNumber" element={<GuestSupport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Header />
                <CartDrawer />
                <BackToTop />
                <LiveChat />
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
