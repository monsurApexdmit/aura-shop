import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, Moon, Phone, ShoppingBag, Store, Sun, User } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { StoreClosureBanner } from "@/components/StoreHours";
import { cn } from "@/lib/utils";
import { useStoreChrome } from "../shared/useStoreChrome";
import Logo from "./Logo";
import { LANDING_SECTIONS, anchorClick } from "./scroll";

const ICON_BTN =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const ORDER_PILL =
  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-pill bg-highlight px-4 font-display text-xs font-bold text-highlight-foreground shadow-md shadow-highlight/20 transition hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-11 sm:px-5 sm:text-sm";

/** Slim landing-page header: logo, section anchors, cart and a loud "Order now". */
export default function Header() {
  const chrome = useStoreChrome();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const phone = chrome.contact.phone?.trim();
  const { isDark, toggle } = chrome.darkMode;

  return (
    <header className="sticky top-0 z-50">
      <StoreClosureBanner />
      <div className="border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center gap-2 md:h-[72px] md:gap-4">
          <Logo logo={chrome.logo} storeName={chrome.storeName} className="mr-auto md:mr-0" imgClassName="h-8 max-w-[120px] sm:h-10" />

          {/* Section anchors */}
          <nav aria-label="Page sections" className="mx-auto hidden items-center gap-1 rounded-pill bg-secondary p-1 md:flex">
            {LANDING_SECTIONS.map((s) => (
              <Link
                key={s.id}
                to={`/#${s.id}`}
                onClick={anchorClick(s.id)}
                className="rounded-pill px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:px-5"
              >
                {s.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="mr-1 hidden h-10 items-center gap-2 rounded-pill px-3 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
                aria-label={`Call ${phone}`}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-highlight/10 text-highlight"><Phone className="size-3.5" aria-hidden="true" /></span>
                <span className="tabular-nums">{phone}</span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className={cn(ICON_BTN, "hidden md:inline-flex lg:hidden")} aria-label={`Call ${phone}`}>
                <Phone className="size-[18px]" />
              </a>
            )}
            <button type="button" onClick={toggle} className={cn(ICON_BTN, "hidden md:inline-flex")} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
            <Link to={chrome.auth.isLoggedIn ? "/account" : "/login"} className={cn(ICON_BTN, "hidden md:inline-flex")} aria-label={chrome.auth.isLoggedIn ? "My account" : "Log in"}>
              <User className="size-[18px]" />
            </Link>
            <button type="button" onClick={chrome.cart.open} className={ICON_BTN} aria-label={`Cart, ${chrome.cart.count} item${chrome.cart.count === 1 ? "" : "s"}`}>
              <ShoppingBag className="size-5" />
              {chrome.cart.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground">
                  {chrome.cart.count > 99 ? "99+" : chrome.cart.count}
                </span>
              )}
            </button>
            <Link to="/#order" onClick={anchorClick("order")} className={cn(ORDER_PILL, "ml-1")}>
              Order now
              <ArrowRight className="hidden size-4 sm:block" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(ICON_BTN, "-mr-2 md:hidden")}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="flex w-[86vw] max-w-sm flex-col gap-0 overflow-y-auto bg-background p-0" aria-describedby={undefined}>
          <div className="border-b border-border px-5 py-4 pr-12">
            <SheetTitle className="truncate font-display text-lg font-extrabold">{chrome.storeName || "Menu"}</SheetTitle>
          </div>
          <nav aria-label="Menu" className="flex flex-1 flex-col gap-6 px-5 py-5">
            <ul className="grid grid-cols-2 gap-2">
              {LANDING_SECTIONS.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/#${s.id}`}
                    onClick={anchorClick(s.id, () => setMenuOpen(false))}
                    className={cn(
                      "flex h-14 items-center rounded-2xl px-4 font-display text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      s.id === "order" ? "bg-highlight text-highlight-foreground" : "bg-secondary text-foreground hover:bg-accent",
                    )}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="space-y-1">
              <MenuLink to="/shop" icon={Store} label="Shop all products" active={pathname === "/shop"} onClick={() => setMenuOpen(false)} />
              <MenuLink
                to={chrome.auth.isLoggedIn ? "/account" : "/login"}
                icon={User}
                label={chrome.auth.isLoggedIn ? "My account" : "Log in / Sign up"}
                onClick={() => setMenuOpen(false)}
              />
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Phone className="size-[18px] text-muted-foreground" aria-hidden="true" />
                    Call {phone}
                  </a>
                </li>
              )}
              <li>
                <button type="button" onClick={toggle} className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {isDark ? <Sun className="size-[18px] text-muted-foreground" aria-hidden="true" /> : <Moon className="size-[18px] text-muted-foreground" aria-hidden="true" />}
                  {isDark ? "Light mode" : "Dark mode"}
                </button>
              </li>
            </ul>

            {chrome.utilityLinks.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                {[...chrome.utilityLinks, { label: "Track order", to: "/track-order" }].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} onClick={() => setMenuOpen(false)} className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{l.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function MenuLink({ to, icon: Icon, label, active, onClick }: { to: string; icon: typeof Store; label: string; active?: boolean; onClick: () => void }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon className="size-[18px] text-muted-foreground" aria-hidden="true" />
        {label}
      </Link>
    </li>
  );
}
