import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Building2, Clock, Gift, Heart, Package, Phone, RotateCcw, ShieldCheck, Sparkles, Star, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccentText } from "@/components/common/AccentText";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import type { ApiCategory } from "@/services/categoryApi";
import type { HomepagePerkIcon } from "@/services/storefrontSettingsApi";
import type { Product } from "@/types/product";
import { SOURCE_LINK, useHomeProducts, useProductList } from "@/templates/shared/useHomeContent";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { useCtaBlock, type CtaBlock } from "@/templates/shared/useTemplateContent";
import ProductCard from "./ProductCard";
import { SectionHeading, Skyline } from "./parts";
import { FOCUS, FOCUS_ON_INK, categoryImage, categoryLink, tile } from "./lib";

const SECTION = "container";

function CardSkeletons({ count, className }: { count: number; className: string }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Property categories ─────────────────────────────────────────── */

function CategoryCard({ category, index }: { category: ApiCategory; index: number }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const src = categoryImage(category);
  const { data } = useProducts({ category_id: category.id, limit: 1 });
  const total = data?.meta?.total;

  return (
    <li className="min-w-0">
      <Link
        to={categoryLink(category)}
        className={cn("group relative block aspect-[3/4] overflow-hidden rounded-xl card-shadow sm:aspect-[4/5] lg:aspect-[3/4]", src && !failed ? "bg-secondary" : tile(index), FOCUS)}
      >
        {src && !failed ? (
          <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
        ) : (
          <span className="flex h-full w-full items-start justify-center pt-[22%] text-ink/25" aria-hidden="true">
            <Building2 className="h-12 w-12" strokeWidth={1.2} />
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
        <span className="absolute inset-x-3 bottom-3 text-white">
          <span className="block truncate text-sm font-semibold sm:text-[15px]">{category.name}</span>
          {total !== undefined && <span className="block text-[11px] text-white/75">{t("tpl_luxe:home.listings", { count: total })}</span>}
        </span>
      </Link>
    </li>
  );
}

export function PropertyCategories() {
  const { t } = useTranslation();
  const { categories } = useStoreChrome();
  if (categories.length === 0) return null;
  const shown = categories.slice(0, 6);
  return (
    <section aria-labelledby="lx-cats" className={SECTION}>
      <SectionHeading id="lx-cats" eyebrow={t("common:nav.categories")} title={t("tpl_luxe:home.categoriesTitle")} link="/categories" />
      <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4", shown.length >= 6 ? "lg:grid-cols-6" : shown.length >= 4 ? "lg:grid-cols-4" : "")}>
        {shown.map((c, i) => <CategoryCard key={c.id} category={c} index={i} />)}
      </ul>
    </section>
  );
}

/* ── Featured / latest listings ──────────────────────────────────── */

export function FeaturedProperties() {
  const { t } = useTranslation();
  const home = useHomeProducts();
  if (!home.enabled) return null;
  if (!home.isLoading && home.products.length === 0) return null;
  return (
    <section aria-labelledby="lx-featured" className={SECTION}>
      <SectionHeading
        id="lx-featured"
        eyebrow={t("tpl_luxe:home.featuredEyebrow")}
        title={<AccentText text={home.title || t("tpl_luxe:home.featuredTitle")} accentClassName="font-semibold text-primary" />}
        subtitle={home.subtitle || t("tpl_luxe:home.featuredSubtitle")}
        link={SOURCE_LINK[home.source] ?? "/shop"}
      />
      {home.isLoading ? (
        <CardSkeletons count={3} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {home.products.map((p, i) => <li key={p.id} className="min-w-0"><ProductCard product={p} index={i} /></li>)}
        </ul>
      )}
    </section>
  );
}

function ListingRail({ products }: { products: Product[] }) {
  // Phones: a swipeable row; tablets and up: a 2/4 column grid
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
          <ProductCard product={p} index={i} />
        </li>
      ))}
    </ul>
  );
}

export function LatestProperties() {
  const { t } = useTranslation();
  const { products, isLoading } = useProductList("latest", { limit: 8 });
  if (!isLoading && products.length === 0) return null;
  return (
    <section aria-labelledby="lx-latest" className={SECTION}>
      <SectionHeading id="lx-latest" eyebrow={t("tpl_luxe:home.latestEyebrow")} title={t("tpl_luxe:home.latestTitle")} link="/shop" />
      {isLoading ? <CardSkeletons count={4} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" /> : <ListingRail products={products} />}
    </section>
  );
}

/* ── Why choose us (homepage perks, first three) ─────────────────── */

const PERK_ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift,
  star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};

/** Shown until the owner saves perk cards; keys translated at render. */
const DEFAULT_PERKS: { icon: HomepagePerkIcon; titleKey: string; textKey: string; link: string | null }[] = [
  { icon: "star", titleKey: "tpl_luxe:home.perks.listingsTitle", textKey: "tpl_luxe:home.perks.listingsText", link: "/shop" },
  { icon: "phone", titleKey: "tpl_luxe:home.perks.talkTitle", textKey: "tpl_luxe:home.perks.talkText", link: "/contact" },
  { icon: "shield", titleKey: "tpl_luxe:home.perks.bookingTitle", textKey: "tpl_luxe:home.perks.bookingText", link: null },
];

export function WhyChooseUs() {
  const { t } = useTranslation();
  const { data, isLoading } = useHomepageSections();
  if (isLoading) return null;
  const perks = data?.perks;
  if (perks && !perks.enabled) return null;
  const defaults = DEFAULT_PERKS.map(({ titleKey, textKey, ...p }) => ({ ...p, title: t(titleKey), text: t(textKey) }));
  const items = (perks ? perks.items : defaults).filter((p) => p.title.trim()).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="lx-why" className={SECTION}>
      <SectionHeading id="lx-why" eyebrow={t("tpl_luxe:home.whyEyebrow")} title={t("tpl_luxe:home.whyTitle")} />
      <ul className={cn("grid gap-4 sm:gap-5", items.length === 3 ? "md:grid-cols-3" : items.length === 2 ? "md:grid-cols-2" : "")}>
        {items.map((p, i) => {
          const Icon = PERK_ICONS[p.icon] ?? ShieldCheck;
          const body = (
            <>
              <span className="flex size-11 items-center justify-center rounded-lg bg-ink text-highlight" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-foreground">{p.title}</h3>
              {p.text && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>}
            </>
          );
          const box = "block h-full rounded-xl border border-border/70 bg-card p-6 card-shadow";
          return (
            <li key={`${p.title}-${i}`} className="min-w-0">
              {p.link ? (
                <Link to={p.link} className={cn(box, "transition-shadow hover:card-shadow-hover", FOCUS)}>{body}</Link>
              ) : (
                <div className={box}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Call-to-action band ─────────────────────────────────────────── */

export function CtaBand() {
  const { t } = useTranslation();
  // Shown until the owner saves the CTA block; stable per language for useCtaBlock.
  const defaultCta = useMemo<CtaBlock>(() => ({
    tag: t("tpl_luxe:home.cta.tag"),
    title: t("tpl_luxe:home.cta.title"),
    text: t("tpl_luxe:home.cta.text"),
    cta: t("tpl_luxe:home.cta.cta"),
    link: "/contact",
    cta2: t("tpl_luxe:home.cta.cta2"),
    link2: "/shop",
    image: null,
  }), [t]);
  const { cta, isLoading } = useCtaBlock(defaultCta);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (isLoading) return <div className={SECTION}><Skeleton className="h-48 w-full rounded-2xl" /></div>;
  if (!cta || !cta.title.trim()) return null;
  const image = cta.image && cta.image !== failedSrc ? cta.image : null;

  return (
    <section aria-labelledby="lx-cta" className={SECTION}>
      <div className="relative isolate overflow-hidden rounded-2xl bg-ink px-6 py-10 text-ink-foreground sm:px-10 sm:py-12 lg:px-14">
        {image ? (
          <>
            <img src={image} alt="" loading="lazy" onError={() => setFailedSrc(image)} className="absolute inset-0 -z-20 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/55" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink to-primary/40" />
            <div className="absolute -right-16 -top-24 size-80 rounded-full bg-highlight/10 blur-3xl" />
            <Skyline className="absolute bottom-0 right-0 h-32 w-full text-ink-foreground/[0.07] sm:w-2/3" />
          </div>
        )}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            {cta.tag && (
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-highlight">
                <span className="h-px w-6 bg-highlight" aria-hidden="true" /> {cta.tag}
              </p>
            )}
            <h2 id="lx-cta" className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
              <AccentText text={cta.title} accentClassName="font-semibold text-highlight" />
            </h2>
            {cta.text && <p className="mt-3 text-sm leading-relaxed text-ink-foreground/75 sm:text-[15px]">{cta.text}</p>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">
            {cta.cta && (
              <Link to={cta.link || "/contact"} className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-highlight px-5 text-sm font-semibold text-highlight-foreground transition-colors hover:bg-highlight/90", FOCUS_ON_INK)}>
                {cta.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {cta.cta2 && (
              <Link to={cta.link2 || "/shop"} className={cn("inline-flex h-11 items-center justify-center rounded-pill border border-ink-foreground/30 px-5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink-foreground/10", FOCUS_ON_INK)}>
                {cta.cta2}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
