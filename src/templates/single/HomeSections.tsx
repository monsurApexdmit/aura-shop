import { useId, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowRight, Baby, BedDouble, Clock, Gift, Headset, Heart, LayoutGrid, Mail, Milk, Package, Phone, RotateCcw, ShieldCheck, Smile, Sparkles, Star, Sun, Truck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import type { HomepagePerkIcon } from "@/services/storefrontSettingsApi";
import type { Product } from "@/types/product";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { SOURCE_LINK, useHomeProducts, useProductList } from "@/templates/shared/useHomeContent";
import { usePromoTiles, useTemplateBlock, type PromoTile } from "@/templates/shared/useTemplateContent";
import ProductCard from "./ProductCard";
import { CategoryBubble, ProductGrid, ProductGridSkeleton, SectionHeader, Stars } from "./parts";
import { FOCUS, FOCUS_ON_PURPLE, categoryLink, tone } from "./lib";

/* ───────────────────────── Category circles ───────────────────────── */

const BUBBLE = "size-[68px] sm:size-20 lg:size-[84px]";

/** Pastel circles for the first categories (photo if uploaded, else an icon), then "All categories". */
export function CategoryCircles() {
  const { t } = useTranslation();
  const { categories } = useStoreChrome();
  if (categories.length === 0) return null;
  const shown = categories.slice(0, 8);

  return (
    <section aria-labelledby="kb-cats" className="container">
      <h2 id="kb-cats" className="sr-only">{t("tpl_single:home.shopByCategory")}</h2>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-1 sm:gap-5 lg:mx-0 lg:justify-between lg:overflow-visible lg:px-0">
        {shown.map((c, i) => (
          <li key={c.id} className="shrink-0">
            <Link to={categoryLink(c)} className={cn("group flex w-[76px] flex-col items-center gap-2 rounded-2xl p-1 text-center sm:w-24", FOCUS)}>
              <CategoryBubble category={c} index={i} className={cn(BUBBLE, "ring-4 ring-transparent transition-[box-shadow,transform] group-hover:-translate-y-0.5 group-hover:ring-primary/15 motion-reduce:group-hover:translate-y-0")} />
              <span className="line-clamp-2 text-xs font-bold leading-tight text-foreground sm:text-[13px]">{c.name}</span>
            </Link>
          </li>
        ))}
        <li className="shrink-0">
          <Link to="/categories" className={cn("group flex w-[76px] flex-col items-center gap-2 rounded-2xl p-1 text-center sm:w-24", FOCUS)}>
            <span className={cn(BUBBLE, "flex items-center justify-center rounded-full bg-accent text-primary ring-4 ring-transparent transition-[box-shadow,transform] group-hover:-translate-y-0.5 group-hover:ring-primary/15")} aria-hidden="true">
              <LayoutGrid className="h-7 w-7" strokeWidth={1.8} />
            </span>
            <span className="text-xs font-bold leading-tight text-foreground sm:text-[13px]">{t("common:nav.allCategories")}</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

/* ───────────────────────── Promo tiles ───────────────────────── */

/** Four tiles until the owner saves their own (admin: Template content > Promo tiles). Keys under tpl_single:promo. */
const DEFAULT_TILES = [
  { id: "kb-1", key: "tile1", link: "/shop" },
  { id: "kb-2", key: "tile2", link: "/shop" },
  { id: "kb-3", key: "tile3", link: "/shop" },
  { id: "kb-4", key: "tile4", link: "/deals" },
] as const;
const TILE_ICONS: LucideIcon[] = [Gift, Sun, BedDouble, Milk];

function TileArt({ index, image, onError }: { index: number; image: string | null; onError: () => void }) {
  const t = tone(index);
  const Icon = TILE_ICONS[index % TILE_ICONS.length];
  return (
    <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm sm:size-[104px]" aria-hidden="true">
      {image ? (
        <img src={image} alt="" loading="lazy" onError={onError} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <Icon className={cn("h-11 w-11", t.fg)} strokeWidth={1.6} />
          <Sparkles className={cn("absolute right-3 top-3 h-4 w-4 opacity-60", t.fg)} />
        </span>
      )}
    </span>
  );
}

function Tile({ tile, index }: { tile: PromoTile; index: number }) {
  const [failed, setFailed] = useState(false);
  const t = tone(index);
  return (
    <Link to={tile.link} className={cn("group flex h-full min-h-[132px] items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:p-5", t.bg, FOCUS)}>
      <span className="min-w-0 flex-1">
        {tile.tag && <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{tile.tag}</span>}
        <span className={cn("block font-display text-lg font-semibold leading-tight sm:text-xl", t.fg)}>{tile.title}</span>
        {tile.text && <span className="mt-1 block text-xs leading-snug text-foreground/80 sm:text-[13px]">{tile.text}</span>}
        {tile.cta && (
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-foreground">
            {tile.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        )}
      </span>
      <TileArt index={index} image={failed ? null : tile.image} onError={() => setFailed(true)} />
    </Link>
  );
}

/** The first four promo tiles as pastel cards: text left, photo (or a drawn icon) right. */
export function PromoTiles() {
  const { t } = useTranslation();
  const fallback = useMemo<PromoTile[]>(
    () => DEFAULT_TILES.map(({ id, key, link }) => ({
      id,
      tag: "",
      title: t(`tpl_single:promo.${key}.title`),
      text: t(`tpl_single:promo.${key}.text`),
      cta: t("common:actions.shopNow"),
      link,
      image: null,
    })),
    [t],
  );
  const { tiles, isLoading } = usePromoTiles(fallback);
  if (isLoading) {
    return (
      <div className="container grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className={cn("h-[132px] animate-pulse rounded-2xl", tone(i).bg)} />)}
      </div>
    );
  }
  if (tiles.length === 0) return null;
  return (
    <section aria-label={t("tpl_single:home.featuredCollections")} className="container">
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4 xl:gap-4">
        {tiles.slice(0, 4).map((tile, i) => (
          <li key={tile.id} className="w-[84%] shrink-0 snap-start sm:w-auto">
            <Tile tile={tile} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────────────────── Product rows ───────────────────────── */

function ProductSection({ id, title, Icon, iconClassName, to, products, isLoading }: { id: string; title: string; Icon: LucideIcon; iconClassName?: string; to: string; products: Product[]; isLoading: boolean }) {
  if (!isLoading && products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container">
      <SectionHeader id={id} title={title} Icon={Icon} iconClassName={iconClassName} to={to} />
      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <ProductGrid>
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </ProductGrid>
      )}
    </section>
  );
}

/** Admin's homepage product block (Homepage sections > Products), titled "Popular Picks" by default. */
export function PopularPicks({ products, isLoading, enabled, title, source }: ReturnType<typeof useHomeProducts>) {
  const { t } = useTranslation();
  if (!enabled) return null;
  return (
    <ProductSection id="kb-popular" title={title || t("tpl_single:home.popularPicks")} Icon={Heart} to={SOURCE_LINK[source] ?? "/shop"} products={products} isLoading={isLoading} />
  );
}

/** Latest products, skipping any already shown in Popular Picks. */
export function NewArrivals({ exclude }: { exclude: string[] }) {
  const { t } = useTranslation();
  const { products, isLoading } = useProductList("latest", { limit: 12 });
  const shown = useMemo(() => products.filter((p) => !exclude.includes(p.id)).slice(0, 6), [products, exclude]);
  return <ProductSection id="kb-new" title={t("tpl_single:home.newArrivals")} Icon={Sparkles} iconClassName="text-primary" to="/shop" products={shown} isLoading={isLoading} />;
}

/** Products on sale. */
export function Deals() {
  const { t } = useTranslation();
  const { products, isLoading } = useProductList("on_sale", { limit: 6 });
  return <ProductSection id="kb-deals" title={t("tpl_single:home.deals")} Icon={Star} iconClassName="fill-highlight text-highlight" to="/deals" products={products} isLoading={isLoading} />;
}

/* ───────────────────────── Perks ───────────────────────── */

const PERK_ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift, star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};

type Perk = { Icon: LucideIcon; title: string; text: string; link: string | null };

/** Purple band with a dashed inner border: admin perks (Homepage sections > Perks), else four defaults. */
export function PerksBand() {
  const { t } = useTranslation();
  const { data, isLoading } = useHomepageSections();
  const { freeShippingThreshold, formatCurrency } = useCurrency();
  const saved = data?.perks;
  if (isLoading || (saved && !saved.enabled)) return null;

  const perks: Perk[] = saved
    ? saved.items.map((p) => ({ Icon: PERK_ICONS[p.icon] ?? Gift, title: p.title, text: p.text, link: p.link }))
    : [
        freeShippingThreshold != null
          ? { Icon: Truck, title: t("tpl_single:perks.freeDelivery"), text: t("tpl_single:perks.ordersOver", { amount: formatCurrency(freeShippingThreshold) }), link: null }
          : { Icon: Truck, title: t("tpl_single:perks.carefulDelivery"), text: t("tpl_single:perks.packedWithCare"), link: null },
        { Icon: ShieldCheck, title: t("tpl_single:perks.secureCheckout"), text: t("tpl_single:perks.paymentProtected"), link: null },
        { Icon: RotateCcw, title: t("tpl_single:perks.easyReturns"), text: t("tpl_single:perks.returnPolicy"), link: "/returns" },
        { Icon: Headset, title: t("tpl_single:perks.support"), text: t("tpl_single:perks.supportText"), link: "/contact" },
      ];
  if (perks.length === 0) return null;

  return (
    <section aria-label={t("tpl_single:perks.label")} className="container">
      <div className="rounded-[1.75rem] bg-primary p-1.5 text-primary-foreground dark:bg-ink dark:text-ink-foreground">
        <ul className="grid grid-cols-2 gap-y-4 rounded-[1.4rem] border-2 border-dashed border-white/55 px-3 py-5 sm:px-5 lg:grid-cols-4 lg:divide-x lg:divide-white/25 dark:border-primary/50">
          {perks.slice(0, 4).map(({ Icon, title, text, link }) => {
            const body = (
              <>
                <Icon className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" strokeWidth={1.7} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-display text-sm font-semibold leading-tight sm:text-base">{title}</span>
                  {text && <span className="mt-0.5 block text-[11px] leading-snug sm:text-xs">{text}</span>}
                </span>
              </>
            );
            return (
              <li key={title} className="min-w-0 px-2 lg:px-6">
                {link ? (
                  <Link to={link} className={cn("flex items-center gap-3 rounded-xl hover:underline", FOCUS_ON_PURPLE)}>{body}</Link>
                ) : (
                  <div className="flex items-center gap-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── Testimonials ───────────────────────── */

/** Review cards the owner added (admin: Template content > Testimonials); nothing until then, never sample quotes. */
export function Testimonials() {
  const { t } = useTranslation();
  const { block } = useTemplateBlock("testimonials", null);
  if (!block || block.items.length === 0) return null;
  return (
    <section aria-labelledby="kb-reviews" className="container">
      <SectionHeader id="kb-reviews" title={block.title || t("tpl_single:home.lovedByFamilies")} Icon={Smile} />
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
        {block.items.slice(0, 6).map((r, i) => {
          const rating = Math.max(0, Math.min(5, Math.round(r.rating || 5)));
          return (
            <li key={`${r.name}-${i}`} className="w-[85%] shrink-0 snap-start md:w-auto">
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 card-shadow">
                <Stars rating={rating} className="[&_svg]:h-3.5 [&_svg]:w-3.5" />
                <span className="sr-only">{t("common:product.ratedOutOf", { rating })}</span>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">“{r.text}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold", tone(i).bg, tone(i).fg)} aria-hidden="true">
                    {r.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">{r.name}</span>
                    {r.note && <span className="block truncate text-xs text-muted-foreground">{r.note}</span>}
                  </span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────────────────── Newsletter ───────────────────────── */

/** Butter-yellow sign-up panel (admin: Template content > Newsletter). No backend yet: thanks the shopper. */
export function Newsletter() {
  const { t } = useTranslation();
  // Shown until the owner saves Template content > Newsletter
  const fallback = useMemo(() => ({ title: t("tpl_single:newsletter.title"), text: t("tpl_single:newsletter.text") }), [t]);
  const { block } = useTemplateBlock("newsletter", fallback);
  const id = useId();
  const [email, setEmail] = useState("");
  if (!block) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success(t("tpl_single:newsletter.thanks"), { description: t("tpl_single:newsletter.thanksText") });
    setEmail("");
  };

  return (
    <section aria-labelledby="kb-news" className="container">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-tile-2 px-5 py-7 dark:bg-tile-2/15 sm:px-8 md:px-10 md:py-9">
        <Star className="pointer-events-none absolute left-4 top-3 h-4 w-4 fill-highlight text-highlight" aria-hidden="true" />
        <Heart className="pointer-events-none absolute bottom-4 right-6 h-4 w-4 text-primary/60" aria-hidden="true" />
        <Baby className="pointer-events-none absolute -bottom-6 right-[38%] hidden h-24 w-24 text-[hsl(42_80%_80%)] dark:text-tile-2/10 lg:block" strokeWidth={1.2} aria-hidden="true" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-14 shrink-0 -rotate-6 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:size-16" aria-hidden="true">
              <Mail className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h2 id="kb-news" className="font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">{block.title}</h2>
              {block.text && <p className="mt-1 max-w-lg text-sm text-foreground/80">{block.text}</p>}
            </div>
          </div>
          <form onSubmit={submit} className="w-full md:max-w-[440px]">
            <div className="flex gap-2">
              <label htmlFor={id} className="sr-only">{t("common:form.emailAddress")}</label>
              <input
                id={id}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("tpl_single:newsletter.placeholder")}
                className="h-12 min-w-0 flex-1 rounded-pill border-2 border-transparent bg-card px-5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button type="submit" className={cn("h-12 shrink-0 rounded-pill bg-primary px-5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-7", FOCUS)}>
                {t("common:actions.subscribe")}
              </button>
            </div>
            <p className="mt-2 pl-5 text-[11px] text-foreground/70">{t("tpl_single:newsletter.noSpam")}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
