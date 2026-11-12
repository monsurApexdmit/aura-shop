import { useEffect, useMemo, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation, useSearchParams } from "react-router-dom";
import {
  ChevronDown, Clock, Copy, Headset, Heart, House, LayoutGrid, MapPin, Menu, Moon, Percent, ShoppingCart, Sparkles, Sun, Truck, User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { StoreClosureBanner } from "@/components/StoreHours";
import { getImageUrl } from "@/lib/api";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStoreChrome } from "../shared/useStoreChrome";
import { useTemplateBlock } from "../shared/useTemplateContent";
import Brand from "./Brand";
import HeaderSearch from "./HeaderSearch";
import MenuSheet from "./MenuSheet";
import { FOCUS, FOCUS_ON_DARK, categoryIcon, copyCode, tile } from "./lib";

/** Phone category chips only on browse screens; inner screens keep the header short. */
const CHIP_PATHS = ["/", "/shop", "/categories", "/deals", "/collections"];

const COUNT = "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground ring-2 ring-background";

/** Phones hide the announcement and chips once the shopper scrolls, so the header stays short. */
function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCompact((c) => (c ? y > 40 : y > 140));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return compact;
}

function AnnouncementBar({ isDark, toggleDark }: { isDark: boolean; toggleDark: () => void }) {
  const { t } = useTranslation();
  const { freeShippingThreshold, formatCurrency } = useStoreChrome();
  const fallback = useMemo(
    () => ({
      text: freeShippingThreshold != null
        ? t("tpl_fresh:shared.freeDeliveryOver", { amount: formatCurrency(freeShippingThreshold) })
        : t("tpl_fresh:header.announcement"),
      code: "",
      link: "/shop",
    }),
    [freeShippingThreshold, formatCurrency, t],
  );
  const { block } = useTemplateBlock("announcement", fallback);
  const util = cn("flex h-7 shrink-0 items-center gap-1.5 rounded px-1.5 hover:bg-primary-foreground/15", FOCUS_ON_DARK);

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container flex h-9 items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          {block?.text && (
            <>
              <Truck className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
              {block.link ? (
                <Link to={block.link} className={cn("truncate rounded-sm font-semibold hover:underline", FOCUS_ON_DARK)}>{block.text}</Link>
              ) : (
                <p className="truncate font-semibold">{block.text}</p>
              )}
              {block.code && (
                <button
                  type="button"
                  onClick={() => copyCode(block.code)}
                  aria-label={t("tpl_fresh:header.copyCode", { code: block.code })}
                  className={cn("flex h-6 shrink-0 items-center gap-1 rounded border border-dashed border-primary-foreground/60 px-1.5 font-bold tracking-wide hover:bg-primary-foreground/15", FOCUS_ON_DARK)}
                >
                  {block.code}
                  <Copy className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
        <nav aria-label={t("tpl_fresh:header.help")} className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/track-order" className={cn(util, "hidden sm:flex")}>
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {t("common:nav.trackOrder")}
          </Link>
          <Link to="/contact" className={cn(util, "hidden sm:flex")}>
            <Headset className="h-3.5 w-3.5" aria-hidden="true" /> {t("tpl_fresh:header.helpCenter")}
          </Link>
          <button type="button" onClick={toggleDark} aria-label={isDark ? t("tpl_fresh:header.toLight") : t("tpl_fresh:header.toDark")} className={cn(util, "w-7 justify-center px-0")}>
            {isDark ? <Sun className="h-3.5 w-3.5" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        </nav>
      </div>
    </div>
  );
}

function CategoryThumb({ name, image, index, className }: { name: string; image?: string | null; index: number; className?: string }) {
  const Icon = categoryIcon(name);
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full text-ink", tile(index), className)} aria-hidden="true">
      {image ? <img src={getImageUrl(image)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Icon className="h-3.5 w-3.5" />}
    </span>
  );
}

function AllCategoriesMenu() {
  const { t } = useTranslation();
  const { categories } = useStoreChrome();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("flex h-9 shrink-0 items-center gap-2 rounded-pill bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 data-[state=open]:bg-primary/90", FOCUS)}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        {t("common:nav.allCategories")}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[70vh] w-64 overflow-y-auto">
        {categories.map((c, i) => (
          <DropdownMenuItem key={c.id} asChild className="cursor-pointer gap-2.5 py-2">
            <Link to={`/shop?cat=${c.slug}`}>
              <CategoryThumb name={c.name} image={c.image} index={i} className="size-7" />
              <span className="truncate">{c.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        {categories.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem asChild className="cursor-pointer font-semibold text-primary focus:text-primary">
          <Link to="/categories">{t("tpl_fresh:header.browseAllCategories")}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavRow() {
  const { t } = useTranslation();
  const { shopNav } = useStoreChrome();
  const { pathname, search } = useLocation();
  const here = pathname + search;
  const link = (active: boolean) =>
    cn("flex h-9 shrink-0 items-center gap-1.5 rounded-pill px-2.5 text-[13px] font-medium transition-colors", active ? "bg-accent text-primary" : "text-foreground hover:text-primary", FOCUS);

  return (
    <div className="hidden border-b border-border bg-background md:block">
      <div className="container flex h-12 items-center gap-3">
        <AllCategoriesMenu />
        <nav aria-label={t("tpl_fresh:header.departments")} className="min-w-0 flex-1">
          <ul className="no-scrollbar flex items-center gap-0.5 overflow-x-auto py-1">
            <li>
              <RouterNavLink to="/" end className={({ isActive }) => link(isActive)}>
                <House className="h-3.5 w-3.5" aria-hidden="true" /> {t("common:nav.home")}
              </RouterNavLink>
            </li>
            {shopNav.map((l) => {
              const Icon = categoryIcon(l.label);
              const active = here === l.to;
              return (
                <li key={`${l.label}-${l.to}`}>
                  <Link to={l.to} aria-current={active ? "page" : undefined} className={link(active)}>
                    <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span className="max-w-[11rem] truncate">{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <RouterNavLink to="/deals" className={({ isActive }) => cn(link(isActive), "font-semibold text-highlight hover:text-highlight")}>
            <Percent className="h-3.5 w-3.5" aria-hidden="true" /> {t("tpl_fresh:shared.weeklyDeals")}
          </RouterNavLink>
          <Link to="/shop" className={link(false)}>
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {t("tpl_fresh:shared.newArrivals")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function PhoneChips() {
  const { t } = useTranslation();
  const { categories } = useStoreChrome();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const activeCat = pathname === "/shop" ? params.get("cat") : null;
  if (categories.length === 0) return null;
  const chip = cn("flex h-8 items-center gap-1.5 rounded-full border pl-1 pr-3 text-xs font-medium", FOCUS);
  return (
    <nav aria-label={t("common:nav.categories")} className="border-b border-border bg-background md:hidden">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
        <li className="shrink-0">
          <Link to="/deals" className={cn(chip, "border-transparent bg-highlight pl-2.5 text-highlight-foreground")}>
            <Percent className="h-3.5 w-3.5" aria-hidden="true" /> {t("common:nav.deals")}
          </Link>
        </li>
        {categories.map((c, i) => (
          <li key={c.id} className="shrink-0">
            <Link
              to={`/shop?cat=${c.slug}`}
              aria-current={activeCat === c.slug ? "page" : undefined}
              className={cn(chip, activeCat === c.slug ? "border-primary bg-accent text-primary" : "border-border bg-card text-foreground")}
            >
              <CategoryThumb name={c.name} image={c.image} index={i} className="size-6" />
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const chrome = useStoreChrome();
  const { cart, auth, darkMode, categories } = chrome;
  const { pathname } = useLocation();
  const compact = useCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerNote = useMemo(() => ({ label: t("tpl_fresh:header.noteLabel"), text: t("tpl_fresh:header.noteText") }), [t]);
  const { block: note } = useTemplateBlock("headerNote", headerNote);
  const showChips = CHIP_PATHS.includes(pathname.replace(/\/+$/, "") || "/");
  const firstName = auth.user?.name?.split(" ")[0];
  const action = cn("relative flex shrink-0 items-center gap-2 rounded-lg p-1.5 text-foreground transition-colors hover:text-primary", FOCUS);

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />
      <div className={cn(compact && "max-md:hidden")}>
        <AnnouncementBar isDark={darkMode.isDark} toggleDark={darkMode.toggle} />
      </div>

      <div className="border-b border-border bg-background">
        <div className="container flex h-14 items-center gap-2 md:h-[72px] md:gap-4 xl:gap-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("common:nav.openMenu")}
            aria-haspopup="dialog"
            className={cn("-ml-1.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-secondary", FOCUS)}
          >
            <Menu className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>
          <Brand storeName={chrome.storeName} logo={chrome.logo} className="mr-auto md:mr-0 md:shrink-0" />

          {note && (note.label || note.text) && (
            <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-border bg-secondary py-1.5 pl-1.5 pr-3 xl:flex">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                <Clock className="h-3.5 w-3.5" />
              </span>
              <span className="flex flex-col leading-tight">
                {note.label && <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{note.label}</span>}
                {note.text && <span className="text-xs font-bold text-foreground">{note.text}</span>}
              </span>
            </div>
          )}

          <HeaderSearch categories={categories} className="hidden min-w-0 flex-1 md:block" />

          <div className="flex shrink-0 items-center gap-0.5 md:gap-2">
            <LanguageSwitcher
              className={cn("hidden h-9 min-w-9 rounded-full border border-border px-2 text-foreground hover:bg-transparent hover:text-primary md:inline-flex", FOCUS)}
            />
            <Link to={auth.isLoggedIn ? "/account" : "/login"} className={cn(action, "hidden md:flex")} aria-label={auth.isLoggedIn ? t("common:nav.myAccount") : t("common:nav.signIn")}>
              <span className="flex size-9 items-center justify-center rounded-full border border-border" aria-hidden="true">
                <User className="h-[18px] w-[18px]" />
              </span>
              <span className="hidden flex-col text-left leading-tight xl:flex" aria-hidden="true">
                <span className="text-[11px] text-muted-foreground">{t("common:nav.account")}</span>
                <span className="max-w-[7rem] truncate text-[13px] font-semibold">{auth.isLoggedIn ? (firstName ? t("tpl_fresh:header.hiName", { name: firstName }) : t("common:nav.myAccount")) : t("common:nav.signIn")}</span>
              </span>
            </Link>
            <Link to="/wishlist" className={action} aria-label={t("tpl_fresh:header.wishlistLabel", { count: chrome.wishlistCount })}>
              <span className="relative flex size-9 items-center justify-center rounded-full md:border md:border-border" aria-hidden="true">
                <Heart className="h-5 w-5 md:h-[18px] md:w-[18px]" />
                {chrome.wishlistCount > 0 && <span className={COUNT}>{chrome.wishlistCount > 99 ? "99+" : chrome.wishlistCount}</span>}
              </span>
              <span className="hidden flex-col text-left leading-tight xl:flex" aria-hidden="true">
                <span className="text-[11px] text-muted-foreground">{t("tpl_fresh:header.saved")}</span>
                <span className="text-[13px] font-semibold">{t("common:nav.wishlist")}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={cart.open}
              aria-label={cart.count > 0 ? t("tpl_fresh:header.cartLabel", { count: cart.count, total: cart.formatted }) : t("tpl_fresh:header.cartEmpty")}
              className={action}
            >
              <span className="relative flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cart.count > 0 && <span className={COUNT}>{cart.count > 99 ? "99+" : cart.count}</span>}
              </span>
              <span className="hidden flex-col text-left leading-tight lg:flex" aria-hidden="true">
                <span className="text-[11px] text-muted-foreground">{t("common:nav.cart")}</span>
                <span className="text-[13px] font-bold tabular-nums">{cart.formatted}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Phone search: always visible */}
        <div className="container pb-2.5 md:hidden">
          <HeaderSearch categories={categories} />
        </div>
      </div>

      <NavRow />
      {showChips && <div className={cn(compact && "hidden")}><PhoneChips /></div>}

      <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}
