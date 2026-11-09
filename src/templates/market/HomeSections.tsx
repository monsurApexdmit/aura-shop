import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Banknote, Copy, ImageOff, LayoutGrid, RotateCcw, ShieldCheck, Ticket, Truck, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/api";
import { useCategories } from "@/hooks/useCategories";
import { useCollections } from "@/hooks/useCollections";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useActiveCoupons, useProductList } from "@/templates/shared/useHomeContent";
import { useProductCard } from "@/templates/shared/useProductCard";
import type { Product } from "@/types/product";
import { CategoryThumb, Panel, SectionHeading } from "./parts";
import { FOCUS, PERK_ICONS, categoryLink, compactNumber, copyText, couponCondition, couponOffer, tile } from "./lib";

/* ───────────── Service strip ───────────── */

const MD_COLS: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

interface Perk { Icon: LucideIcon; title: string; text: string; to?: string | null }

export function ServiceStrip() {
  const { data: sections, isLoading } = useHomepageSections();
  const { formatCurrency, freeShippingThreshold } = useCurrency();
  const custom = sections?.perks;
  if (isLoading || (custom && !custom.enabled)) return null;

  const defaults: Perk[] = [
    { Icon: Truck, title: "Fast delivery", text: freeShippingThreshold != null ? `Free over ${formatCurrency(freeShippingThreshold)}` : "Right to your door" },
    { Icon: Banknote, title: "Cash on delivery", text: "Pay when it arrives" },
    { Icon: RotateCcw, title: "Easy returns", text: "Hassle-free exchanges" },
    { Icon: ShieldCheck, title: "Secure payment", text: "Your data stays safe" },
  ];
  const perks: Perk[] = custom?.items.length
    ? custom.items.slice(0, 4).map((p) => ({ Icon: PERK_ICONS[p.icon] ?? Truck, title: p.title, text: p.text, to: p.link }))
    : defaults;

  return (
    <div className="container">
      <ul className={cn("grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card", MD_COLS[perks.length] ?? "md:grid-cols-4")} aria-label="Why shop with us">
        {perks.map(({ Icon, title, text, to }, i) => {
          const body = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-highlight/10 text-highlight sm:size-10" aria-hidden="true">
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-foreground sm:text-sm">{title}</span>
                <span className="block truncate text-[11px] text-muted-foreground sm:text-xs">{text}</span>
              </span>
            </>
          );
          const cls = "flex h-full items-center gap-2.5 px-3 py-3 sm:px-4";
          return (
            <li key={title + i} className={cn("min-w-0 border-border", i % 2 === 0 && "border-r", i < 2 && "border-b md:border-b-0", i === 1 && i < perks.length - 1 && "md:border-r", i === 2 && i < perks.length - 1 && "md:border-r")}>
              {to ? <Link to={to} className={cn(cls, "hover:bg-secondary", FOCUS)}>{body}</Link> : <div className={cls}>{body}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────────── Category grid ───────────── */

export function CategoryGrid() {
  const { data: categories = [], isLoading } = useCategories();
  if (!isLoading && categories.length === 0) return null;
  const shown = categories.slice(0, 16);

  return (
    <div className="container">
      <Panel labelledBy="mk-cats">
        <SectionHeading id="mk-cats" title="Shop by category" icon={<LayoutGrid className="h-5 w-5 shrink-0 text-highlight" aria-hidden="true" />} to="/categories" />
        <ul className="no-scrollbar grid auto-cols-[78px] grid-flow-col grid-rows-2 gap-x-1 gap-y-3 overflow-x-auto p-3 sm:auto-cols-[92px] md:auto-cols-auto md:grid-flow-row md:grid-cols-6 md:grid-rows-none md:gap-y-4 md:overflow-visible md:p-4 lg:grid-cols-8">
          {isLoading
            ? Array.from({ length: 16 }, (_, i) => (
                <li key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="size-14 rounded-lg md:size-16" />
                  <Skeleton className="h-3 w-12" />
                </li>
              ))
            : shown.map((cat, i) => (
                <li key={cat.id} className="min-w-0">
                  <Link to={categoryLink(cat)} className={cn("group flex flex-col items-center gap-1.5 rounded-md p-1 text-center", FOCUS)}>
                    <CategoryThumb
                      category={cat}
                      index={i}
                      className="size-14 rounded-lg ring-1 ring-border transition-transform group-hover:-translate-y-0.5 group-hover:ring-highlight md:size-16"
                      letterClassName="text-2xl"
                    />
                    <span className="line-clamp-2 w-full text-[11px] leading-tight text-foreground group-hover:text-highlight sm:text-xs">{cat.name}</span>
                  </Link>
                </li>
              ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ───────────── Flash sale ───────────── */

function useCountdownToMidnight() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = window.setInterval(() => setLeft(calc()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60].map((n) => String(n).padStart(2, "0"));
}

function Countdown() {
  const [h, m, s] = useCountdownToMidnight();
  return (
    <p className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground" role="timer" aria-label={`Ends in ${h} hours ${m} minutes`}>
      <span className="mr-0.5 hidden sm:inline">Ends in</span>
      {[h, m, s].map((v, i) => (
        <span key={i} className="flex items-center gap-1" aria-hidden="true">
          {i > 0 && <span className="font-bold text-foreground">:</span>}
          <span className="flex h-6 min-w-[1.75rem] items-center justify-center rounded bg-ink px-1 font-display text-xs font-bold tabular-nums text-ink-foreground sm:h-7 sm:text-sm">{v}</span>
        </span>
      ))}
    </p>
  );
}

function FlashDealCard({ product }: { product: Product }) {
  const c = useProductCard(product);
  // How much of the run is gone: sold vs what's left (a floor keeps brand-new deals from looking empty)
  const stock = product.stock;
  const pct = stock === undefined
    ? (c.sold > 0 ? 60 : 8)
    : c.sold + stock > 0 ? Math.max(8, Math.min(100, Math.round((c.sold / (c.sold + stock)) * 100))) : 8;
  return (
    <li className="w-[128px] shrink-0 sm:w-[156px] lg:w-[calc((100%-2.5rem)/6)]">
      <Link to={c.href} className={cn("group block rounded-md p-1", FOCUS)}>
        <span className="relative block aspect-square overflow-hidden rounded-md bg-secondary">
          {c.image ? (
            <img src={c.image} alt="" loading="lazy" onError={c.onImageError} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground/60" aria-hidden="true"><ImageOff className="h-7 w-7" /></span>
          )}
          {c.discount > 0 && (
            <span className="absolute right-0 top-0 rounded-bl-md bg-highlight px-1.5 py-0.5 text-[11px] font-bold text-highlight-foreground">-{c.discount}%</span>
          )}
        </span>
        <span className="mt-1.5 block truncate text-xs text-foreground">{product.name}</span>
        <span className="block truncate text-[15px] font-bold tabular-nums text-highlight">{c.price}</span>
        {c.originalPrice && <span className="block truncate text-[11px] tabular-nums text-muted-foreground line-through">{c.originalPrice}</span>}
        <span className="relative mt-1.5 block h-4 overflow-hidden rounded-full bg-highlight/15">
          <span className="absolute inset-y-0 left-0 rounded-full bg-highlight" style={{ width: `${pct}%` }} />
          <span className="relative flex h-full items-center justify-center text-[10px] font-semibold text-foreground">
            {c.sold > 0 ? `${compactNumber(c.sold)} sold` : "Just started"}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function FlashSale() {
  const hot = useProductList("hot_deal", { limit: 12 });
  const sale = useProductList("on_sale", { limit: 12, enabled: !hot.isLoading && hot.products.length === 0 });
  const loading = hot.isLoading || (hot.products.length === 0 && sale.isLoading);
  const products = hot.products.length ? hot.products : sale.products;
  if (!loading && products.length === 0) return null;

  return (
    <div className="container">
      <Panel labelledBy="mk-flash">
        <SectionHeading
          id="mk-flash"
          title={<span className="text-highlight">Flash Sale</span>}
          icon={<Zap className="h-5 w-5 shrink-0 fill-highlight text-highlight" aria-hidden="true" />}
          extra={<Countdown />}
          to="/deals"
          linkLabel="Shop all"
        />
        <ul className="no-scrollbar flex gap-1.5 overflow-x-auto p-2 sm:gap-2 sm:p-3">
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="w-[128px] shrink-0 space-y-2 p-1 sm:w-[156px] lg:w-auto">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-4 w-1/2" />
                </li>
              ))
            : products.slice(0, 12).map((p) => <FlashDealCard key={p.id} product={p} />)}
        </ul>
      </Panel>
    </div>
  );
}

/* ───────────── Vouchers ───────────── */

export function Vouchers() {
  const coupons = useActiveCoupons();
  const { formatCurrency } = useCurrency();
  const [copied, setCopied] = useState<string | null>(null);
  if (coupons.length === 0) return null;

  const copy = async (code: string) => {
    await copyText(code);
    setCopied(code);
    toast.success(`Code ${code} copied`, { description: "Paste it at checkout to save." });
    window.setTimeout(() => setCopied((c) => (c === code ? null : c)), 2000);
  };

  return (
    <div className="container">
      <Panel labelledBy="mk-vouchers">
        <SectionHeading id="mk-vouchers" title="Collect vouchers" icon={<Ticket className="h-5 w-5 shrink-0 text-highlight" aria-hidden="true" />} />
        <ul className="no-scrollbar flex gap-3 overflow-x-auto p-3 sm:p-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {coupons.map((c) => (
            <li key={c.code} className="relative flex w-[264px] shrink-0 overflow-hidden rounded-md border border-highlight/30 bg-highlight/5 lg:w-auto">
              <div className="flex w-[92px] shrink-0 flex-col items-center justify-center bg-highlight px-2 py-3 text-center text-highlight-foreground">
                <span className="font-display text-lg font-extrabold leading-tight">{couponOffer(c, formatCurrency)}</span>
              </div>
              {/* Ticket notches */}
              <span aria-hidden="true" className="absolute left-[85px] top-0 size-3.5 -translate-y-1/2 rounded-full border border-highlight/30 bg-card" />
              <span aria-hidden="true" className="absolute bottom-0 left-[85px] size-3.5 translate-y-1/2 rounded-full border border-highlight/30 bg-card" />
              <div className="flex min-w-0 flex-1 flex-col gap-1 border-l border-dashed border-highlight/40 p-3">
                <span className="truncate text-sm font-semibold text-foreground">{c.campaign_name || "Store voucher"}</span>
                <span className="truncate text-[11px] text-muted-foreground">{couponCondition(c, formatCurrency)}</span>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className="truncate font-mono text-xs font-bold text-highlight">{c.code}</span>
                  <button
                    type="button"
                    onClick={() => copy(c.code)}
                    aria-label={`Copy code ${c.code}`}
                    className={cn("inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-highlight px-2.5 text-[11px] font-bold text-highlight-foreground hover:bg-highlight/90", FOCUS)}
                  >
                    <Copy className="h-3 w-3" aria-hidden="true" /> {copied === c.code ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ───────────── Collections ───────────── */

function CollectionBanner({ name, slug, src, count, index }: { name: string; slug: string; src: string | null; count: number; index: number }) {
  const [failed, setFailed] = useState(false);
  const image = src && !failed ? getImageUrl(src) : null;
  return (
    <li className="w-[82%] shrink-0 sm:w-[46%] md:w-auto">
      <Link to={`/collections/${slug}`} className={cn("group relative block aspect-[21/9] overflow-hidden rounded-lg", image ? "bg-secondary" : tile(index), FOCUS)}>
        {image ? (
          <img src={image} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span aria-hidden="true" className="absolute -right-2 -top-6 font-display text-[8rem] font-extrabold leading-none text-ink/10">{name.charAt(0)}</span>
        )}
        <span className={cn("absolute inset-0 flex flex-col justify-end p-4", image && "bg-gradient-to-t from-black/70 via-black/20 to-transparent")}>
          <span className={cn("truncate font-display text-lg font-bold leading-tight", image ? "text-white" : "text-ink")}>{name}</span>
          <span className={cn("mt-0.5 flex items-center gap-2 text-xs", image ? "text-white/80" : "text-ink/70")}>
            {count} {count === 1 ? "product" : "products"}
            <span className="rounded-sm bg-highlight px-1.5 py-0.5 text-[10px] font-bold uppercase text-highlight-foreground">Shop now</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export function CollectionBanners() {
  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const { data: collections = [], isLoading } = useCollections();
  const custom = sections?.collections;
  if (sectionsLoading || isLoading || (custom && !custom.enabled)) return null;
  const featured = collections.filter((c) => c.showOnHomepage).slice(0, 6);
  if (featured.length === 0) return null;

  return (
    <div className="container">
      <Panel labelledBy="mk-collections">
        <SectionHeading id="mk-collections" title={custom?.title || "Shop by collection"} to="/collections" />
        <ul className="no-scrollbar flex gap-3 overflow-x-auto p-3 sm:p-4 md:grid md:grid-cols-3 md:overflow-visible">
          {featured.map((c, i) => (
            <CollectionBanner key={c.slug} name={c.name} slug={c.slug} src={c.imageUrl || c.coverImageUrl || null} count={c.productCount} index={i} />
          ))}
        </ul>
      </Panel>
    </div>
  );
}
