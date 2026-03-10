import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, Sun, Moon, Phone, User, ChevronDown, ChevronRight, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { categories } from "@/data/categories";
import { AnimatePresence, motion } from "framer-motion";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Offers", to: "/deals", badge: true },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const { totalWishlistItems } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
        setActiveCat(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="gradient-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-9 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              <span className="hidden sm:inline">Need help? Call us:</span>
              <a href="tel:+1234567890" className="font-semibold hover:underline">+1 234-567-890</a>
            </div>
            <Link to="/track-order" className="hidden md:flex items-center gap-1.5 hover:underline">
              <MapPin className="h-3 w-3" />
              <span>Track your order</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hover:underline hidden sm:inline">About</Link>
            <Link to="/contact" className="hover:underline hidden sm:inline">Contact</Link>
            <button onClick={toggleTheme} className="flex items-center gap-1 hover:underline">
              {theme === "light" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              <span className="hidden sm:inline">{theme === "light" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-display font-bold text-xl">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-xl text-foreground leading-none tracking-tight">StoreFront</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 tracking-wide">MARKETPLACE</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6 relative z-[60]">
            <SearchAutocomplete />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl relative">
                <Heart className="h-5 w-5" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] opacity-80 leading-none">{totalItems} Items</p>
                <p className="text-sm font-bold leading-none mt-0.5">${totalPrice.toFixed(2)}</p>
              </div>
            </button>

            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
      <div className="hidden lg:block bg-background border-b border-border relative z-40">
        <div className="container flex items-center h-12">
          {/* Categories Mega Menu */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => { setCatOpen(!catOpen); setActiveCat(null); }}
              className="flex items-center gap-2 h-12 px-5 gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity rounded-t-lg"
            >
              <Menu className="h-4 w-4" />
              All Categories
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${catOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 flex bg-popover border border-border rounded-b-xl rounded-r-xl shadow-xl z-50 overflow-hidden"
                >
                  {/* Parent Categories */}
                  <div className="w-64 border-r border-border py-2 max-h-[420px] overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onMouseEnter={() => setActiveCat(cat.slug)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          activeCat === cat.slug
                            ? "bg-primary/5 text-primary font-medium"
                            : "text-popover-foreground hover:bg-muted"
                        }`}
                      >
                        <cat.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{cat.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                      </button>
                    ))}
                  </div>

                  {/* Child Categories */}
                  <AnimatePresence mode="wait">
                    {activeCat && (
                      <motion.div
                        key={activeCat}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="w-56 py-2"
                      >
                        {categories
                          .find((c) => c.slug === activeCat)
                          ?.children.map((child) => (
                            <Link
                              key={child.slug}
                              to={`/shop?cat=${activeCat}&sub=${child.slug}`}
                              onClick={() => { setCatOpen(false); setActiveCat(null); }}
                              className="block px-5 py-2.5 text-sm text-popover-foreground hover:bg-muted hover:text-primary transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center ml-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 h-12 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
                {link.badge && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-md gradient-accent text-[9px] font-bold text-accent-foreground">
                    HOT
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto text-sm text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
            Free shipping on orders $50+
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border overflow-hidden bg-background"
          >
            <div className="container py-3">
              <SearchAutocomplete mobile onClose={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav with Parent-Child Categories */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-b border-border overflow-hidden bg-background max-h-[70vh] overflow-y-auto"
          >
            <nav className="container py-3 space-y-0.5">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
              {categories.map((cat) => (
                <div key={cat.slug}>
                  <button
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.slug ? null : cat.slug)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <cat.icon className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-left">{cat.name}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${mobileExpandedCat === cat.slug ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {mobileExpandedCat === cat.slug && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-10 pr-3 pb-1 space-y-0.5">
                          {cat.children.map((child) => (
                            <Link
                              key={child.slug}
                              to={`/shop?cat=${cat.slug}&sub=${child.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="border-t border-border my-2" />
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}