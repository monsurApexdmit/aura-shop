import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Menu, Moon, Phone, Search, ShoppingBag, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreClosureBanner } from "@/components/StoreHours";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useStoreChrome, type NavLink } from "@/templates/shared/useStoreChrome";
import { Brand, CountBadge } from "./parts";
import { BTN_PRIMARY, FOCUS, FOCUS_ON_INK } from "./lib";

/** Home, Properties, two property types, one header page and Contact (the phone menu shows the same). */
function useMainNav(): NavLink[] {
  const { t } = useTranslation();
  const { shopNav, utilityLinks } = useStoreChrome();
  const pages = utilityLinks.filter((l) => l.to !== "/contact").slice(0, 1);
  return [
    { label: t("common:nav.home"), to: "/" },
    { label: t("tpl_luxe:nav.properties"), to: "/shop" },
    ...shopNav.filter((l) => l.to !== "/shop").slice(0, 2),
    ...pages,
    { label: t("common:nav.contact"), to: "/contact" },
  ];
}

function useIsActive() {
  const { pathname, search } = useLocation();
  return (to: string) => {
    if (to === "/") return pathname === "/";
    if (to === "/shop") return pathname === "/shop" && !/[?&](cat|category)=/.test(search);
    return to.includes("?") ? `${pathname}${search}` === to : pathname.startsWith(to);
  };
}

const ICON_BTN = cn("relative flex size-10 shrink-0 items-center justify-center rounded-pill text-foreground transition-colors hover:bg-secondary hover:text-primary", FOCUS);

export default function Header() {
  const { t } = useTranslation();
  const chrome = useStoreChrome();
  const { storeName, logo, contact, cart, auth, darkMode } = chrome;
  const nav = useMainNav();
  const isActive = useIsActive();
  const [menuOpen, setMenuOpen] = useState(false);
  const accountHref = auth.isLoggedIn ? "/account" : "/login";

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />

      {/* Navy contact bar */}
      <div className="bg-ink text-ink-foreground">
        <div className="container flex h-9 items-center justify-between gap-3 text-xs">
          <div className="flex min-w-0 items-center gap-4 text-ink-foreground/85">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className={cn("flex min-w-0 items-center gap-1.5 rounded-sm hover:text-ink-foreground", FOCUS_ON_INK)}>
                <Phone className="h-3.5 w-3.5 shrink-0 text-highlight" aria-hidden="true" />
                <span className="truncate">{contact.phone}</span>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className={cn("hidden min-w-0 items-center gap-1.5 rounded-sm hover:text-ink-foreground sm:flex", FOCUS_ON_INK)}>
                <Mail className="h-3.5 w-3.5 shrink-0 text-highlight" aria-hidden="true" />
                <span className="truncate">{contact.email}</span>
              </a>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link to="/contact" className={cn("flex items-center gap-1.5 rounded-sm text-ink-foreground/85 hover:text-ink-foreground", FOCUS_ON_INK)}>
              <Mail className="h-3.5 w-3.5 sm:hidden" aria-hidden="true" />
              {t("common:footer.contactUs")}
            </Link>
            <span className="h-3.5 w-px bg-ink-foreground/20" aria-hidden="true" />
            <button
              type="button"
              onClick={darkMode.toggle}
              aria-label={darkMode.isDark ? t("tpl_luxe:header.switchToLight") : t("tpl_luxe:header.switchToDark")}
              className={cn("flex size-7 items-center justify-center rounded-full text-ink-foreground/85 hover:bg-ink-foreground/10 hover:text-ink-foreground", FOCUS_ON_INK)}
            >
              {darkMode.isDark ? <Sun className="h-3.5 w-3.5" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="container flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
          <div className="mr-auto min-w-0 lg:mr-0 lg:max-w-[16rem] lg:shrink-0">
            <Brand logo={logo} storeName={storeName} />
          </div>

          <nav aria-label={t("tpl_luxe:nav.main")} className="hidden min-w-0 flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-1">
              {nav.map((l) => {
                const active = isActive(l.to);
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block max-w-[11rem] truncate whitespace-nowrap rounded-pill px-3 py-2 text-sm font-medium transition-colors xl:px-4",
                        active ? "bg-accent text-primary" : "text-foreground/80 hover:text-primary",
                        FOCUS,
                      )}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher className={cn("hidden rounded-pill text-foreground hover:bg-secondary hover:text-primary sm:inline-flex", FOCUS)} />
            <Link to={accountHref} aria-label={auth.isLoggedIn ? t("common:nav.myAccount") : t("common:nav.signIn")} className={cn(ICON_BTN, "hidden sm:flex")}>
              <User className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <button type="button" onClick={cart.open} aria-label={t("tpl_luxe:header.cartAria", { count: cart.count, total: cart.formatted })} className={ICON_BTN}>
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
              <CountBadge count={cart.count} />
            </button>
            <Link to="/shop" className={cn(BTN_PRIMARY, "ml-2 hidden h-10 whitespace-nowrap md:inline-flex lg:hidden xl:inline-flex", FOCUS)}>
              <Search className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:header.browse")}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("common:nav.openMenu")}
              aria-expanded={menuOpen}
              className={cn(ICON_BTN, "-mr-2 lg:hidden")}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="flex w-[86vw] max-w-sm flex-col gap-0 overflow-y-auto bg-card p-0">
          <div className="border-b border-border px-5 py-4 pr-12">
            <SheetTitle className="truncate font-display text-xl font-semibold text-foreground">{storeName}</SheetTitle>
            <SheetDescription className="sr-only">{t("tpl_luxe:header.siteMenu")}</SheetDescription>
          </div>
          <div className="px-5 pt-4">
            <SearchAutocomplete placeholder={t("tpl_luxe:header.searchPlaceholder")} onClose={() => setMenuOpen(false)} />
          </div>
          <nav aria-label={t("common:nav.menu")} className="px-3 py-3">
            <ul className="space-y-0.5">
              {[...nav, { label: auth.isLoggedIn ? t("common:nav.myAccount") : t("common:nav.signIn"), to: accountHref }].map((l) => {
                const active = isActive(l.to);
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn("flex h-11 items-center rounded-pill px-3 text-[15px] font-medium", active ? "bg-accent text-primary" : "text-foreground hover:bg-secondary", FOCUS)}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto space-y-3 border-t border-border p-5">
            <Link to="/shop" onClick={() => setMenuOpen(false)} className={cn(BTN_PRIMARY, "h-11 w-full", FOCUS)}>
              <Search className="h-4 w-4" aria-hidden="true" /> {t("tpl_luxe:header.browse")}
            </Link>
            <LanguageSwitcher
              variant="full"
              align="start"
              className={cn("h-11 w-full justify-start gap-2 rounded-pill border border-border px-4 text-foreground hover:bg-secondary hover:text-primary", FOCUS)}
              contentClassName="z-[60]"
            />
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className={cn("flex items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-primary", FOCUS)}>
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" /> {contact.phone}
              </a>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
