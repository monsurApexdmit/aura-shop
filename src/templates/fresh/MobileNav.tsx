import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Home, LayoutGrid, Percent, ShoppingBasket, User, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { hidesTabBar } from "@/lib/mobileNav";
import { useStoreChrome } from "../shared/useStoreChrome";

interface Tab {
  label: string;
  Icon: LucideIcon;
  to: string;
  match: (pathname: string) => boolean;
}

/** Phone-only: a flat bottom nav (Home, Categories, Deals, Account) plus a floating "View cart" pill above it while the cart has items. */
export default function MobileNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { cart, auth } = useStoreChrome();

  if (hidesTabBar(pathname)) return null;

  const tabs: Tab[] = [
    { label: t("common:nav.home"), Icon: Home, to: "/", match: (p) => p === "/" },
    { label: t("common:nav.categories"), Icon: LayoutGrid, to: "/categories", match: (p) => p.startsWith("/categories") || p.startsWith("/shop") || p.startsWith("/collections") },
    { label: t("common:nav.deals"), Icon: Percent, to: "/deals", match: (p) => p.startsWith("/deals") },
    {
      label: t("common:nav.account"),
      Icon: User,
      to: auth.isLoggedIn ? "/account" : "/login",
      match: (p) => ["/account", "/login", "/signup", "/wishlist"].some((x) => p.startsWith(x)),
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <AnimatePresence>
        {cart.count > 0 && (
          <motion.div
            key="cart-pill"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="px-3 pb-2"
          >
            <button
              type="button"
              onClick={cart.open}
              aria-label={t("tpl_fresh:mobileNav.viewCartLabel", { count: cart.count, total: cart.formatted })}
              className="flex h-14 w-full items-center gap-3 rounded-pill bg-primary pl-2 pr-5 text-primary-foreground shadow-[0_10px_28px_-10px_hsl(var(--primary)/0.8)] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col items-start leading-tight">
                <span className="text-xs font-bold opacity-85">
                  {t("common:product.items", { count: cart.count })}
                </span>
                <span className="truncate font-display text-lg font-extrabold leading-none tabular-nums">{cart.formatted}</span>
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-1 text-sm font-extrabold">
                {t("tpl_fresh:shared.viewCart")}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav aria-label={t("tpl_fresh:mobileNav.app")} className="border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <ul className="grid h-16 grid-cols-4">
          {tabs.map(({ label, Icon, to, match }) => {
            const active = match(pathname);
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("flex h-7 w-12 items-center justify-center rounded-pill transition-colors", active && "bg-primary/15")}>
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
