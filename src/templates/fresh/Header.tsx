import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Heart, LayoutGrid, Moon, Percent, Phone, ShoppingBasket, Sun, Truck, User } from "lucide-react";
import { StoreClosureBanner } from "@/components/StoreHours";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiCategory } from "@/services/categoryApi";
import { useStoreChrome } from "../shared/useStoreChrome";
import { tile } from "./helpers";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const ICON_BTN = cn("relative flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary", FOCUS);
const COUNT = "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-primary-foreground";

/** Phones collapse the promise strip and category chips once the shopper scrolls down. */
function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Hysteresis so the header doesn't flicker around the threshold
      setCompact((c) => (c ? y > 40 : y > 140));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return compact;
}

function CategoryChips({ categories }: { categories: ApiCategory[] }) {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const activeCat = pathname === "/shop" ? params.get("cat") : null;
  const chip = cn("flex h-9 shrink-0 snap-start items-center gap-2 rounded-pill border py-1 pl-1 pr-3.5 text-[13px] font-bold transition-colors", FOCUS);

  return (
    <nav aria-label="Categories">
      <ul className="container no-scrollbar flex snap-x scroll-px-4 gap-2 overflow-x-auto py-2">
        <li className="shrink-0">
          <Link
            to="/deals"
            className={cn(chip, "border-transparent bg-highlight text-highlight-foreground", pathname === "/deals" && "ring-2 ring-primary")}
            aria-current={pathname === "/deals" ? "page" : undefined}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-highlight-foreground/10"><Percent className="h-3.5 w-3.5" aria-hidden="true" /></span>
            Offers
          </Link>
        </li>
        <li className="shrink-0">
          <Link
            to="/categories"
            className={cn(chip, pathname === "/categories" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-card-foreground hover:border-primary")}
            aria-current={pathname === "/categories" ? "page" : undefined}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-tile-5 text-ink"><LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" /></span>
            All
          </Link>
        </li>
        {categories.map((cat, i) => {
          const active = activeCat === cat.slug;
          return (
            <li key={cat.id} className="shrink-0">
              <Link
                to={`/shop?cat=${cat.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(chip, active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-card-foreground hover:border-primary")}
              >
                <span className={cn("flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-sm font-bold text-ink", tile(i))}>
                  {cat.image ? (
                    <img src={getImageUrl(cat.image)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    cat.name.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="max-w-[10rem] truncate">{cat.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Header() {
  const chrome = useStoreChrome();
  const compact = useCompact();
  const { cart, darkMode, auth, freeShippingThreshold, formatCurrency } = chrome;
  const phone = chrome.contact.phone?.trim();

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />

      {/* Delivery promise strip */}
      <div className={cn("bg-primary text-xs text-primary-foreground", compact && "max-md:hidden")}>
        <div className="container flex h-8 items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 font-semibold">
            <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Delivery in 24 hours
              {freeShippingThreshold != null && <> · Free over <strong className="font-extrabold">{formatCurrency(freeShippingThreshold)}</strong></>}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                aria-label={`Call ${phone}`}
                className="flex h-7 items-center gap-1 rounded-pill px-1.5 font-bold hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{phone}</span>
              </a>
            )}
            <button
              type="button"
              onClick={darkMode.toggle}
              aria-label={darkMode.isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex size-7 items-center justify-center rounded-full hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              {darkMode.isDark ? <Sun className="h-3.5 w-3.5" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-background">
        {/* Phones: logo + cart on row 1, search full width on row 2. md+: one row. */}
        <div className="container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 py-2.5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 md:py-3">
          <Link to="/" className={cn("flex min-w-0 items-center rounded-lg", FOCUS)} aria-label={`${chrome.storeName} home`}>
            {chrome.logo ? (
              <img src={chrome.logo} alt={chrome.storeName} className="h-9 w-auto max-w-[150px] object-contain md:h-11 md:max-w-[200px]" />
            ) : (
              <span className="truncate font-display text-2xl font-extrabold leading-none tracking-tight text-primary md:text-[1.75rem]">
                {chrome.storeName}
              </span>
            )}
          </Link>

          <div className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1 [&_input]:h-11 [&_input]:border-2 [&_input]:border-transparent [&_input]:bg-secondary [&_input]:font-semibold focus-within:[&_input]:border-primary">
            <SearchAutocomplete placeholder="Search rice, eggs, milk…" />
          </div>

          <div className="col-start-2 row-start-1 flex items-center justify-end gap-0.5 md:col-start-3 md:gap-1">
            <Link to={auth.isLoggedIn ? "/account" : "/login"} className={cn(ICON_BTN, "hidden md:flex")} aria-label={auth.isLoggedIn ? "My account" : "Log in"}>
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link to="/wishlist" className={ICON_BTN} aria-label={`Wishlist, ${chrome.wishlistCount} items`}>
              <Heart className="h-5 w-5" aria-hidden="true" />
              {chrome.wishlistCount > 0 && <span className={COUNT}>{chrome.wishlistCount > 99 ? "99+" : chrome.wishlistCount}</span>}
            </Link>
            <button
              type="button"
              onClick={cart.open}
              aria-label={cart.count > 0 ? `Open cart, ${cart.count} items, ${cart.formatted}` : "Open cart, empty"}
              className={cn(
                "ml-1 flex h-11 items-center gap-2 rounded-pill bg-highlight pl-1.5 pr-4 font-display text-highlight-foreground shadow-sm transition-transform hover:brightness-95 active:scale-95",
                FOCUS,
              )}
            >
              <span className="relative flex size-8 items-center justify-center rounded-full bg-highlight-foreground/10">
                <ShoppingBasket className="h-[18px] w-[18px]" aria-hidden="true" />
                {cart.count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-body text-[10px] font-extrabold leading-none text-primary-foreground">
                    {cart.count > 99 ? "99+" : cart.count}
                  </span>
                )}
              </span>
              <span className="text-base font-extrabold leading-none tabular-nums">{cart.count > 0 ? cart.formatted : "Cart"}</span>
            </button>
          </div>
        </div>

        <div className={cn(compact && "max-md:hidden")}>
          <CategoryChips categories={chrome.categories} />
        </div>
      </div>
    </header>
  );
}
