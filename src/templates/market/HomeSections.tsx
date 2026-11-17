import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck, Clock, Gift, Headset, Heart, ImageOff, Package, Phone, RotateCcw, ShieldCheck, Sparkles, Star, Truck, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { HomepagePerkIcon } from "@/services/storefrontSettingsApi";
import { SOURCE_LINK, useHomeProducts, useProductList } from "@/templates/shared/useHomeContent";
import { useProductCard } from "@/templates/shared/useProductCard";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { LATEST_LIMIT } from "./HeroSlider";
import { CardSkeletons, CategoryThumb, PRODUCT_GRID, SectionHeader, Stars } from "./parts";
import { FOCUS, PANEL, WRAP, categoryLink } from "./lib";

/** Shared by the Featured tabs and the Best Sellers list so they read one cached request each. */
const DEAL_LIMIT = 10;

/* ------------------------------------------------------------------ Perks */

const PERK_ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift,
  star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};

/** Service strip under the hero: admin perks (up to 4), else five built-in ones. */
export function Perks() {
  const { t } = useTranslation();
  const { data: sections, isLoading } = useHomepageSections();
  const { formatCurrency, freeShippingThreshold } = useCurrency();
  const custom = sections?.perks;
  if (isLoading) return <div className={WRAP}><Skeleton className="h-[74px] w-full rounded-xl" /></div>;
  if (custom && (!custom.enabled || custom.items.length === 0)) return null;

  const perks: { Icon: LucideIcon; title: string; text: string; to?: string }[] = custom
    ? custom.items.slice(0, 4).map((p) => ({ Icon: PERK_ICONS[p.icon] ?? Sparkles, title: p.title, text: p.text, to: p.link ?? undefined }))
    : [
        freeShippingThreshold != null
          ? { Icon: Truck, title: t("tpl_market:perks.freeShipping"), text: t("tpl_market:perks.ordersOver", { amount: formatCurrency(freeShippingThreshold) }) }
          : { Icon: Truck, title: t("tpl_market:perks.homeDelivery"), text: t("tpl_market:perks.deliveryOptions"), to: "/shipping" },
        { Icon: ShieldCheck, title: t("tpl_market:perks.securePayments"), text: t("tpl_market:perks.protectedCheckout") },
        { Icon: RotateCcw, title: t("tpl_market:perks.returns"), text: t("tpl_market:perks.returnPolicy"), to: "/returns" },
        { Icon: Clock, title: t("tpl_market:perks.orderTracking"), text: t("tpl_market:perks.trackOnline"), to: "/track-order" },
        { Icon: Headset, title: t("tpl_market:perks.support"), text: t("tpl_market:perks.supportText") },
      ];

  return (
    <section aria-label={t("tpl_market:perks.label")} className={WRAP}>
      <ul
        className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:gap-0 lg:divide-x lg:divide-border lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:bg-card lg:px-0"
        style={{ gridTemplateColumns: `repeat(${perks.length}, minmax(0, 1fr))` }}
      >
        {perks.map(({ Icon, title, text, to }) => {
          const body = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold text-foreground">{title}</span>
                {text && <span className="block truncate text-xs text-muted-foreground">{text}</span>}
              </span>
            </>
          );
          const cls = "flex h-full items-center gap-3 px-4 py-3.5 lg:px-5 lg:py-4";
          return (
            <li key={title} className="min-w-[210px] shrink-0 snap-start rounded-xl border border-border bg-card lg:min-w-0 lg:rounded-none lg:border-0 lg:bg-transparent">
              {to ? <Link to={to} className={cn(cls, "rounded-xl hover:bg-accent/60", FOCUS)}>{body}</Link> : <div className={cls}>{body}</div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Shop by category */

/** Up to eight category cards with their photo. */
export function ShopByCategory() {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories();
  if (!isLoading && categories.length === 0) return null;

  return (
    <section aria-labelledby="ts-cats" className={WRAP}>
      <SectionHeader id="ts-cats" title={t("tpl_market:home.shopByCategory")} to="/categories" linkLabel={t("tpl_market:home.viewAllCategories")} />
      <ul className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => <li key={i}><Skeleton className="aspect-[4/5] rounded-xl" /></li>)
          : categories.slice(0, 8).map((cat, i) => (
              <li key={cat.id}>
                <Link
                  to={categoryLink(cat)}
                  className={cn("group flex h-full flex-col rounded-xl border border-border bg-card p-1.5 text-center transition-[box-shadow,border-color] hover:border-primary/40 hover:card-shadow-hover sm:p-2", FOCUS)}
                >
                  <CategoryThumb category={cat} index={i} className="aspect-square w-full rounded-lg" letterClassName="text-2xl sm:text-3xl" />
                  <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-tight text-foreground group-hover:text-primary sm:text-[13px]">{cat.name}</span>
                  <span className="mb-0.5 mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
                    {cat.children?.length ? t("tpl_market:home.types", { count: cat.children.length }) : t("common:actions.shopNow")}
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Featured products (tabs) */

type TabKey = "top" | "best" | "sale";

/** Featured Products with three tabs: the admin's product block, best sellers and on sale. */
export function FeaturedProducts() {
  const { t } = useTranslation();
  const baseId = useId();
  const home = useHomeProducts();
  const best = useProductList("best_seller", { limit: DEAL_LIMIT });
  const sale = useProductList("on_sale", { limit: DEAL_LIMIT });
  const [active, setActive] = useState<TabKey>("top");
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});

  const all: { key: TabKey; label: string; products: Product[]; isLoading: boolean; link: string; show: boolean }[] = [
    { key: "top", label: home.title || t("tpl_market:home.topPicks"), products: home.products, isLoading: home.isLoading, link: SOURCE_LINK[home.source] ?? "/shop", show: home.enabled },
    { key: "best", label: t("tpl_market:home.bestRated"), products: best.products, isLoading: best.isLoading, link: SOURCE_LINK.best_seller, show: true },
    { key: "sale", label: t("tpl_market:home.onSale"), products: sale.products, isLoading: sale.isLoading, link: SOURCE_LINK.on_sale, show: true },
  ];
  const tabs = all.filter((tab) => tab.show && (tab.isLoading || tab.products.length > 0));
  if (tabs.length === 0) return null;
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = tabs.findIndex((tab) => tab.key === current.key);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next == null) return;
    e.preventDefault();
    const tab = tabs[(next + tabs.length) % tabs.length];
    setActive(tab.key);
    tabRefs.current[tab.key]?.focus();
  };

  return (
    <section aria-labelledby={`${baseId}-h`} className={WRAP}>
      <SectionHeader id={`${baseId}-h`} title={t("tpl_market:home.featured")} to={current.link}>
        {tabs.length > 1 && (
          <div role="tablist" aria-label={t("tpl_market:home.featuredLists")} className="no-scrollbar flex max-w-full gap-4 overflow-x-auto sm:gap-5">
            {tabs.map((tab) => {
              const selected = tab.key === current.key;
              return (
                <button
                  key={tab.key}
                  ref={(el) => { tabRefs.current[tab.key] = el; }}
                  type="button"
                  role="tab"
                  id={`${baseId}-${tab.key}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.key)}
                  onKeyDown={onKeyDown}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap rounded-sm pb-1.5 text-[13px] font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                    selected ? "text-primary after:bg-primary" : "text-muted-foreground hover:text-foreground",
                    FOCUS,
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </SectionHeader>
      {current.key === "top" && home.subtitle && <p className="-mt-2 mb-4 text-sm text-muted-foreground">{home.subtitle}</p>}
      <div
        id={`${baseId}-panel`}
        role={tabs.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={tabs.length > 1 ? `${baseId}-${current.key}` : undefined}
        className={PRODUCT_GRID}
      >
        {current.isLoading ? <CardSkeletons count={5} /> : current.products.slice(0, 10).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Best sellers + new arrivals */

function BestSellerRow({ product, rank }: { product: Product; rank: number }) {
  const { t } = useTranslation();
  const c = useProductCard(product);
  return (
    <li className="relative flex items-center gap-3 border-b border-border px-3 py-3 last:border-0 hover:bg-accent/50">
      <span className="w-4 shrink-0 text-center text-xs font-bold tabular-nums text-primary" aria-hidden="true">{rank}</span>
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
        {c.image ? <img src={c.image} alt="" loading="lazy" onError={c.onImageError} className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-muted-foreground/50" aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <Link to={c.href} className="line-clamp-2 rounded-sm text-[13px] font-semibold leading-snug text-foreground outline-none after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring">
          <span className="sr-only">{t("tpl_market:home.rankPrefix", { rank })}</span>
          {product.name}
        </Link>
        {c.reviews > 0 && (
          <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Stars rating={c.rating} /> <span className="font-semibold text-foreground">{c.rating.toFixed(1)}</span> ({c.reviews})
            <span className="sr-only">{t("tpl_market:home.ratedSuffix", { rating: c.rating.toFixed(1) })}</span>
          </span>
        )}
        <span className="mt-1 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
          <span className="text-sm font-bold text-foreground">{c.price}</span>
          {c.originalPrice && <span className="text-[11px] text-muted-foreground line-through">{c.originalPrice}</span>}
        </span>
      </span>
    </li>
  );
}

/** Numbered best-seller list beside a New Arrivals grid (stacked below xl). */
export function BestAndNew() {
  const { t } = useTranslation();
  const best = useProductList("best_seller", { limit: DEAL_LIMIT });
  const latest = useProductList("latest", { limit: LATEST_LIMIT });
  const showBest = best.isLoading || best.products.length > 0;
  const showNew = latest.isLoading || latest.products.length > 0;
  if (!showBest && !showNew) return null;

  return (
    <div className={cn(WRAP, "grid gap-8 xl:gap-6", showBest && showNew && "xl:grid-cols-[340px_minmax(0,1fr)]")}>
      {showBest && (
        <section aria-labelledby="ts-best" className="min-w-0">
          <SectionHeader id="ts-best" title={t("tpl_market:home.bestSellers")} to={SOURCE_LINK.best_seller} />
          <div className={cn(PANEL, "overflow-hidden")}>
            {best.isLoading ? (
              <div className="space-y-3 p-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              <ol className="md:grid md:grid-cols-2 xl:block">
                {best.products.slice(0, 4).map((p, i) => <BestSellerRow key={p.id} product={p} rank={i + 1} />)}
              </ol>
            )}
          </div>
        </section>
      )}
      {showNew && (
        <section aria-labelledby="ts-new" className="min-w-0">
          <SectionHeader id="ts-new" title={t("tpl_market:home.newArrivals")} to="/shop" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {latest.isLoading ? <CardSkeletons count={4} /> : latest.products.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
