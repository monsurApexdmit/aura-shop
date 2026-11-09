import { useId } from "react";
import { Link } from "react-router-dom";
import {
  Banknote, Clock, Gift, Headset, Heart, Leaf, Package, Phone, RotateCcw, ShieldCheck, Sparkles, Star, Truck, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { ApiCategory } from "@/services/categoryApi";
import type { HomepagePerkIcon, HomepageProductSource } from "@/services/storefrontSettingsApi";
import { SOURCE_LINK, useActiveCoupons, useHomeProducts, useProductList } from "../shared/useHomeContent";
import Hero from "./Hero";
import Rail, { SectionHeading } from "./Rail";
import { OfferTickets } from "./Offers";
import Footer from "./Footer";
import { tile } from "./helpers";

const MAX_CATEGORY_TILES = 16;
const CATEGORY_RAILS = 3;

const SOURCE_TITLE: Record<HomepageProductSource, string> = {
  latest: "Fresh in today",
  featured: "Picked for you",
  best_seller: "Best sellers",
  hot_deal: "Hot deals",
  on_sale: "On sale today",
};

function CategoryTiles() {
  const headingId = useId();
  const { data: categories = [], isLoading } = useCategories();
  const shown = categories.slice(0, MAX_CATEGORY_TILES);
  if (!isLoading && shown.length === 0) return null;
  // Phones: 4 across; more than 4 become two rows that scroll sideways. Desktop: 8 per row.
  const twoRows = isLoading || shown.length > 4;

  return (
    <section aria-labelledby={headingId} className="py-4 md:py-6">
      <SectionHeading id={headingId} title="Shop by category" href="/categories" />
      <ul
        className={cn(
          "container no-scrollbar grid gap-x-3 gap-y-4 overflow-x-auto pb-1 md:auto-cols-auto md:grid-flow-row md:grid-cols-8 md:grid-rows-none md:gap-x-5 md:gap-y-6 md:overflow-visible",
          twoRows ? "auto-cols-[calc((100%-2.25rem)/4)] grid-flow-col grid-rows-2" : "grid-cols-4",
        )}
      >
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => (
              <li key={i} aria-hidden="true" className="flex flex-col items-center gap-2">
                <span className="aspect-square w-full animate-pulse rounded-full bg-secondary" />
                <span className="h-3 w-3/4 animate-pulse rounded-pill bg-secondary" />
              </li>
            ))
          : shown.map((cat, i) => <CategoryTile key={cat.id} category={cat} index={i} />)}
      </ul>
    </section>
  );
}

function CategoryTile({ category, index }: { category: ApiCategory; index: number }) {
  return (
    <li>
      <Link
        to={`/shop?cat=${category.slug}`}
        className="group flex flex-col items-center gap-1.5 rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={cn(
            "flex aspect-square w-full items-center justify-center overflow-hidden rounded-full font-display text-3xl font-extrabold text-ink ring-2 ring-transparent ring-offset-2 ring-offset-background transition group-hover:ring-primary md:text-4xl",
            tile(index),
          )}
        >
          {category.image ? (
            <img src={getImageUrl(category.image)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
          ) : (
            category.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="line-clamp-2 text-xs font-bold leading-tight text-foreground md:text-sm">{category.name}</span>
      </Link>
    </li>
  );
}

function AdminProductsRail({ categories }: { categories: ApiCategory[] }) {
  const home = useHomeProducts();
  const { data: sections } = useHomepageSections();
  if (!home.enabled) return null;
  const categoryId = sections?.products?.categoryId;
  const cat = categoryId ? categories.find((c) => c.id === categoryId) : undefined;
  const href = home.source === "latest" && cat ? `/shop?cat=${cat.slug}` : SOURCE_LINK[home.source] ?? "/shop";
  return (
    <Rail
      title={home.title || SOURCE_TITLE[home.source] || "Fresh in today"}
      subtitle={home.subtitle || undefined}
      href={href}
      products={home.products}
      isLoading={home.isLoading}
    />
  );
}

function BestSellersRail({ skip }: { skip: boolean }) {
  const { products, isLoading } = useProductList("best_seller", { limit: 12, enabled: !skip });
  if (skip) return null;
  return <Rail title="Best sellers" subtitle="What neighbours buy again and again" href="/deals" products={products} isLoading={isLoading} tileOffset={2} />;
}

function CategoryRail({ category, index }: { category: ApiCategory; index: number }) {
  const { products, isLoading } = useProductList("latest", { categoryId: category.id, limit: 12 });
  return <Rail title={category.name} href={`/shop?cat=${category.slug}`} products={products} isLoading={isLoading} tileOffset={index + 1} />;
}

const PERK_ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift,
  star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};

function Perks() {
  const { data: sections, isLoading } = useHomepageSections();
  const { formatCurrency, freeShippingThreshold } = useCurrency();
  const custom = sections?.perks;
  if (isLoading) return null;
  if (custom && (!custom.enabled || custom.items.length === 0)) return null;

  const perks: { Icon: LucideIcon; title: string; text: string; to?: string }[] = custom
    ? custom.items.map((p) => ({ Icon: PERK_ICONS[p.icon] ?? Sparkles, title: p.title, text: p.text, to: p.link ?? undefined }))
    : [
        {
          Icon: Truck,
          title: "Fast delivery",
          text: freeShippingThreshold != null ? `Within 24 hours. Free over ${formatCurrency(freeShippingThreshold)}.` : "At your door within 24 hours.",
        },
        { Icon: Leaf, title: "Fresh guarantee", text: "Not fresh? We replace it, no questions asked." },
        { Icon: Banknote, title: "Cash on delivery", text: "Pay when your order reaches you." },
        { Icon: Headset, title: "Friendly support", text: "Call or message us whenever you need help." },
      ];

  return (
    <section aria-label="Why shop with us" className="container py-6 md:py-10">
      <ul className={cn("grid grid-cols-2 gap-3 rounded-[2rem] bg-secondary p-3 md:gap-4 md:p-5", perks.length >= 4 ? "lg:grid-cols-4" : perks.length === 3 && "lg:grid-cols-3")}>
        {perks.map(({ Icon, title, text, to }) => {
          const body = (
            <>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground md:size-12">
                <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-bold leading-tight text-card-foreground md:text-lg">{title}</span>
                {text && <span className="mt-0.5 block text-xs text-muted-foreground md:text-sm">{text}</span>}
              </span>
            </>
          );
          const cls = "flex h-full flex-col gap-3 rounded-3xl bg-card p-4 md:flex-row md:items-center md:p-5";
          return (
            <li key={title}>
              {to ? (
                <Link to={to} className={cn(cls, "transition-shadow hover:card-shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}>{body}</Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Home() {
  const coupons = useActiveCoupons();
  const { data: categories = [] } = useCategories();
  const home = useHomeProducts();
  const skipBestSellers = home.enabled && home.source === "best_seller";

  return (
    <div className="min-h-screen bg-background">
      <h1 className="sr-only">Fresh groceries and daily needs, delivered</h1>
      <Hero />
      <CategoryTiles />
      <OfferTickets coupons={coupons} />
      <AdminProductsRail categories={categories} />
      <BestSellersRail skip={skipBestSellers} />
      {categories.slice(0, CATEGORY_RAILS).map((cat, i) => (
        <CategoryRail key={cat.id} category={cat} index={i} />
      ))}
      <Perks />
      <Footer />
    </div>
  );
}
