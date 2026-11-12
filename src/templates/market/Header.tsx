import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Flame, Heart, LayoutGrid, LogOut, Menu, Moon, Package, ShoppingCart, Sun, Truck, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreClosureBanner } from "@/components/StoreHours";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isTabRoot } from "@/lib/mobileNav";
import { useStoreChrome, type NavLink } from "@/templates/shared/useStoreChrome";
import { useTemplateBlock } from "@/templates/shared/useTemplateContent";
import { CategoryThumb, CountBadge } from "./parts";
import { FOCUS, WRAP, categoryLink, navLabel } from "./lib";

/** Phone category chips only on browse screens; inner screens keep the header short. */
const CHIP_PATHS = ["/", "/shop", "/categories", "/deals", "/collections"];

type Chrome = ReturnType<typeof useStoreChrome>;

function Brand({ logo, storeName, className }: { logo: string | null; storeName: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <Link to="/" aria-label={t("tpl_market:nav.storeHome", { store: storeName })} className={cn("flex min-w-0 items-center rounded-md", FOCUS, className)}>
      {logo ? (
        <img src={logo} alt="" className="h-8 w-auto max-w-[120px] object-contain md:h-10 md:max-w-[170px]" />
      ) : (
        <span className="truncate font-display text-xl font-extrabold tracking-tight text-foreground md:text-[22px]">{storeName}</span>
      )}
    </Link>
  );
}

/** Blue strip: owner's announcement (+ code), free-shipping note, Track order / Help and the dark-mode switch. */
function AnnouncementBar({ chrome }: { chrome: Chrome }) {
  const { t } = useTranslation();
  // Shown until the owner saves Template content > Announcement
  const fallback = useMemo(() => ({ text: t("tpl_market:header.announcement"), code: "", link: "/deals" }), [t]);
  const { block } = useTemplateBlock("announcement", fallback);
  const { darkMode, freeShippingThreshold, formatCurrency } = chrome;
  const text = block?.text.trim();
  const link = block?.link || "";
  const message = text && (
    <>
      <Flame className="hidden h-3.5 w-3.5 shrink-0 text-highlight-soft sm:block" aria-hidden="true" />
      <span className="truncate font-semibold">{text}</span>
      {block?.code && (
        <span className="shrink-0 rounded-sm border border-dashed border-primary-foreground/60 px-1.5 py-px font-mono text-[11px] font-bold tracking-wide">{block.code}</span>
      )}
    </>
  );
  const UTIL = cn("hidden shrink-0 items-center gap-1.5 rounded-sm text-primary-foreground/90 hover:text-primary-foreground md:flex", FOCUS);

  return (
    <div className="bg-primary text-primary-foreground">
      <div className={cn(WRAP, "flex h-9 items-center justify-between gap-4 text-xs")}>
        <div className="flex min-w-0 items-center gap-2">
          {message && (link ? (
            /^https?:\/\//i.test(link) ? (
              <a href={link} className={cn("flex min-w-0 items-center gap-2 rounded-sm hover:underline", FOCUS)}>{message}</a>
            ) : (
              <Link to={link} className={cn("flex min-w-0 items-center gap-2 rounded-sm hover:underline", FOCUS)}>{message}</Link>
            )
          ) : (
            <p className="flex min-w-0 items-center gap-2">{message}</p>
          ))}
          {freeShippingThreshold != null && (
            <span className="hidden shrink-0 items-center gap-1.5 border-l border-primary-foreground/30 pl-3 text-primary-foreground/90 lg:flex">
              <Truck className="h-3.5 w-3.5" aria-hidden="true" /> {t("common:money.freeShippingOver", { amount: formatCurrency(freeShippingThreshold) })}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <Link to="/track-order" className={UTIL}>
            <Package className="h-3.5 w-3.5" aria-hidden="true" /> {t("common:nav.trackOrder")}
          </Link>
          <Link to="/support" className={UTIL}>
            <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" /> {t("tpl_market:header.helpCenter")}
          </Link>
          <LanguageSwitcher
            className={cn("hidden h-7 min-w-7 gap-1 rounded-md px-1.5 text-primary-foreground hover:bg-primary-foreground/15 md:inline-flex [&_svg]:h-4 [&_svg]:w-4", FOCUS)}
          />
          <button
            type="button"
            onClick={darkMode.toggle}
            aria-label={darkMode.isDark ? t("tpl_market:nav.switchToLight") : t("tpl_market:nav.switchToDark")}
            className={cn("flex size-7 items-center justify-center rounded-md hover:bg-primary-foreground/15", FOCUS)}
          >
            {darkMode.isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small two-line label beside a header icon ("Account / Sign in"). */
function IconLabel({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span className="hidden min-w-0 flex-col text-left leading-tight xl:flex">
      <span className="text-[11px] text-muted-foreground">{top}</span>
      <span className="max-w-[110px] truncate text-[13px] font-semibold text-foreground">{bottom}</span>
    </span>
  );
}

const ACTION = cn("flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1 text-foreground transition-colors hover:text-primary", FOCUS);

function AccountAction({ chrome }: { chrome: Chrome }) {
  const { t } = useTranslation();
  const { auth } = chrome;
  const icon = (
    <span className="flex size-9 items-center justify-center rounded-full border border-border">
      <User className="h-[18px] w-[18px]" aria-hidden="true" />
    </span>
  );
  if (!auth.isLoggedIn) {
    return (
      <Link to="/login" aria-label={t("tpl_market:header.signInToAccount")} className={ACTION}>
        {icon}
        <IconLabel top={t("common:nav.account")} bottom={t("common:nav.signIn")} />
      </Link>
    );
  }
  const first = auth.user?.name?.split(" ")[0] || t("common:nav.myAccount");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={ACTION} aria-label={t("tpl_market:header.accountMenu")}>
        {icon}
        <IconLabel top={t("tpl_market:header.hello")} bottom={first} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{auth.user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/account"><User className="mr-2 h-4 w-4" aria-hidden="true" /> {t("common:nav.myAccount")}</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/account/orders"><Package className="mr-2 h-4 w-4" aria-hidden="true" /> {t("tpl_market:header.myOrders")}</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/track-order"><Truck className="mr-2 h-4 w-4" aria-hidden="true" /> {t("common:nav.trackOrder")}</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={auth.logout}><LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> {t("common:nav.signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CategoriesMenu({ chrome }: { chrome: Chrome }) {
  const { t } = useTranslation();
  if (chrome.categories.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("hidden h-11 shrink-0 items-center gap-2 rounded-pill border border-input bg-card px-3 text-[13px] font-medium text-foreground hover:border-primary/50 lg:flex", FOCUS)}
      >
        <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" /> {t("common:nav.allCategories")} <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[60vh] w-60 overflow-y-auto">
        {chrome.categories.map((c, i) => (
          <DropdownMenuItem key={c.id} asChild>
            <Link to={categoryLink(c)} className="gap-2.5">
              <CategoryThumb category={c} index={i} className="size-7 rounded-md" letterClassName="text-xs" />
              <span className="truncate">{c.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/categories" className="font-semibold text-primary">{t("tpl_market:header.browseAllCategories")}</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Desktop row of department links, Deals in red, then Support and header pages. */
function useNavLinks(chrome: Chrome) {
  const { t } = useTranslation();
  const pages = chrome.utilityLinks.filter((l) => l.to !== "/contact");
  const seen = new Set<string>();
  const links: (NavLink & { deal?: boolean })[] = [
    { label: t("common:nav.home"), to: "/" },
    ...chrome.shopNav,
    { label: t("tpl_market:nav.shopAll"), to: "/shop" },
    ...(chrome.collections.length > 0 ? [{ label: t("common:nav.collections"), to: "/collections" }] : []),
    { label: t("common:nav.deals"), to: "/deals", deal: true },
    ...pages.map((l) => ({ ...l, label: navLabel(t, l) })),
    { label: t("common:nav.support"), to: "/support" },
  ];
  return links.filter((l) => (seen.has(l.to) ? false : (seen.add(l.to), true)));
}

function PhoneMenu({ chrome, open, onOpenChange, links }: { chrome: Chrome; open: boolean; onOpenChange: (v: boolean) => void; links: ReturnType<typeof useNavLinks> }) {
  const { t } = useTranslation();
  const close = () => onOpenChange(false);
  const ROW = cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent", FOCUS, "focus-visible:ring-offset-0");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-[86%] max-w-sm flex-col gap-0 overflow-y-auto bg-card p-0">
        <div className="border-b border-border px-4 py-4 pr-12">
          <SheetTitle className="truncate font-display text-lg font-extrabold">{chrome.storeName}</SheetTitle>
          <SheetDescription className="text-xs">{t("tpl_market:header.menuDescription")}</SheetDescription>
        </div>

        <nav aria-label={t("common:nav.menu")} className="flex-1 px-2 py-3">
          {chrome.categories.length > 0 && (
            <>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("common:nav.categories")}</p>
              <ul className="mb-3">
                {chrome.categories.map((c, i) => (
                  <li key={c.id}>
                    <Link to={categoryLink(c)} onClick={close} className={ROW}>
                      <CategoryThumb category={c} index={i} className="size-8 rounded-md" letterClassName="text-xs" />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("common:nav.shop")}</p>
          <ul className="mb-3">
            {links.filter((l) => !chrome.shopNav.some((s) => s.to === l.to)).map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={close} className={cn(ROW, l.deal && "font-semibold text-destructive")}>
                  {l.deal && <Flame className="h-4 w-4" aria-hidden="true" />} {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("common:nav.account")}</p>
          <ul>
            <li><Link to={chrome.auth.isLoggedIn ? "/account" : "/login"} onClick={close} className={ROW}><User className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> {chrome.auth.isLoggedIn ? t("common:nav.myAccount") : t("common:nav.signIn")}</Link></li>
            <li><Link to="/wishlist" onClick={close} className={ROW}><Heart className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> {t("common:nav.wishlist")}{chrome.wishlistCount > 0 && ` (${chrome.wishlistCount})`}</Link></li>
            <li><Link to="/track-order" onClick={close} className={ROW}><Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> {t("common:nav.trackOrder")}</Link></li>
            <li>
              <button type="button" onClick={chrome.darkMode.toggle} className={cn(ROW, "w-full")}>
                {chrome.darkMode.isDark ? <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                {chrome.darkMode.isDark ? t("common:theme.light") : t("common:theme.dark")}
              </button>
            </li>
            <li>
              <LanguageSwitcher
                variant="full"
                align="start"
                className={cn(ROW, "h-auto w-full justify-start rounded-lg [&_svg]:text-muted-foreground")}
                contentClassName="z-[60]"
              />
            </li>
            {chrome.auth.isLoggedIn && (
              <li><button type="button" onClick={() => { chrome.auth.logout(); close(); }} className={cn(ROW, "w-full")}><LogOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> {t("common:nav.signOut")}</button></li>
            )}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const chrome = useStoreChrome();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { storeName, logo, cart, wishlistCount } = chrome;
  const links = useNavLinks(chrome);
  const showChips = CHIP_PATHS.includes(pathname.replace(/\/+$/, "") || "/");
  const tabRoot = isTabRoot(pathname);
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"));
  const here = pathname + search;

  useEffect(() => setMenuOpen(false), [pathname, search]);

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />
      <AnnouncementBar chrome={chrome} />

      {/* Main row */}
      <div className="border-b border-border bg-card">
        <div className={cn(WRAP, "flex h-14 items-center gap-2 md:h-[72px] md:gap-4 xl:gap-6")}>
          {!tabRoot && (
            <button type="button" onClick={goBack} aria-label={t("common:actions.back")} className={cn("-ml-2 flex size-9 shrink-0 items-center justify-center rounded-md text-foreground md:hidden", FOCUS)}>
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("common:nav.openMenu")}
            aria-expanded={menuOpen}
            className={cn("flex size-9 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-accent lg:hidden", !tabRoot && "max-md:hidden", tabRoot && "-ml-2", FOCUS)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Brand logo={logo} storeName={storeName} className="mr-auto md:mr-0 md:shrink-0" />

          <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex xl:mx-4">
            <CategoriesMenu chrome={chrome} />
            <div className="min-w-0 flex-1">
              <SearchAutocomplete placeholder={t("tpl_market:header.searchHint")} submitLabel={t("common:search.submit")} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 md:gap-2 xl:gap-3">
            <div className="hidden md:block"><AccountAction chrome={chrome} /></div>
            <Link to="/wishlist" aria-label={t("tpl_market:header.wishlistLabel", { count: wishlistCount })} className={cn(ACTION, "hidden md:flex")}>
              <span className="relative flex size-9 items-center justify-center rounded-full border border-border">
                <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
                <CountBadge count={wishlistCount} />
              </span>
              <IconLabel top={t("tpl_market:header.saved")} bottom={t("common:nav.wishlist")} />
            </Link>
            <button type="button" onClick={cart.open} aria-label={t("tpl_market:header.cartLabel", { count: cart.count, total: cart.formatted })} className={ACTION}>
              <span className="relative flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground md:size-10">
                <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
                <CountBadge count={cart.count} />
              </span>
              <span className="hidden flex-col text-left leading-tight lg:flex">
                <span className="text-[11px] text-muted-foreground">{t("common:nav.cart")}</span>
                <span className="text-[13px] font-bold tabular-nums text-foreground">{cart.formatted}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Phone search: always visible */}
        <div className={cn(WRAP, "pb-2.5 md:hidden")}>
          <SearchAutocomplete placeholder={t("tpl_market:header.searchHint")} />
        </div>

        {/* Desktop department row (phones and tablets use the menu) */}
        <nav aria-label={t("tpl_market:header.departments")} className="hidden border-t border-border lg:block">
          <ul className={cn(WRAP, "no-scrollbar flex h-11 items-center gap-6 overflow-x-auto")}>
            {links.map((l) => {
              const active = l.to === "/" ? pathname === "/" : here === l.to || (l.to !== "/shop" && here.startsWith(l.to));
              return (
                <li key={l.to} className="shrink-0">
                  <Link
                    to={l.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-11 items-center gap-1.5 rounded-sm text-[13px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                      l.deal ? "font-semibold text-destructive hover:text-destructive/80" : active ? "text-primary after:bg-primary" : "text-foreground hover:text-primary",
                      FOCUS,
                    )}
                  >
                    {l.deal && <Flame className="h-3.5 w-3.5" aria-hidden="true" />}
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Category chips (phone) */}
      {showChips && chrome.categories.length > 0 && (
        <nav aria-label={t("common:nav.categories")} className="border-b border-border bg-card md:hidden">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
            {chrome.categories.map((c, i) => (
              <li key={c.id} className="shrink-0">
                <Link to={categoryLink(c)} className={cn("flex h-8 items-center gap-1.5 rounded-pill border border-border bg-background pl-1 pr-3 text-xs font-medium text-foreground", FOCUS)}>
                  <CategoryThumb category={c} index={i} className="size-6 rounded-md" letterClassName="text-[10px]" />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <PhoneMenu chrome={chrome} open={menuOpen} onOpenChange={setMenuOpen} links={links} />
    </header>
  );
}
