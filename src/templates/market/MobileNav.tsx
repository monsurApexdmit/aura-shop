import { Link, useLocation } from "react-router-dom";
import { Flame, Home, LayoutGrid, ShoppingCart, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { hidesTabBar } from "@/lib/mobileNav";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { CountBadge } from "./parts";

const ITEM = "relative flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium outline-none transition-colors focus-visible:bg-secondary active:scale-95";

function Icon({ Glyph, active, badge }: { Glyph: LucideIcon; active: boolean; badge?: number }) {
  return (
    <span className="relative">
      <Glyph className="h-[22px] w-[22px]" strokeWidth={active ? 2.3 : 1.8} aria-hidden="true" />
      {badge !== undefined && <CountBadge count={badge} />}
    </span>
  );
}

/** Phone bottom bar: flat white strip, five slots, raspberry for the current one. */
export default function MobileNav() {
  const { pathname } = useLocation();
  const { cart, auth } = useStoreChrome();
  if (hidesTabBar(pathname)) return null;

  const links: { label: string; to: string; Glyph: LucideIcon; active: boolean }[] = [
    { label: "Home", to: "/", Glyph: Home, active: pathname === "/" },
    { label: "Categories", to: "/categories", Glyph: LayoutGrid, active: ["/categories", "/shop", "/collections"].some((p) => pathname.startsWith(p)) },
    { label: "Deals", to: "/deals", Glyph: Flame, active: pathname.startsWith("/deals") },
  ];
  const account = { label: "Account", to: auth.isLoggedIn ? "/account" : "/login", active: ["/account", "/login", "/signup"].some((p) => pathname.startsWith(p)) };

  return (
    <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid h-16 grid-cols-5">
        {links.map(({ label, to, Glyph, active }) => (
          <Link key={to} to={to} aria-current={active ? "page" : undefined} className={cn(ITEM, active ? "text-highlight" : "text-muted-foreground")}>
            <Icon Glyph={Glyph} active={active} />
            {label}
          </Link>
        ))}
        <button type="button" onClick={cart.open} aria-label={`Cart, ${cart.count} items`} className={cn(ITEM, "text-muted-foreground")}>
          <Icon Glyph={ShoppingCart} active={false} badge={cart.count} />
          Cart
        </button>
        <Link to={account.to} aria-current={account.active ? "page" : undefined} className={cn(ITEM, account.active ? "text-highlight" : "text-muted-foreground")}>
          <Icon Glyph={User} active={account.active} />
          Account
        </Link>
      </div>
    </nav>
  );
}
