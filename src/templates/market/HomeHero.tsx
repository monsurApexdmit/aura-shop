import { useState } from "react";
import { Link } from "react-router-dom";
import { Banknote, ChevronRight, LayoutGrid, Package, Ticket, Truck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { useActiveCoupons } from "@/templates/shared/useHomeContent";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import HeroSlider from "./HeroSlider";
import { CategoryThumb } from "./parts";
import { FOCUS, categoryLink, couponCondition, couponOffer, subCategoryLink } from "./lib";

const MAX_SIDEBAR = 11;

/** Left rail: top-level categories; hovering or focusing one opens its children beside the rail. */
function CategoryRail() {
  const { data: categories = [], isLoading } = useCategories();
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = categories.slice(0, MAX_SIDEBAR);
  const active = shown.find((c) => c.id === hovered && c.children.length > 0);

  return (
    <nav
      aria-label="Shop by category"
      className="relative hidden rounded-lg border border-border bg-card lg:block"
      onMouseLeave={() => setHovered(null)}
      onKeyDown={(e) => { if (e.key === "Escape") setHovered(null); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(null); }}
    >
      <p className="flex items-center gap-2 border-b border-border px-3 py-2.5 font-display text-sm font-bold text-foreground">
        <LayoutGrid className="h-4 w-4 text-highlight" aria-hidden="true" /> Categories
      </p>
      {isLoading ? (
        <div className="space-y-2 p-3">{Array.from({ length: 9 }, (_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
      ) : (
        <ul className="py-1">
          {shown.map((cat, i) => (
            <li key={cat.id}>
              <Link
                to={categoryLink(cat)}
                onMouseEnter={() => setHovered(cat.id)}
                onFocus={() => setHovered(cat.id)}
                aria-haspopup={cat.children.length > 0 ? "true" : undefined}
                aria-expanded={cat.children.length > 0 ? hovered === cat.id : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-[7px] text-[13px] outline-none transition-colors focus-visible:bg-secondary",
                  hovered === cat.id ? "bg-secondary font-semibold text-highlight" : "text-foreground hover:bg-secondary",
                )}
              >
                <CategoryThumb category={cat} index={i} className="size-6 rounded" letterClassName="text-[11px]" />
                <span className="min-w-0 flex-1 truncate">{cat.name}</span>
                {cat.children.length > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/categories" className={cn("flex items-center gap-2.5 px-3 py-[7px] text-[13px] font-semibold text-highlight hover:underline", FOCUS)}>
              All categories →
            </Link>
          </li>
        </ul>
      )}

      {active && (
        <div className="absolute left-full top-0 z-30 ml-1 h-full w-[min(560px,55vw)] overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-xl">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
            <p className="truncate font-display text-base font-bold text-foreground">{active.name}</p>
            <Link to={categoryLink(active)} className={cn("shrink-0 rounded-sm text-sm font-semibold text-highlight hover:underline", FOCUS)}>See all →</Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {active.children.map((sub) => (
              <li key={sub.id}>
                <Link to={subCategoryLink(active, sub)} className={cn("block truncate rounded-sm py-1.5 text-sm text-muted-foreground hover:text-highlight", FOCUS)}>{sub.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

interface PromoTile { key: string; title: string; text: string; to: string; Icon: typeof Truck; code?: string }

/** Right rail: a welcome card and two promo tiles (live coupons first). */
function WelcomeRail() {
  const { storeName, auth, formatCurrency } = useStoreChrome();
  const coupons = useActiveCoupons();
  const fromCoupons: PromoTile[] = coupons.slice(0, 2).map((c) => ({
    key: c.code,
    title: couponOffer(c, formatCurrency),
    text: couponCondition(c, formatCurrency),
    to: "/shop",
    Icon: Ticket,
    code: c.code,
  }));
  const fallback: PromoTile[] = [
    { key: "track", title: "Track your order", text: "See where your parcel is, live.", to: "/track-order", Icon: Truck },
    { key: "cod", title: "Cash on delivery", text: "Pay when your order reaches you.", to: "/shop", Icon: Banknote },
  ];
  const tiles = [...fromCoupons, ...fallback].slice(0, 2);
  const firstName = auth.user?.name?.split(" ")[0];

  return (
    <aside aria-label="Your account and offers" className="hidden flex-col gap-3 lg:flex">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground" aria-hidden="true">
            <User className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{auth.isLoggedIn ? `Hi, ${firstName || "there"}` : "Welcome!"}</p>
            <p className="truncate text-xs text-muted-foreground">{auth.isLoggedIn ? "Good to see you again" : `to ${storeName}`}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {auth.isLoggedIn ? (
            <>
              <Link to="/account/orders" className={cn("flex h-8 items-center justify-center gap-1 rounded-md bg-ink text-xs font-semibold text-ink-foreground hover:bg-ink/90", FOCUS)}>
                <Package className="h-3.5 w-3.5" aria-hidden="true" /> Orders
              </Link>
              <Link to="/account" className={cn("flex h-8 items-center justify-center rounded-md border border-border text-xs font-semibold text-foreground hover:bg-secondary", FOCUS)}>Account</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={cn("flex h-8 items-center justify-center rounded-md bg-ink text-xs font-semibold text-ink-foreground hover:bg-ink/90", FOCUS)}>Sign in</Link>
              <Link to="/signup" className={cn("flex h-8 items-center justify-center rounded-md border border-border text-xs font-semibold text-foreground hover:bg-secondary", FOCUS)}>Join free</Link>
            </>
          )}
        </div>
      </div>

      {tiles.map(({ key, title, text, to, Icon, code }, i) => (
        <Link
          key={key}
          to={to}
          className={cn(
            "relative flex flex-1 flex-col justify-center overflow-hidden rounded-lg p-4 transition-transform hover:-translate-y-0.5",
            i === 0 ? "bg-highlight text-highlight-foreground" : "border border-border bg-card text-foreground",
            FOCUS,
          )}
        >
          <Icon aria-hidden="true" className={cn("absolute -bottom-3 -right-3 h-20 w-20 rotate-[-12deg]", i === 0 ? "text-highlight-foreground/15" : "text-highlight/10")} />
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", i === 0 ? "text-highlight-foreground/80" : "text-highlight")}>{code ? "Voucher" : "Shop with ease"}</span>
          <span className="mt-0.5 font-display text-lg font-extrabold leading-tight">{title}</span>
          <span className={cn("mt-0.5 text-xs", i === 0 ? "text-highlight-foreground/80" : "text-muted-foreground")}>{text}</span>
          {code && (
            <span className={cn("mt-2 w-fit rounded-sm border border-dashed px-2 py-0.5 font-mono text-xs font-bold", i === 0 ? "border-highlight-foreground/60" : "border-highlight text-highlight")}>{code}</span>
          )}
        </Link>
      ))}
    </aside>
  );
}

/** Category rail · hero slider · welcome rail */
export default function HomeHero() {
  return (
    <div className="container pt-3 md:pt-4">
      <div className="grid gap-3 lg:grid-cols-[230px_minmax(0,1fr)_250px]">
        <CategoryRail />
        <div className="min-w-0">
          <HeroSlider />
        </div>
        <WelcomeRail />
      </div>
    </div>
  );
}
