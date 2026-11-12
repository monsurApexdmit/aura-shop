import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Gift, Heart, HelpCircle, Home, LayoutGrid, LogOut, Menu, Moon, ShoppingCart, Star, Sun, Truck, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreClosureBanner } from "@/components/StoreHours";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isTabRoot } from "@/lib/mobileNav";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { useTemplateBlock } from "@/templates/shared/useTemplateContent";
import { useActiveCoupons } from "@/templates/shared/useHomeContent";
import { Brand, CountBadge } from "./parts";
import { FOCUS, FOCUS_ON_PURPLE, categoryIcon, navLabel, tone } from "./lib";

/** Restyles the shared search box: white field, round purple search button. */
const SEARCH_SKIN = cn(
  "min-w-0 flex-1",
  "[&_input]:h-11 [&_input]:border-2 [&_input]:border-border [&_input]:bg-background [&_input]:font-semibold [&_input]:placeholder:font-normal",
  "[&_input:focus-visible]:border-primary [&_input:focus-visible]:ring-0 [&_input:focus-visible]:ring-offset-0",
);
/** Desktop box has a submit button (always the last child); paint it purple. */
const SUBMIT_SKIN = "[&_.group>button:last-child]:bg-primary [&_.group>button:last-child]:text-primary-foreground [&_.group>button:last-child:hover]:bg-primary/90";

/** Phone search only on browse screens; inner screens keep the sticky header short. */
const SEARCH_PATHS = ["/", "/shop", "/categories", "/deals", "/collections", "/wishlist"];

const NAV_ITEM = "flex h-9 shrink-0 items-center gap-1.5 rounded-pill px-3 text-[13px] font-bold transition-colors";

function AnnouncementBar() {
  const { t } = useTranslation();
  // Shown until the owner saves the announcement block. No code or offer: a made-up one would fail at checkout.
  const fallback = useMemo(() => ({ text: t("tpl_single:header.announcement"), code: "", link: "/shop" }), [t]);
  const { block: saved } = useTemplateBlock("announcement", fallback);
  const { darkMode, helpLinks, formatCurrency } = useStoreChrome();
  const coupons = useActiveCoupons();
  // Until the owner writes their own bar, a live coupon makes a better offer than the stock line
  const coupon = saved === fallback ? coupons[0] : undefined;
  const block = coupon
    ? {
        text: coupon.free_shipping
          ? t("tpl_single:header.couponFreeDelivery")
          : t("tpl_single:header.couponSave", { amount: coupon.type === "fixed" ? formatCurrency(Number(coupon.discount)) : `${coupon.discount}%` }),
        code: coupon.code,
        link: "/shop",
      }
    : saved;
  const help = helpLinks.find((l) => /faq|help/i.test(l.label)) ?? { label: t("tpl_single:header.helpCenter"), to: "/contact" };

  return (
    <div className="bg-primary text-primary-foreground dark:bg-ink dark:text-ink-foreground">
      <div className="container flex h-9 items-center justify-between gap-3 text-xs font-semibold">
        <div className="flex min-w-0 items-center gap-2">
          {block && (
            <>
              <Gift className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
              {block.link ? (
                <Link to={block.link} className={cn("truncate rounded-sm hover:underline", FOCUS_ON_PURPLE)}>{block.text}</Link>
              ) : (
                <span className="truncate">{block.text}</span>
              )}
              {block.code && (
                <span className="hidden shrink-0 rounded-pill bg-[hsl(45_100%_62%)] px-2.5 py-0.5 text-[11px] font-extrabold text-[hsl(250_40%_16%)] sm:inline">
                  {t("tpl_single:header.useCode", { code: block.code })}
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-4">
          <Link to="/track-order" className={cn("hidden items-center gap-1 rounded-sm hover:underline sm:flex", FOCUS_ON_PURPLE)}>
            <Truck className="h-3.5 w-3.5" aria-hidden="true" /> {t("common:nav.trackOrder")}
          </Link>
          <Link to={help.to} className={cn("hidden items-center gap-1 rounded-sm hover:underline md:flex", FOCUS_ON_PURPLE)}>
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /> {navLabel(t, help)}
          </Link>
          <LanguageSwitcher
            className={cn("hidden h-7 min-w-7 gap-1 rounded-full px-2 text-current hover:bg-white/15 sm:inline-flex [&_svg]:h-4 [&_svg]:w-4", FOCUS_ON_PURPLE)}
          />
          <button
            type="button"
            onClick={darkMode.toggle}
            aria-label={darkMode.isDark ? t("tpl_single:nav.switchToLight") : t("tpl_single:nav.switchToDark")}
            className={cn("flex size-7 items-center justify-center rounded-full hover:bg-white/15", FOCUS_ON_PURPLE)}
          >
            {darkMode.isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconAction({ label, caption, count, Icon, to, onClick }: { label: string; caption: string; count?: number; Icon: typeof Heart; to?: string; onClick?: () => void }) {
  const body = (
    <>
      <span className="relative">
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} aria-hidden="true" />
        {count !== undefined && <CountBadge count={count} />}
      </span>
      <span className="hidden text-[11px] font-semibold text-muted-foreground lg:block">{caption}</span>
    </>
  );
  const cls = cn("flex min-w-10 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1 text-foreground transition-colors hover:text-primary", FOCUS);
  return to ? (
    <Link to={to} aria-label={label} className={cls}>{body}</Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>{body}</button>
  );
}

function MenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const chrome = useStoreChrome();
  const { auth, categories, shopLinks, utilityLinks, helpLinks, darkMode } = chrome;
  const row = cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-accent", FOCUS);
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto bg-background p-0">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-display text-xl">{t("common:nav.menu")}</SheetTitle>
          <SheetDescription className="sr-only">{t("tpl_single:header.menuDescription")}</SheetDescription>
        </SheetHeader>
        <nav aria-label={t("common:nav.menu")} className="space-y-5 px-3 py-4">
          <ul className="space-y-0.5">
            <li><Link to="/" onClick={close} className={row}><Home className="h-5 w-5 text-primary" aria-hidden="true" /> {t("common:nav.home")}</Link></li>
            {shopLinks.map((l, i) => {
              const Icon = categoryIcon(l.label);
              return (
                <li key={`${l.to}-${l.label}`}>
                  <Link to={l.to} onClick={close} className={row}>
                    <span className={cn("flex size-8 items-center justify-center rounded-full", tone(i).bg)} aria-hidden="true">
                      <Icon className={cn("h-4 w-4", tone(i).fg)} />
                    </span>
                    {navLabel(t, l)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {categories.length > 0 && (
            <div>
              <p className="px-3 pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t("common:nav.categories")}</p>
              <ul className="space-y-0.5">
                {categories.map((c) => (
                  <li key={c.id}><Link to={`/shop?cat=${c.slug}`} onClick={close} className={cn(row, "font-semibold")}>{c.name}</Link></li>
                ))}
                <li><Link to="/categories" onClick={close} className={cn(row, "text-primary")}><LayoutGrid className="h-4 w-4" aria-hidden="true" /> {t("common:nav.allCategories")}</Link></li>
              </ul>
            </div>
          )}

          <div>
            <p className="px-3 pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{t("tpl_single:header.helpAccount")}</p>
            <ul className="space-y-0.5">
              <li><Link to={auth.isLoggedIn ? "/account" : "/login"} onClick={close} className={cn(row, "font-semibold")}><User className="h-4 w-4 text-primary" aria-hidden="true" /> {auth.isLoggedIn ? t("common:nav.myAccount") : t("common:nav.signIn")}</Link></li>
              <li><Link to="/wishlist" onClick={close} className={cn(row, "font-semibold")}><Heart className="h-4 w-4 text-primary" aria-hidden="true" /> {t("common:nav.wishlist")}</Link></li>
              {[...utilityLinks, ...helpLinks.filter((h) => !utilityLinks.some((u) => u.to === h.to))].map((l) => (
                <li key={`${l.to}-${l.label}`}><Link to={l.to} onClick={close} className={cn(row, "font-semibold")}>{navLabel(t, l)}</Link></li>
              ))}
              <li>
                <button type="button" onClick={darkMode.toggle} className={cn(row, "w-full font-semibold")}>
                  {darkMode.isDark ? <Sun className="h-4 w-4 text-primary" aria-hidden="true" /> : <Moon className="h-4 w-4 text-primary" aria-hidden="true" />}
                  {darkMode.isDark ? t("common:theme.light") : t("common:theme.dark")}
                </button>
              </li>
              <li>
                <LanguageSwitcher
                  variant="full"
                  align="start"
                  className={cn(row, "h-auto w-full justify-start font-semibold [&_svg]:text-primary")}
                  contentClassName="z-[60]"
                />
              </li>
              {auth.isLoggedIn && (
                <li>
                  <button type="button" onClick={() => { auth.logout(); close(); }} className={cn(row, "w-full font-semibold")}>
                    <LogOut className="h-4 w-4 text-primary" aria-hidden="true" /> {t("common:nav.signOut")}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

/** Purple offer bar · logo, search pill and account/wishlist/cart · category row with icons and a Deals pill. */
export default function Header() {
  const { t } = useTranslation();
  const chrome = useStoreChrome();
  const { storeName, logo, tagline, cart, auth, wishlistCount, shopNav } = chrome;
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const tabRoot = isTabRoot(pathname);
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"));
  const here = pathname + search;
  const navLinks = shopNav.slice(0, 8);
  const showPhoneSearch = SEARCH_PATHS.includes(pathname.replace(/\/+$/, "") || "/");

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />
      <AnnouncementBar />

      {/* Main row */}
      <div className="border-b border-border bg-card">
        <div className="container flex h-16 items-center gap-2 sm:gap-4 md:h-[76px] lg:gap-8">
          {!tabRoot && (
            <button type="button" onClick={goBack} aria-label={t("common:actions.back")} className={cn("-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-foreground md:hidden", FOCUS)}>
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("common:nav.openMenu")}
            aria-expanded={menuOpen}
            className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-accent lg:-ml-2", tabRoot && "-ml-2", FOCUS)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <Brand logo={logo} storeName={storeName} tagline={tagline || undefined} className="mr-auto md:mr-0 md:shrink-0" />

          <div className={cn("hidden max-w-[560px] md:block", SEARCH_SKIN, SUBMIT_SKIN)}>
            <SearchAutocomplete placeholder={t("tpl_single:header.searchHint")} submitLabel={t("common:search.submit")} />
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2 md:ml-auto">
            <span className="hidden md:block">
              <IconAction label={auth.isLoggedIn ? t("common:nav.myAccount") : t("common:nav.signIn")} caption={t("common:nav.account")} Icon={User} to={auth.isLoggedIn ? "/account" : "/login"} />
            </span>
            <span className="hidden sm:block">
              <IconAction label={t("tpl_single:header.wishlistLabel", { count: wishlistCount })} caption={t("common:nav.wishlist")} Icon={Heart} count={wishlistCount} to="/wishlist" />
            </span>
            <IconAction label={t("tpl_single:header.cartLabel", { count: cart.count, total: cart.formatted })} caption={t("common:nav.cart")} Icon={ShoppingCart} count={cart.count} onClick={cart.open} />
          </div>
        </div>

        {/* Phone search */}
        {showPhoneSearch && (
          <div className={cn("container pb-3 md:hidden", SEARCH_SKIN)}>
            <SearchAutocomplete placeholder={t("tpl_single:header.searchHint")} />
          </div>
        )}
      </div>

      {/* Category row */}
      <nav aria-label={t("tpl_single:header.shopByCategory")} className="hidden border-b border-border bg-card/95 backdrop-blur md:block">
        <div className="container">
          <ul className="no-scrollbar -mx-3 flex items-center gap-0.5 overflow-x-auto px-1 py-1.5">
            <li>
              <Link to="/" aria-current={pathname === "/" ? "page" : undefined} className={cn(NAV_ITEM, pathname === "/" ? "text-primary underline decoration-2 underline-offset-[10px]" : "text-foreground hover:text-primary", FOCUS)}>
                <Home className="h-4 w-4" aria-hidden="true" /> {t("common:nav.home")}
              </Link>
            </li>
            {navLinks.map((l) => {
              const Icon = categoryIcon(l.label);
              const active = here === l.to;
              return (
                <li key={`${l.to}-${l.label}`}>
                  <Link to={l.to} aria-current={active ? "page" : undefined} className={cn(NAV_ITEM, active ? "text-primary underline decoration-2 underline-offset-[10px]" : "text-foreground hover:text-primary", FOCUS)}>
                    <Icon className="h-4 w-4" aria-hidden="true" /> {navLabel(t, l)}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link to="/categories" className={cn(NAV_ITEM, "text-foreground hover:text-primary", FOCUS)}>
                <LayoutGrid className="h-4 w-4" aria-hidden="true" /> {t("tpl_single:header.more")}
              </Link>
            </li>
            <li className="ml-auto pl-2">
              <Link to="/deals" className={cn(NAV_ITEM, "bg-tile-2 text-[hsl(28_85%_32%)] hover:bg-tile-2/80 dark:bg-tile-2/15 dark:text-[hsl(40_92%_66%)]", FOCUS)}>
                <Star className="h-4 w-4 fill-current" aria-hidden="true" /> {t("common:nav.deals")}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}
