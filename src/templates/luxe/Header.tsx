import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Moon, Search, Sun, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreClosureBanner } from "@/components/StoreHours";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { usePromoBanner } from "@/templates/shared/useHomeContent";
import { EYEBROW, FOCUS, useBodyScrollLock, useEscape } from "./lib";

const EASE = [0.22, 1, 0.36, 1] as const;
const ICON_BTN = cn("relative inline-flex h-10 w-10 shrink-0 items-center justify-center transition-opacity hover:opacity-60", FOCUS);

type Chrome = ReturnType<typeof useStoreChrome>;

/**
 * Centred logo, quiet uppercase links, "Bag (n)" as text. On the home page it floats transparently
 * over the full-screen hero and settles onto the page colour once the shopper scrolls.
 */
export default function Header() {
  const chrome = useStoreChrome();
  const promo = usePromoBanner();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Any navigation closes the overlays.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuBtn.current?.focus();
  }, []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    searchBtn.current?.focus();
  }, []);

  useBodyScrollLock(menuOpen || searchOpen);
  useEscape(menuOpen, closeMenu);
  useEscape(searchOpen, closeSearch);

  const transparent = isHome && !scrolled;
  const desktopLinks = chrome.shopLinks.slice(0, 5);

  return (
    <>
      <header
        className={cn(
          "z-50 transition-[background-color,color,border-color] duration-500",
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
          transparent ? "border-b border-transparent text-white" : "border-b border-border bg-background text-foreground",
        )}
      >
        {/* Soft shade so white type stays legible over bright photos */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/45 to-transparent transition-opacity duration-500",
            transparent ? "opacity-100" : "opacity-0",
          )}
        />

        <StoreClosureBanner />

        {promo && (
          <div className={cn("border-b transition-colors duration-500", transparent ? "border-white/20" : "border-border")}>
            <div className="container flex min-h-8 items-center justify-center py-1.5 text-center">
              <Link
                to={promo.link || "/deals"}
                className={cn("line-clamp-1 text-[10px] uppercase tracking-[0.25em] hover:underline hover:underline-offset-4", FOCUS)}
              >
                {promo.title}
                {promo.cta && <span className="hidden sm:inline"> — {promo.cta}</span>}
              </Link>
            </div>
          </div>
        )}

        <div className="container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 md:h-20 md:gap-6">
          {/* Left: menu + a few quiet links */}
          <div className="flex min-w-0 items-center gap-2 lg:gap-6">
            <button
              ref={menuBtn}
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              onClick={() => setMenuOpen(true)}
              className={cn(ICON_BTN, "-ml-2.5 w-auto gap-3 px-2.5")}
            >
              <Menu className="h-5 w-5" strokeWidth={1.25} />
              <span className={cn(EYEBROW, "hidden md:inline lg:hidden")}>Menu</span>
            </button>
            <nav aria-label="Main" className="hidden min-w-0 items-center gap-5 overflow-hidden lg:flex xl:gap-7">
              {desktopLinks.map((link, i) => (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  className={cn(
                    EYEBROW,
                    FOCUS,
                    "whitespace-nowrap py-2 underline-offset-[6px] hover:underline",
                    i === 4 && "hidden xl:inline",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Centre: logo */}
          <Link to="/" aria-label={`${chrome.storeName} home`} className={cn("flex min-w-0 justify-center", FOCUS)}>
            {chrome.logo ? (
              <img
                src={chrome.logo}
                alt={chrome.storeName}
                className={cn(
                  "h-7 w-auto max-w-[110px] object-contain transition-[filter] duration-500 sm:max-w-[180px] md:h-10 md:max-w-[240px]",
                  transparent && "brightness-0 invert",
                )}
              />
            ) : (
              <span className="block max-w-[120px] truncate pl-[0.3em] font-display text-base uppercase leading-none tracking-[0.3em] sm:max-w-[260px] sm:text-lg md:max-w-none md:text-2xl">
                {chrome.storeName}
              </span>
            )}
          </Link>

          {/* Right: search, account, wishlist, bag */}
          <div className="flex items-center justify-end gap-0.5 md:gap-1">
            <button
              ref={searchBtn}
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className={cn(ICON_BTN, "w-9 sm:w-10")}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
            </button>
            <Link
              to={chrome.auth.isLoggedIn ? "/account" : "/login"}
              aria-label={chrome.auth.isLoggedIn ? "My account" : "Sign in"}
              className={cn(ICON_BTN, "hidden sm:inline-flex")}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
            </Link>
            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${chrome.wishlistCount} items`}
              className={cn(ICON_BTN, "hidden sm:inline-flex")}
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
              {chrome.wishlistCount > 0 && (
                <span className="absolute right-1 top-1.5 text-[9px] font-medium leading-none tabular-nums">{chrome.wishlistCount}</span>
              )}
            </Link>
            <button
              type="button"
              onClick={chrome.cart.open}
              aria-label={`Bag, ${chrome.cart.count} items`}
              className={cn(EYEBROW, FOCUS, "-mr-1 ml-1 h-10 whitespace-nowrap px-1 tabular-nums transition-opacity hover:opacity-60")}
            >
              Bag ({chrome.cart.count})
            </button>
          </div>
        </div>
      </header>

      {createPortal(
        <AnimatePresence>
          {menuOpen && <MenuDrawer key="menu" chrome={chrome} onClose={closeMenu} onNavigate={() => setMenuOpen(false)} />}
          {searchOpen && <SearchPanel key="search" onClose={closeSearch} onNavigate={() => setSearchOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function MenuDrawer({ chrome, onClose, onNavigate }: { chrome: Chrome; onClose: () => void; onNavigate: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => closeBtn.current?.focus(), []);

  const secondary = [
    { label: chrome.wishlistCount > 0 ? `Wishlist (${chrome.wishlistCount})` : "Wishlist", to: "/wishlist" },
    { label: "Track order", to: "/track-order" },
    ...chrome.utilityLinks,
  ];
  const secondaryUnique = secondary.filter((l, i) => secondary.findIndex((x) => x.to === l.to) === i);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[80] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-y-0 left-0 z-[81] flex w-[88%] max-w-[440px] flex-col bg-background text-foreground"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6 md:h-20 md:px-10">
          <span className={cn(EYEBROW, "text-muted-foreground")}>Menu</span>
          <button ref={closeBtn} type="button" aria-label="Close menu" onClick={onClose} className={cn(ICON_BTN, "-mr-2.5")}>
            <X className="h-5 w-5" strokeWidth={1.25} />
          </button>
        </div>

        <nav aria-label="Menu" className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-12">
          <ul className="space-y-1">
            {chrome.shopLinks.map((link, i) => (
              <motion.li
                key={link.to + link.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.04, ease: EASE }}
              >
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  className={cn("block py-1.5 font-display text-3xl leading-tight transition-all hover:italic md:text-4xl", FOCUS)}
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </ul>

          <div className="my-8 h-px bg-border" />

          <ul className="space-y-3.5">
            {secondaryUnique.map((link) => (
              <li key={link.to + link.label}>
                <Link to={link.to} onClick={onNavigate} className={cn(EYEBROW, FOCUS, "hover:underline hover:underline-offset-4")}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-8 h-px bg-border" />

          <p className={cn(EYEBROW, "mb-4 text-muted-foreground")}>
            {chrome.auth.isLoggedIn ? `Hello, ${chrome.auth.user?.name?.split(" ")[0] ?? "there"}` : "Account"}
          </p>
          <ul className="space-y-3.5">
            {chrome.auth.isLoggedIn ? (
              <>
                <li><Link to="/account" onClick={onNavigate} className={cn(EYEBROW, FOCUS, "hover:underline hover:underline-offset-4")}>My account</Link></li>
                <li><Link to="/account/orders" onClick={onNavigate} className={cn(EYEBROW, FOCUS, "hover:underline hover:underline-offset-4")}>Orders</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={() => { chrome.auth.logout(); onNavigate(); }}
                    className={cn(EYEBROW, FOCUS, "hover:underline hover:underline-offset-4")}
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={onNavigate} className={cn(EYEBROW, FOCUS, "hover:underline hover:underline-offset-4")}>Sign in</Link></li>
                <li><Link to="/signup" onClick={onNavigate} className={cn(EYEBROW, FOCUS, "hover:underline hover:underline-offset-4")}>Create account</Link></li>
              </>
            )}
          </ul>
        </nav>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-5 md:px-10">
          <button
            type="button"
            onClick={chrome.darkMode.toggle}
            className={cn(EYEBROW, FOCUS, "inline-flex items-center gap-2.5 hover:opacity-60")}
          >
            {chrome.darkMode.isDark ? <Sun className="h-4 w-4" strokeWidth={1.25} /> : <Moon className="h-4 w-4" strokeWidth={1.25} />}
            {chrome.darkMode.isDark ? "Light mode" : "Dark mode"}
          </button>
          {chrome.socials.length > 0 && (
            <p className="flex flex-wrap gap-x-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {chrome.socials.slice(0, 2).map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={cn(FOCUS, "hover:text-foreground")}>
                  {s.label}
                </a>
              ))}
            </p>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function SearchPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate: () => void }) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[80] bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="fixed inset-x-0 top-0 z-[81] border-b border-border bg-background text-foreground"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="container max-w-4xl pb-10 pt-5 md:pb-16 md:pt-8">
          <div className="mb-6 flex items-center justify-between md:mb-10">
            <span className={cn(EYEBROW, "text-muted-foreground")}>Search</span>
            <button type="button" aria-label="Close search" onClick={onClose} className={cn(ICON_BTN, "-mr-2.5")}>
              <X className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>
          {/* Restyle the shared search field: hairline underline, large serif query */}
          <div className="[&_input]:h-14 [&_input]:rounded-none [&_input]:border-0 [&_input]:border-b [&_input]:border-foreground [&_input]:bg-transparent [&_input]:pl-9 [&_input]:font-display [&_input]:text-xl [&_input]:focus-visible:ring-0 [&_input]:focus-visible:ring-offset-0 md:[&_input]:text-3xl [&_svg.lucide-search]:left-0">
            <SearchAutocomplete mobile onClose={onNavigate} />
          </div>
          <p className="mt-4 hidden text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:block">Press Enter to search · Esc to close</p>
        </div>
      </motion.div>
    </>
  );
}
