import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Flame, Heart, Moon, Phone, ShoppingCart, Sun, Truck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreClosureBanner } from "@/components/StoreHours";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { isTabRoot } from "@/lib/mobileNav";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import CategoryMenu from "./CategoryMenu";
import { CountBadge } from "./parts";
import { FOCUS, categoryLink } from "./lib";

// Square search box with a raspberry frame, overriding the shared pill input.
const SEARCH_SKIN = "[&_input]:h-10 [&_input]:rounded-md [&_input]:border-2 [&_input]:border-highlight [&_input]:bg-card [&_input]:text-sm md:[&_input]:h-11";

/** Phone chip rows only on browse screens; inner screens keep the header short. */
const CHIP_PATHS = ["/", "/shop", "/categories", "/deals", "/collections"];

function Logo({ logo, storeName, className }: { logo: string | null; storeName: string; className?: string }) {
  return (
    <Link to="/" aria-label={`${storeName} home`} className={cn("flex min-w-0 shrink items-center rounded-sm", FOCUS, className)}>
      {logo ? (
        <img src={logo} alt={storeName} className="h-8 w-auto max-w-[130px] object-contain md:h-10 md:max-w-[190px]" />
      ) : (
        <span className="truncate font-display text-lg font-extrabold tracking-tight text-foreground md:text-2xl">{storeName}</span>
      )}
    </Link>
  );
}

export default function Header() {
  const chrome = useStoreChrome();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { storeName, logo, cart, wishlistCount, auth, darkMode, contact, freeShippingThreshold, formatCurrency } = chrome;
  const topCategories = chrome.categories;
  const showChips = CHIP_PATHS.includes(pathname.replace(/\/+$/, "") || "/");
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"));
  const firstName = auth.user?.name?.split(" ")[0];

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />

      {/* Top strip (desktop) */}
      <div className="hidden bg-ink text-ink-foreground md:block">
        <div className="container flex h-8 items-center justify-between gap-6 text-xs">
          <div className="flex min-w-0 items-center gap-5">
            {freeShippingThreshold != null && (
              <span className="flex items-center gap-1.5 truncate">
                <Truck className="h-3.5 w-3.5 shrink-0 text-highlight-soft" aria-hidden="true" />
                Free delivery over <strong className="font-semibold">{formatCurrency(freeShippingThreshold)}</strong>
              </span>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className={cn("flex items-center gap-1.5 rounded-sm text-ink-foreground/80 hover:text-ink-foreground", FOCUS)}>
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {contact.phone}
              </a>
            )}
          </div>
          <nav aria-label="Utility" className="flex shrink-0 items-center gap-4">
            <Link to="/track-order" className={cn("flex items-center gap-1.5 rounded-sm text-ink-foreground/80 hover:text-ink-foreground", FOCUS)}>
              <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Track order
            </Link>
            {chrome.utilityLinks.map((l) => (
              <Link key={l.to} to={l.to} className={cn("rounded-sm text-ink-foreground/80 hover:text-ink-foreground", FOCUS)}>{l.label}</Link>
            ))}
            <span className="h-3.5 w-px bg-ink-foreground/20" aria-hidden="true" />
            <button
              type="button"
              onClick={darkMode.toggle}
              aria-label={darkMode.isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={cn("flex items-center gap-1.5 rounded-sm text-ink-foreground/80 hover:text-ink-foreground", FOCUS)}
            >
              {darkMode.isDark ? <Sun className="h-3.5 w-3.5" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5" aria-hidden="true" />}
              {darkMode.isDark ? "Light" : "Dark"}
            </button>
          </nav>
        </div>
      </div>

      {/* Main row */}
      <div className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-2 md:h-[76px] md:gap-6">
          {!isTabRoot(pathname) && (
            <button type="button" onClick={goBack} aria-label="Back" className={cn("-ml-2 flex size-9 shrink-0 items-center justify-center rounded-md text-foreground md:hidden", FOCUS)}>
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
          <Logo logo={logo} storeName={storeName} className="mr-auto md:mr-0 md:max-w-[200px]" />

          <div className={cn("hidden min-w-0 flex-1 md:block", SEARCH_SKIN)}>
            <SearchAutocomplete />
          </div>

          {/* Desktop actions */}
          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <Link
              to={auth.isLoggedIn ? "/account" : "/login"}
              className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary", FOCUS)}
            >
              <User className="h-6 w-6 text-foreground" aria-hidden="true" />
              <span className="hidden flex-col leading-tight lg:flex">
                <span className="text-[11px] text-muted-foreground">{auth.isLoggedIn ? `Hi, ${firstName || "there"}` : "Hello, sign in"}</span>
                <span className="text-sm font-semibold text-foreground">Account</span>
              </span>
            </Link>
            <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary", FOCUS)}>
              <span className="relative">
                <Heart className="h-6 w-6 text-foreground" aria-hidden="true" />
                <CountBadge count={wishlistCount} />
              </span>
              <span className="hidden flex-col leading-tight lg:flex">
                <span className="text-[11px] text-muted-foreground">{wishlistCount} saved</span>
                <span className="text-sm font-semibold text-foreground">Wishlist</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={cart.open}
              aria-label={`Cart, ${cart.count} items, ${cart.formatted}`}
              className={cn("flex items-center gap-2.5 rounded-md bg-secondary px-3 py-1.5 hover:bg-accent", FOCUS)}
            >
              <span className="relative">
                <ShoppingCart className="h-6 w-6 text-foreground" aria-hidden="true" />
                <CountBadge count={cart.count} className="ring-secondary" />
              </span>
              <span className="flex flex-col text-left leading-tight">
                <span className="text-[11px] text-muted-foreground">Cart</span>
                <span className="text-sm font-bold tabular-nums text-foreground">{cart.formatted}</span>
              </span>
            </button>
          </div>

          {/* Phone actions */}
          <div className="flex shrink-0 items-center gap-1 md:hidden">
            <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} className={cn("relative flex size-10 items-center justify-center rounded-md text-foreground", FOCUS)}>
              <Heart className="h-[22px] w-[22px]" aria-hidden="true" />
              <CountBadge count={wishlistCount} className="right-0.5 top-0.5" />
            </Link>
            <button type="button" onClick={cart.open} aria-label={`Cart, ${cart.count} items`} className={cn("relative -mr-2 flex size-10 items-center justify-center rounded-md text-foreground", FOCUS)}>
              <ShoppingCart className="h-[22px] w-[22px]" aria-hidden="true" />
              <CountBadge count={cart.count} className="right-0.5 top-0.5" />
            </button>
          </div>
        </div>

        {/* Phone search: always visible */}
        <div className={cn("container pb-2.5 md:hidden", SEARCH_SKIN)}>
          <SearchAutocomplete />
        </div>
      </div>

      {/* Category row (desktop) */}
      <div className="hidden border-b border-border bg-card md:block">
        <div className="container flex h-12 items-center gap-6">
          <CategoryMenu categories={topCategories} />
          <nav aria-label="Departments" className="no-scrollbar flex min-w-0 flex-1 items-center gap-5 overflow-x-auto">
            {chrome.shopNav.map((l) => (
              <Link
                key={l.to + l.label}
                to={l.to}
                className={cn("shrink-0 whitespace-nowrap rounded-sm py-1 text-sm font-medium text-foreground hover:text-highlight", FOCUS)}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/shop" className={cn("shrink-0 whitespace-nowrap rounded-sm py-1 text-sm font-medium text-foreground hover:text-highlight", FOCUS)}>Shop all</Link>
            {chrome.collections.length > 0 && (
              <Link to="/collections" className={cn("shrink-0 whitespace-nowrap rounded-sm py-1 text-sm font-medium text-foreground hover:text-highlight", FOCUS)}>Collections</Link>
            )}
          </nav>
          <Link to="/deals" className={cn("flex shrink-0 items-center gap-1.5 rounded-sm text-sm font-bold text-highlight hover:underline", FOCUS)}>
            <Flame className="h-4 w-4" aria-hidden="true" /> Deals
          </Link>
        </div>
      </div>

      {/* Category chips (phone) */}
      {showChips && (
        <nav aria-label="Categories" className="border-b border-border bg-card md:hidden">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
            <li className="shrink-0">
              <Link to="/deals" className={cn("flex h-8 items-center gap-1 rounded-pill bg-highlight px-3 text-xs font-bold text-highlight-foreground", FOCUS)}>
                <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Deals
              </Link>
            </li>
            {topCategories.map((c) => (
              <li key={c.id} className="shrink-0">
                <Link to={categoryLink(c)} className={cn("flex h-8 items-center rounded-pill border border-border bg-secondary px-3 text-xs font-medium text-foreground", FOCUS)}>
                  {c.name}
                </Link>
              </li>
            ))}
            {topCategories.length === 0 && chrome.shopNav.map((l) => (
              <li key={l.to + l.label} className="shrink-0">
                <Link to={l.to} className={cn("flex h-8 items-center rounded-pill border border-border bg-secondary px-3 text-xs font-medium text-foreground", FOCUS)}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
