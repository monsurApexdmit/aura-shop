import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, Sun, Moon, User, ChevronDown, Heart, LogOut, Package, Settings, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useShopNavLinks } from "@/hooks/useHomepageSections";
import { useCollections } from "@/hooks/useCollections";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { AnimatePresence, motion } from "framer-motion";
import { useStorefrontPages, pageLinkHref } from "@/hooks/useStorefrontPages";
import { StoreClosureBanner } from "@/components/StoreHours";
import AnnouncementBar from "@/components/AnnouncementBar";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { WithTooltip } from "@/components/common/WithTooltip"

const MotionCard = motion.create(Card);

const COUNT_BADGE = "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems, setIsOpen } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { isLoggedIn, user, logout } = useAuth();
  const { storeName, bannerUrl } = useCurrency();
  const { data: categories = [] } = useCategories();
  const navLinks = useShopNavLinks();
  const { data: pages = [] } = useStorefrontPages();
  // Pages published with "Header menu" placement in admin (Pages).
  const headerPageLinks = pages.filter((p) => p.place === 'header').map((p) => ({ label: p.title, to: pageLinkHref(p.slug) }));
  const allUtilityLinks = [...headerPageLinks, { label: "Contact", to: "/contact" }];
  // Collections link only once the store has published collections, so the nav never leads to an empty page.
  const { data: collections = [] } = useCollections();
  const hasCollections = collections.length > 0;
  const shopLinks = [
    ...navLinks,
    { label: "Shop all", to: "/shop" },
    ...(hasCollections ? [{ label: "Collections", to: "/collections" }] : []),
  ];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [mobileBrowse, setMobileBrowse] = useState<"categories" | "collections">("categories");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
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
      <AnnouncementBar />

      {/* Main Header */}
      <div className="relative z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 md:h-[72px]">
          <div className="flex items-center gap-1">
            <WithTooltip content={mobileOpen ? "Close menu" : "Open menu"}><Button variant="ghost" size="icon" className="-ml-2 rounded-full lg:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button></WithTooltip>
            <Link to="/" className="flex min-w-0 items-center">
              {bannerUrl ? (
                <img src={bannerUrl} alt={storeName} className="h-9 w-auto max-w-[140px] object-contain sm:h-11 sm:max-w-[200px]" />
              ) : (
                <span className="truncate font-display text-lg font-extrabold tracking-tight text-foreground sm:text-2xl">
                  {storeName}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {[...shopLinks, ...headerPageLinks].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="py-2 text-sm font-medium text-foreground underline-offset-8 hover:underline"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/deals" className="py-2 text-sm font-semibold text-highlight underline-offset-8 hover:underline">
              Sale
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center justify-self-end gap-0.5">
            <WithTooltip content="Search"><Button variant="ghost" size="icon" className="rounded-full" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-[18px] w-[18px]" />
            </Button></WithTooltip>
            <WithTooltip content={theme === "light" ? "Dark mode" : "Light mode"}><Button variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex" aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
            </Button></WithTooltip>
            {/* User Menu */}
            <div ref={userMenuRef} className="relative block">
              <WithTooltip content={isLoggedIn ? "Account menu" : "Login"}><Button variant="ghost" size="icon" className="rounded-full" aria-label={isLoggedIn ? "Account menu" : "Login"} onClick={() => isLoggedIn ? setUserMenuOpen(!userMenuOpen) : undefined} asChild={!isLoggedIn}>
                {isLoggedIn ? (
                  <UserAvatar className="size-8" name={user?.name} fallback={user?.name?.charAt(0).toUpperCase() || "U"} />
                ) : (
                  <Link to="/login"><User className="h-[18px] w-[18px]" /></Link>
                )}
              </Button></WithTooltip>
              <AnimatePresence>
                {userMenuOpen && isLoggedIn && (
                  <MotionCard
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl py-2 shadow-lg"
                  >
                    <div className="px-4 py-2">
                      <p className="font-semibold text-sm text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Separator />
                    {[
                      { label: "My Account", to: "/account", icon: User },
                      { label: "My Orders", to: "/account/orders", icon: Package },
                      { label: "Track Order", to: "/track-order", icon: Truck },
                      { label: "Settings", to: "/account/profile", icon: Settings },
                    ].map((item) => (
                      <Button key={item.to} asChild variant="ghost" className="w-full justify-start rounded-none">
                        <Link to={item.to} onClick={() => setUserMenuOpen(false)}>
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </Link>
                      </Button>
                    ))}
                    <Separator className="my-1" />
                    <Button variant="ghost" onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full justify-start rounded-none">
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </Button>
                  </MotionCard>
                )}
              </AnimatePresence>
            </div>
            <WithTooltip content="Wishlist"><Button asChild variant="ghost" size="icon" className="relative hidden rounded-full sm:inline-flex">
              <Link to="/wishlist" aria-label={`Wishlist, ${totalWishlistItems} items`}>
                <Heart className="h-[18px] w-[18px]" />
                {totalWishlistItems > 0 && <span className={COUNT_BADGE}>{totalWishlistItems}</span>}
              </Link>
            </Button></WithTooltip>
            <WithTooltip content="Bag"><Button variant="ghost" size="icon" className="relative rounded-full" aria-label={`Bag, ${totalItems} items`} onClick={() => setIsOpen(true)}>
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && <span className={COUNT_BADGE}>{totalItems}</span>}
            </Button></WithTooltip>
          </div>
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-[60] border-b border-border bg-background"
          >
            <div className="container max-w-2xl py-3">
              <SearchAutocomplete mobile onClose={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav: departments, then parent-child categories */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-b border-border overflow-hidden bg-background max-h-[70vh] overflow-y-auto"
          >
            <nav className="container py-3 space-y-0.5">
              <div className="grid grid-cols-2 gap-2 pb-3">
                {shopLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl bg-secondary px-4 py-3 font-display text-lg font-bold"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/deals"
                  onClick={() => setMobileOpen(false)}
                  className="col-span-2 rounded-2xl bg-highlight px-4 py-3 font-display text-lg font-bold text-highlight-foreground"
                >
                  Sale
                </Link>
              </div>

              {hasCollections ? (
                <SegmentedControl
                  aria-label="Browse by"
                  className="mx-3 my-2"
                  value={mobileBrowse}
                  onValueChange={(v) => setMobileBrowse(v as "categories" | "collections")}
                  options={[
                    { value: "categories", label: "All Categories" },
                    { value: "collections", label: "Collections" },
                  ]}
                />
              ) : (
                <SectionTitle as="p" className="px-3 py-2">Categories</SectionTitle>
              )}
              {hasCollections && mobileBrowse === "collections" && (
                <>
                  {collections.map((c) => (
                    <Button key={c.slug} asChild variant="ghost" className="w-full justify-between">
                      <Link to={`/collections/${c.slug}`} onClick={() => setMobileOpen(false)}>
                        <span className="truncate">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.productCount}</span>
                      </Link>
                    </Button>
                  ))}
                  <Button asChild variant="ghost" className="w-full justify-start font-semibold">
                    <Link to="/collections" onClick={() => setMobileOpen(false)}>View all collections</Link>
                  </Button>
                </>
              )}
              {(!hasCollections || mobileBrowse === "categories") && categories.map((cat) => (
                <div key={cat.slug}>
                  <Button
                    variant="ghost"
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === cat.slug ? null : cat.slug)}
                    className="w-full justify-start gap-3"
                  >
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
                        <div className="pl-7 pr-3 pb-1 space-y-0.5">
                          <Link
                            to={`/shop?cat=${cat.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 text-sm font-semibold text-foreground"
                          >
                            All {cat.name}
                          </Link>
                          {cat.children.map((child) => (
                            <Link
                              key={child.slug}
                              to={`/shop?cat=${cat.slug}&sub=${child.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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

              <Separator className="my-2" />
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/track-order" onClick={() => setMobileOpen(false)}>
                  <Truck className="h-4 w-4" />
                  Track your order
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
                  <Heart className="h-4 w-4" />
                  Wishlist{totalWishlistItems > 0 && ` (${totalWishlistItems})`}
                </Link>
              </Button>
              {allUtilityLinks.map((link) => (
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
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link to="/account/orders" onClick={() => setMobileOpen(false)}>
                      <Package className="h-4 w-4" />
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
