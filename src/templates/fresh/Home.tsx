import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Banknote, Clock, Flame, Gift, Heart, LayoutGrid, Leaf, Package, Percent, Phone, RotateCcw, ShieldCheck, Sparkles, Star, Truck,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useProducts } from "@/hooks/useProducts";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { ApiCategory } from "@/services/categoryApi";
import type { HomepagePerkIcon, HomepageProductSource } from "@/services/storefrontSettingsApi";
import { SOURCE_LINK, useHomeProducts, useProductList } from "../shared/useHomeContent";
import { usePromoTiles } from "../shared/useTemplateContent";
import { useStoreChrome } from "../shared/useStoreChrome";
import HeroSlider from "./HeroSlider";
import { BannerTile, SideTile } from "./PromoTiles";
import { defaultTiles } from "./defaults";
import { ProductRow, SectionHeading } from "./Section";
import Newsletter from "./Newsletter";
import Footer from "./Footer";
import { FOCUS, categoryIcon, categoryImage, categoryLink, tile, weekEndLabel } from "./lib";

const MAX_CIRCLES = 10;
const CATEGORY_ROWS = 3;

/** Translation keys for the built-in product row titles */
const SOURCE_TITLE: Record<HomepageProductSource, string> = {
  latest: "tpl_fresh:home.source.latest",
  featured: "tpl_fresh:home.source.featured",
  best_seller: "tpl_fresh:home.source.best_seller",
  hot_deal: "tpl_fresh:home.source.hot_deal",
  on_sale: "tpl_fresh:home.source.on_sale",
};

/** Built-in promo tiles in the current language; stable until the language changes. */
function useFreshTiles() {
  const { t } = useTranslation();
  const fallback = useMemo(() => defaultTiles(t), [t]);
  return usePromoTiles(fallback);
}

function HeroArea() {
  const { t } = useTranslation();
  const { tiles } = useFreshTiles();
  const side = tiles.slice(0, 2);
  return (
    <section aria-label={t("tpl_fresh:home.highlights")} className="container pt-4 md:pt-5">
      <div className={cn("grid gap-3 md:gap-4", side.length > 0 && "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]")}>
        <HeroSlider className="lg:h-[420px]" />
        {side.length > 0 && (
          <div className={cn("grid gap-3 md:gap-4", side.length > 1 ? "grid-cols-2 lg:grid-cols-1 lg:grid-rows-2" : "grid-cols-1")}>
            {side.map((item, i) => <SideTile key={item.id} t={item} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCircle({ category, index }: { category: ApiCategory; index: number }) {
  const { t } = useTranslation();
  // One tiny request per circle for its product count; the count is skipped until it arrives.
  const { data } = useProducts({ category_id: category.id, limit: 1 });
  const total = data?.meta?.total;
  const img = categoryImage(category);
  const Icon = categoryIcon(category.name);
  return (
    <li className="w-[23%] shrink-0 snap-start sm:w-[15%] lg:w-auto">
      <Link to={categoryLink(category)} className={cn("group flex flex-col items-center gap-2 rounded-xl p-1 text-center", FOCUS)}>
        <span
          className={cn(
            "flex aspect-square w-full max-w-[96px] items-center justify-center overflow-hidden rounded-full text-ink ring-2 ring-transparent ring-offset-2 ring-offset-background transition group-hover:ring-primary",
            tile(index),
          )}
        >
          {img ? (
            <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <Icon className="h-2/5 w-2/5" strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
        <span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground md:text-[13px]">{category.name}</span>
        {total != null && <span className="-mt-1 text-[11px] text-muted-foreground">{t("common:product.products", { count: total })}</span>}
      </Link>
    </li>
  );
}

function ShopByCategory() {
  const { t } = useTranslation();
  const id = useId();
  const { data: categories = [], isLoading } = useCategories();
  const shown = categories.slice(0, MAX_CIRCLES);
  if (!isLoading && shown.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container pt-8 md:pt-10">
      <SectionHeading id={id} title={t("tpl_fresh:home.shopByCategory")} icon={<LayoutGrid className="h-5 w-5 text-primary" />} href="/categories" linkLabel={t("tpl_fresh:home.viewAllCategories")} />
      <ul className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 md:mx-0 md:px-0 lg:grid lg:grid-cols-10 lg:gap-3 lg:overflow-visible">
        {isLoading
          ? Array.from({ length: MAX_CIRCLES }, (_, i) => (
              <li key={i} aria-hidden="true" className="flex w-[23%] shrink-0 flex-col items-center gap-2 p-1 sm:w-[15%] lg:w-auto">
                <span className="aspect-square w-full max-w-[96px] animate-pulse rounded-full bg-secondary" />
                <span className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
              </li>
            ))
          : shown.map((c, i) => <CategoryCircle key={c.id} category={c} index={i} />)}
      </ul>
    </section>
  );
}

function WeeklyDeals() {
  const { t } = useTranslation();
  const id = useId();
  const { products, isLoading } = useProductList("on_sale", { limit: 6 });
  if (!isLoading && products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container pt-8 md:pt-10">
      <div className="rounded-2xl border border-highlight/30 bg-highlight/[0.04] p-4 md:p-6">
        <SectionHeading
          id={id}
          title={t("tpl_fresh:shared.weeklyDeals")}
          icon={<Percent className="h-5 w-5 text-highlight" />}
          href="/deals"
          extra={
            <span className="hidden items-center gap-1 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-semibold text-highlight-foreground sm:inline-flex">
              <Clock className="h-3 w-3" aria-hidden="true" /> {weekEndLabel(t)}
            </span>
          }
        />
        <ProductRow products={products} isLoading={isLoading} label={t("tpl_fresh:home.weeklyDealsList")} />
      </div>
    </section>
  );
}

function PopularProducts() {
  const { t } = useTranslation();
  const id = useId();
  const home = useHomeProducts();
  const { data: categories = [] } = useCategories();
  const { data: sections } = useHomepageSections();
  if (!home.enabled) return null;
  if (!home.isLoading && home.products.length === 0) return null;
  const categoryId = sections?.products?.categoryId;
  const cat = categoryId ? categories.find((c) => c.id === categoryId) : undefined;
  const href = home.source === "latest" && cat ? categoryLink(cat) : SOURCE_LINK[home.source] ?? "/shop";
  const title = home.title || t(SOURCE_TITLE[home.source] ?? SOURCE_TITLE.latest);
  return (
    <section aria-labelledby={id} className="container pt-8 md:pt-10">
      <SectionHeading id={id} title={title} icon={<Flame className="h-5 w-5 text-primary" />} href={href} />
      {home.subtitle && <p className="-mt-2 mb-4 text-sm text-muted-foreground">{home.subtitle}</p>}
      <ProductRow products={home.products} isLoading={home.isLoading} label={title} tileOffset={1} />
    </section>
  );
}

function MidBanners() {
  const { t } = useTranslation();
  const { tiles } = useFreshTiles();
  const banners = tiles.slice(2, 5);
  if (banners.length === 0) return null;
  return (
    <section aria-label={t("tpl_fresh:home.offers")} className="container pt-8 md:pt-12">
      <div className={cn("grid gap-3 md:gap-4", banners.length === 3 ? "md:grid-cols-3" : banners.length === 2 && "md:grid-cols-2")}>
        {banners.map((item, i) => <BannerTile key={item.id} t={item} index={i} />)}
      </div>
    </section>
  );
}

function CategoryRow({ category, index }: { category: ApiCategory; index: number }) {
  const id = useId();
  const { products, isLoading } = useProductList("latest", { categoryId: category.id, limit: 6 });
  if (!isLoading && products.length === 0) return null;
  const img = categoryImage(category);
  const Icon = categoryIcon(category.name);
  return (
    <section aria-labelledby={id} className="container pt-8 md:pt-10">
      <SectionHeading
        id={id}
        title={category.name}
        href={categoryLink(category)}
        icon={
          <span className={cn("flex size-7 items-center justify-center overflow-hidden rounded-full text-ink", tile(index))}>
            {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4" />}
          </span>
        }
      />
      <ProductRow products={products} isLoading={isLoading} label={category.name} tileOffset={index + 2} />
    </section>
  );
}

const PERK_ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift,
  star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};

function Perks() {
  const { t } = useTranslation();
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
          title: t("tpl_fresh:home.perks.fastDelivery"),
          text: freeShippingThreshold != null
            ? t("tpl_fresh:home.perks.freeOver", { amount: formatCurrency(freeShippingThreshold) })
            : t("tpl_fresh:home.perks.toYourDoor"),
        },
        { Icon: RotateCcw, title: t("tpl_fresh:home.perks.returns"), text: t("tpl_fresh:home.perks.returnsText"), to: "/returns" },
        { Icon: Leaf, title: t("tpl_fresh:home.perks.tracking"), text: t("tpl_fresh:home.perks.trackingText"), to: "/track-order" },
        { Icon: Banknote, title: t("tpl_fresh:home.perks.secure"), text: t("tpl_fresh:home.perks.secureText") },
      ];

  return (
    <section aria-label={t("tpl_fresh:home.perks.label")} className="container pt-8 md:pt-12">
      <ul className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4", perks.length >= 4 ? "lg:grid-cols-4" : perks.length === 3 && "lg:grid-cols-3")}>
        {perks.map(({ Icon, title, text, to }) => {
          const body = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-card text-primary" aria-hidden="true">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-foreground">{title}</span>
                {text && <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>}
              </span>
            </>
          );
          const cls = "flex h-full items-center gap-3 rounded-xl border border-border bg-secondary p-4";
          return (
            <li key={title}>
              {to ? <Link to={to} className={cn(cls, "transition-colors hover:border-primary/40", FOCUS)}>{body}</Link> : <div className={cls}>{body}</div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { storeName } = useStoreChrome();
  const { data: categories = [] } = useCategories();

  return (
    <div className="min-h-screen bg-background">
      <h1 className="sr-only">{t("tpl_fresh:home.srTitle", { store: storeName })}</h1>
      <HeroArea />
      <ShopByCategory />
      <WeeklyDeals />
      <PopularProducts />
      <MidBanners />
      {categories.slice(0, CATEGORY_ROWS).map((c, i) => (
        <CategoryRow key={c.id} category={c} index={i} />
      ))}
      <Perks />
      <Newsletter />
      <Footer />
    </div>
  );
}
