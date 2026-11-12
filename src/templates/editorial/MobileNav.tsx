import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { hidesTabBar } from "@/lib/mobileNav";

interface Tab {
  label: string;
  icon: LucideIcon;
  to: string;
  /** Path prefixes that light this tab up. */
  match: (pathname: string) => boolean;
  badge?: number;
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const { label, icon: Icon, to, badge } = tab;
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn("relative flex h-full flex-col items-center justify-center gap-1 transition-colors active:scale-90", active ? "text-ink-foreground" : "text-ink-foreground/45")}
    >
      <span className="relative">
        <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
        {!!badge && (
          <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight px-1 text-[9px] font-bold leading-none text-highlight-foreground">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="text-[9px] font-bold uppercase leading-none tracking-[0.14em]">{label}</span>
      <span className={cn("absolute bottom-1.5 h-1 w-1 rounded-full bg-highlight transition-opacity", active ? "opacity-100" : "opacity-0")} aria-hidden="true" />
    </Link>
  );
}

// Phone-only navigation: a floating dark pill with the bag raised in the middle as a crimson button.
export default function MobileTabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { totalItems, setIsOpen } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { isLoggedIn } = useAuth();

  if (hidesTabBar(pathname)) return null;

  const left: Tab[] = [
    { label: t("common:nav.home"), icon: Home, to: "/", match: (p) => p === "/" },
    {
      label: t("tpl_editorial:mobileNav.browse"),
      icon: LayoutGrid,
      to: "/categories",
      match: (p) => ["/categories", "/shop", "/collections", "/deals"].some((x) => p.startsWith(x)),
    },
  ];
  const right: Tab[] = [
    { label: t("tpl_editorial:mobileNav.saved"), icon: Heart, to: "/wishlist", match: (p) => p.startsWith("/wishlist"), badge: totalWishlistItems },
    {
      label: t("tpl_editorial:mobileNav.me"),
      icon: User,
      to: isLoggedIn ? "/account" : "/login",
      match: (p) => ["/account", "/login", "/signup"].some((x) => p.startsWith(x)),
    },
  ];

  return (
    <nav aria-label={t("tpl_editorial:mobileNav.label")} className="fixed inset-x-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:hidden">
      <div className="grid h-16 grid-cols-5 rounded-pill bg-ink px-2 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] ring-1 ring-ink-foreground/10">
        {left.map((tab) => <TabLink key={tab.to} tab={tab} active={tab.match(pathname)} />)}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={t("tpl_editorial:header.bagCount", { count: totalItems })}
            className="relative -mt-5 flex size-[60px] items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-lg ring-[5px] ring-background transition-transform active:scale-90"
          >
            <ShoppingBag className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-foreground px-1 text-[10px] font-extrabold leading-none text-ink">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
        {right.map((tab) => <TabLink key={tab.to} tab={tab} active={tab.match(pathname)} />)}
      </div>
    </nav>
  );
}
