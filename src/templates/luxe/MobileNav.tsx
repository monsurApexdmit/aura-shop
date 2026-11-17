import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Heart, Home, ShoppingBag, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { hidesTabBar } from "@/lib/mobileNav";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { CountBadge } from "./parts";

const ITEM = "relative flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium outline-none transition-colors focus-visible:bg-secondary";

function Glyph({ Icon, active, badge }: { Icon: LucideIcon; active: boolean; badge?: number }) {
  return (
    <span className="relative">
      <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.3 : 1.8} aria-hidden="true" />
      {badge !== undefined && <CountBadge count={badge} />}
      {active && <span className="absolute -bottom-2 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-highlight" aria-hidden="true" />}
    </span>
  );
}

/** Phone tab bar: Home, Properties, Saved, Cart, Account. */
export default function MobileNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { cart, auth, wishlistCount } = useStoreChrome();
  if (hidesTabBar(pathname)) return null;

  const links: { label: string; to: string; Icon: LucideIcon; active: boolean; badge?: number }[] = [
    { label: t("common:nav.home"), to: "/", Icon: Home, active: pathname === "/" },
    { label: t("tpl_luxe:nav.properties"), to: "/shop", Icon: Building2, active: ["/shop", "/categories", "/collections", "/deals"].some((p) => pathname.startsWith(p)) },
    { label: t("tpl_luxe:nav.saved"), to: "/wishlist", Icon: Heart, active: pathname.startsWith("/wishlist"), badge: wishlistCount },
  ];
  const account = { to: auth.isLoggedIn ? "/account" : "/login", active: ["/account", "/login", "/signup"].some((p) => pathname.startsWith(p)) };

  return (
    <nav aria-label={t("tpl_luxe:nav.app")} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-5">
        {links.map(({ label, to, Icon, active, badge }) => (
          <Link key={to} to={to} aria-current={active ? "page" : undefined} className={cn(ITEM, active ? "text-primary" : "text-muted-foreground")}>
            <Glyph Icon={Icon} active={active} badge={badge} />
            {label}
          </Link>
        ))}
        <button type="button" onClick={cart.open} aria-label={t("tpl_luxe:mobileNav.cartAria", { count: cart.count })} className={cn(ITEM, "text-muted-foreground")}>
          <Glyph Icon={ShoppingBag} active={false} badge={cart.count} />
          {t("common:nav.cart")}
        </button>
        <Link to={account.to} aria-current={account.active ? "page" : undefined} className={cn(ITEM, account.active ? "text-primary" : "text-muted-foreground")}>
          <Glyph Icon={User} active={account.active} />
          {t("common:nav.account")}
        </Link>
      </div>
    </nav>
  );
}
