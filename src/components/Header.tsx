import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, Sun, Moon, Phone, User, ChevronDown, Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "Offers", to: "/deals", badge: true },
  { label: "Privacy Policy", to: "/privacy" },
];

const categories = [
  "Electronics", "Fashion & Apparel", "Health & Medicine", "Grocery & Food",
  "Home & Kitchen", "Beauty & Personal Care", "Sports & Outdoors", "Books & Stationery",
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Info Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-9 text-xs">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span>We are available 24/7, Need help?</span>
            <a href="tel:+1234567890" className="font-bold hover:underline">+1 234-567-890</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/about" className="hover:underline">About Us</Link>
            <span>|</span>
            <Link to="/contact" className="hover:underline">Contact Us</Link>
            <span>|</span>
            <Link to="/account" className="hover:underline">My Account</Link>
            <span>|</span>
            <button onClick={toggleTheme} className="flex items-center gap-1 hover:underline">
              {theme === "light" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-background border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-xl text-foreground leading-none">StoreFront</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Online Shopping</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <input
                type="text"
                placeholder="Search for products (e.g. shirt, medicine, electronics)"
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex relative">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              <div className="text-left hidden sm:block">
                <p className="text-[10px] leading-none opacity-80">{totalItems} Items</p>
                <p className="text-sm font-bold leading-none mt-0.5">${totalPrice.toFixed(2)}</p>
              </div>
              {totalItems > 0 && (
                <span className="sm:hidden w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="hidden lg:block bg-background border-b border-border">
        <div className="container flex items-center h-11 gap-0">
          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
              className="flex items-center gap-2 h-11 px-4 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Menu className="h-4 w-4" />
              Categories
              <ChevronDown className="h-3 w-3" />
            </button>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                  className="absolute top-full left-0 w-64 bg-popover border border-border rounded-b-lg shadow-lg z-50 py-1"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to="/shop"
                      className="block px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted hover:text-primary transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 h-11 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
                {link.badge && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            <button onClick={toggleTheme} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border overflow-hidden bg-background"
          >
            <div className="container py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-b border-border overflow-hidden bg-background"
          >
            <nav className="container py-3 flex flex-col gap-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded-md transition-colors"
                >
                  {cat}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-primary rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              <button
                onClick={toggleTheme}
                className="px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-2"
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
