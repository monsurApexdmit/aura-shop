import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, Sun, Moon, Phone, User, ChevronDown, ChevronRight, Heart, MapPin, LogOut, Package, Settings, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/UserAvatar";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCategories } from "@/hooks/useCategories";
import { Monitor, Shirt, Pill, ShoppingBasket, Home, Sparkles, Dumbbell, BookOpen, Baby, Coffee, Wrench, Gamepad2, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MotionCard = motion.create(Card);

const ICON_MAP: Record<string, LucideIcon> = {
  "electronics": Monitor, "fashion": Shirt, "fashion-apparel": Shirt,
  "health": Pill, "health-medicine": Pill, "grocery": ShoppingBasket, "grocery-food": ShoppingBasket,
  "home": Home, "home-kitchen": Home, "beauty": Sparkles, "beauty-skincare": Sparkles,
  "sports": Dumbbell, "sports-outdoors": Dumbbell, "books": BookOpen, "books-stationery": BookOpen,
  "baby": Baby, "baby-kids": Baby, "beverages": Coffee, "tools": Wrench, "tools-hardware": Wrench,
  "gaming": Gamepad2,
};
function getCatIcon(slug: string): LucideIcon {
  if (ICON_MAP[slug]) return ICON_MAP[slug];
  const key = Object.keys(ICON_MAP).find((k) => slug.includes(k) || k.includes(slug));
  return key ? ICON_MAP[key] : Tag;
}
import { useStorefrontPages, BUILT_IN_PAGE_SLUGS, pageHref } from "@/hooks/useStorefrontPages";
import { StoreClosureBanner } from "@/components/StoreHours";
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
  const { isLoggedIn, user, logout } = useAuth();
  const { formatCurrency, storePhone, storeName, bannerUrl, freeShippingThreshold } = useCurrency();
  const displayLogo = bannerUrl;
  const { data: categories = [] } = useCategories();
  const { data: pages = [] } = useStorefrontPages();
  const allNavLinks = [
    ...navLinks,
    ...pages.filter((p) => p.place === 'header' && !BUILT_IN_PAGE_SLUGS.includes(p.slug)).map((p) => ({ label: p.title, to: pageHref(p.slug), badge: false })),
  ];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
        setActiveCat(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />
      {/* Top Bar */}
      <div className="gradient-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-9 text-xs">
          <div className="flex items-center gap-4">
            {storePhone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">Need help? Call us:</span>
                <a href={`tel:${storePhone}`} className="font-semibold hover:underline">{storePhone}</a>
              </div>
            )}
            <Link to="/track-order" className="hidden md:flex items-center gap-1.5 hover:underline">
              <MapPin className="h-3 w-3" />
              <span>Track your order</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hover:underline hidden sm:inline">About</Link>
            <Link to="/contact" className="hover:underline hidden sm:inline">Contact</Link>
            <Button variant="link" size="sm" onClick={toggleTheme} className="h-auto p-0 gap-1">
              {theme === "light" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              <span className="hidden sm:inline">{theme === "light" ? "Dark" : "Light"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border relative z-50">
        <div className="container flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {displayLogo ? (
              <img src={displayLogo} alt={storeName} className="h-10 sm:h-14 w-auto max-w-[140px] sm:max-w-[200px] object-contain" />
            ) : (
              <>
                <UserAvatar shape="square" className="size-10" name={storeName} fallback={storeName.charAt(0).toUpperCase()} />
                <div className="hidden sm:block">
                  <span className="font-display font-bold text-xl text-foreground leading-none tracking-tight">{storeName}</span>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5 tracking-wide">MARKETPLACE</p>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6 relative z-[60]">
            <SearchAutocomplete />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex relative">
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {totalWishlistItems > 0 && (
                  <Badge variant="secondary" className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1">
                    {totalWishlistItems}
                  </Badge>
                )}
              </Link>
            </Button>
            {/* User Menu */}
            <div ref={userMenuRef} className="relative block">
              <Button variant="ghost" size="icon" aria-label={isLoggedIn ? "Account menu" : "Login"} onClick={() => isLoggedIn ? setUserMenuOpen(!userMenuOpen) : undefined} asChild={!isLoggedIn}>
                {isLoggedIn ? (
                  <UserAvatar className="size-9" name={user?.name} fallback={user?.name?.charAt(0).toUpperCase() || "U"} />
                ) : (
                  <Link to="/login"><User className="h-5 w-5" /></Link>
                )}
              </Button>
              <AnimatePresence>
                {userMenuOpen && isLoggedIn && (
                  <MotionCard
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-52 z-50 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-2">
                      <p className="font-semibold text-sm text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Separator />
                    {[
                      { label: "My Account", to: "/account", icon: User },
                      { label: "My Orders", to: "/account/orders", icon: Package },
                      { label: "Settings", to: "/account/profile", icon: Settings },
                    ].map((item) => (
                      <Button key={item.to} asChild variant="ghost" className="w-full justify-start">
                        <Link to={item.to} onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </Link>
                      </Button>
                    ))}
                    <Separator className="my-1" />
                    <Button variant="ghost" onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full justify-start">
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </Button>
                  </MotionCard>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Button
              onClick={() => setIsOpen(true)}
              className="h-auto gap-2.5"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge variant="secondary" className="absolute -right-2 -top-2 h-5 min-w-5 justify-center rounded-full px-1">
                    {totalItems}
                  </Badge>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] opacity-80 leading-none">{totalItems} Items</p>
                <p className="text-sm font-bold leading-none mt-0.5">{formatCurrency(totalPrice)}</p>
              </div>
            </Button>

            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen(!mobileOpen)}>
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
            <Button
              onClick={() => { setCatOpen(!catOpen); setActiveCat(null); }}
            >
              <Menu className="h-4 w-4" />
              All Categories
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", catOpen ? "rotate-180" : "")} />
            </Button>

            <AnimatePresence>
              {catOpen && (
                <MotionCard
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 flex z-50 overflow-hidden"
                >
                  {/* Parent Categories */}
                  <div className="w-64 border-r border-border py-2 max-h-[420px] overflow-y-auto">
                    {categories.map((cat) => {
                      const Icon = getCatIcon(cat.slug);
                      return (
                        <Button
                          key={cat.slug}
                          variant={activeCat === cat.slug ? "secondary" : "ghost"}
                          onMouseEnter={() => setActiveCat(cat.slug)}
                          className="w-full justify-start gap-3"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{cat.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                        </Button>
                      );
                    })}
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
                            <Button key={child.slug} asChild variant="ghost" className="w-full justify-start">
                              <Link
                                to={`/shop?cat=${activeCat}&sub=${child.slug}`}
                                onClick={() => { setCatOpen(false); setActiveCat(null); }}
                              >
                                {child.name}
                              </Link>
                            </Button>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MotionCard>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center ml-1">
            {allNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 h-12 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
                {link.badge && (
                  <Badge className="ml-1.5">HOT</Badge>
                )}
              </Link>
            ))}
          </nav>

          {freeShippingThreshold != null && (
            <div className="ml-auto text-sm text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
              Free shipping on orders {formatCurrency(freeShippingThreshold)}+
            </div>
          )}
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
              <SectionTitle as="p" className="px-3 py-2">Categories</SectionTitle>
              {categories.map((cat) => {
                const Icon = getCatIcon(cat.slug);
                return (
                <div key={cat.slug}>
                  <Button
                    variant="ghost"
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.slug ? null : cat.slug)}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-left">{cat.name}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", mobileExpandedCat === cat.slug ? "rotate-180" : "")} />
                  </Button>
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
                );
              })}

              <Separator className="my-2" />
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/track-order" onClick={() => setMobileOpen(false)}>
                  <Truck className="h-4 w-4 text-primary" />
                  Track your order
                </Link>
              </Button>
              {allNavLinks.map((link) => (
                <Button key={link.to} asChild variant="ghost" className="w-full justify-start">
                  <Link to={link.to} onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                </Button>
              ))}
              <Separator className="my-2" />
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="w-full justify-start"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </Button>
              <Separator className="my-2" />
              {isLoggedIn ? (
                <>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/account" onClick={() => setMobileOpen(false)}>
                      <User className="h-4 w-4 text-primary" />
                      My Account
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/account/orders" onClick={() => setMobileOpen(false)}>
                      <Package className="h-4 w-4 text-primary" />
                      My Orders
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={() => { logout(); setMobileOpen(false); }} className="w-full justify-start">
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </Button>
                </>
              ) : (
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <User className="h-4 w-4" />
                    Login / Sign Up
                  </Link>
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
