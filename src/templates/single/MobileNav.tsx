import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Home, LayoutGrid, ShoppingCart, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { hidesTabBar } from "@/lib/mobileNav";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { CountBadge } from "./parts";

const ITEM = "relative flex h-full flex-col items-center justify-center gap-1 text-[10px] font-bold outline-none transition-colors focus-visible:bg-accent active:scale-95 motion-reduce:active:scale-100";

function Glyph({ Icon, active, badge }: { Icon: LucideIcon; active: boolean; badge?: number }) {
  return (
    <span className={cn("relative flex h-7 w-12 items-center justify-center rounded-pill transition-colors", active && "bg-accent")}>
      <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
      {badge !== undefined && <CountBadge count={badge} className="right-1.5 -top-1" />}
    </span>
  );
}

/** Phone bottom bar: white strip, five slots, a soft purple pill behind the current one. */
export default function MobileNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { cart, auth, wishlistCount } = useStoreChrome();
  if (hidesTabBar(pathname)) return null;

  const account = auth.isLoggedIn ? "/account" : "/login";
  const accountActive = ["/account", "/login", "/signup"].some((p) => pathname.startsWith(p));
  const links: { label: string; to: string; Icon: LucideIcon; active: boolean; badge?: number }[] = [
    { label: t("common:nav.home"), to: "/", Icon: Home, active: pathname === "/" },
    { label: t("common:nav.categories"), to: "/categories", Icon: LayoutGrid, active: ["/categories", "/shop", "/collections", "/deals"].some((p) => pathname.startsWith(p)) },
    { label: t("common:nav.wishlist"), to: "/wishlist", Icon: Heart, active: pathname.startsWith("/wishlist"), badge: wishlistCount },
  ];

  return (
    <nav aria-label={t("tpl_single:mobileNav.label")} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-12px_hsl(var(--primary)/0.35)] md:hidden">
      <div className="grid h-16 grid-cols-5">
        {links.map(({ label, to, Icon, active, badge }) => (
          <Link key={to} to={to} aria-current={active ? "page" : undefined} aria-label={badge ? t("tpl_single:header.wishlistLabel", { count: badge }) : undefined} className={cn(ITEM, active ? "text-primary" : "text-muted-foreground")}>
            <Glyph Icon={Icon} active={active} badge={badge} />
            {label}
          </Link>
        ))}
        <button type="button" onClick={cart.open} aria-label={t("tpl_single:mobileNav.cartLabel", { count: cart.count })} className={cn(ITEM, "text-muted-foreground")}>
          <Glyph Icon={ShoppingCart} active={false} badge={cart.count} />
          {t("common:nav.cart")}
        </button>
        <Link to={account} aria-current={accountActive ? "page" : undefined} className={cn(ITEM, accountActive ? "text-primary" : "text-muted-foreground")}>
          <Glyph Icon={User} active={accountActive} />
          {t("common:nav.account")}
        </Link>
      </div>
    </nav>
  );
}
