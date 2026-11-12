import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, BadgeCheck, Gamepad2, Headphones, Headset, Mail, Package, RotateCcw, ShieldCheck, Watch, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { usePromoTiles, useTemplateBlock, type PromoTile } from "@/templates/shared/useTemplateContent";
import { SectionHeader, Stars } from "./parts";
import { FOCUS, WRAP } from "./lib";

const isExternal = (to: string) => /^https?:\/\//i.test(to);

function AnyLink({ to, className, children, label }: { to: string; className?: string; children: ReactNode; label?: string }) {
  return isExternal(to)
    ? <a href={to} className={className} aria-label={label}>{children}</a>
    : <Link to={to} className={className} aria-label={label}>{children}</Link>;
}

/* ------------------------------------------------------------------ Promo banners */

/** Shown until the owner saves Template content > Promo tiles. The first three are used. Keys under tpl_market:promo. */
const DEFAULT_TILES = [
  { id: "ts-1", key: "tile1", link: "/shop" },
  { id: "ts-2", key: "tile2", link: "/shop" },
  { id: "ts-3", key: "tile3", link: "/deals" },
] as const;

const TILE_STYLES: { box: string; tag: string; sub: string; Icon: LucideIcon; icon: string }[] = [
  { box: "bg-gradient-to-br from-ink via-ink to-primary/80 text-ink-foreground", tag: "text-ink-foreground/70", sub: "text-ink-foreground/75", Icon: Gamepad2, icon: "text-primary/50" },
  { box: "bg-gradient-to-br from-tile-1 via-tile-3 to-tile-2 text-ink", tag: "text-ink/60", sub: "text-ink/70", Icon: Watch, icon: "text-primary/25" },
  { box: "bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground", tag: "text-primary-foreground/75", sub: "text-primary-foreground/80", Icon: Headphones, icon: "text-primary-foreground/25" },
];

function PromoBanner({ tile, index }: { tile: PromoTile; index: number }) {
  const [failed, setFailed] = useState(false);
  const photo = tile.image && !failed;
  const s = TILE_STYLES[index % TILE_STYLES.length];
  return (
    <AnyLink
      to={tile.link}
      className={cn(
        "group relative flex h-[170px] overflow-hidden rounded-xl sm:h-[190px]",
        photo ? "bg-ink text-white" : s.box,
        FOCUS,
      )}
    >
      {photo ? (
        <>
          <img src={tile.image!} alt="" loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" aria-hidden="true" />
        </>
      ) : (
        <>
          <span className="absolute -right-8 -top-10 size-44 rounded-full bg-white/10" aria-hidden="true" />
          <s.Icon className={cn("absolute -bottom-4 right-3 h-36 w-36 transition-transform duration-500 group-hover:scale-105", s.icon)} strokeWidth={1.25} aria-hidden="true" />
        </>
      )}
      <span className="relative z-10 flex max-w-[78%] flex-col justify-center gap-1 px-5 sm:px-6">
        {tile.tag && <span className={cn("text-[10px] font-bold uppercase tracking-[0.16em]", photo ? "text-white/75" : s.tag)}>{tile.tag}</span>}
        <span className="font-display text-xl font-extrabold leading-tight tracking-tight">{tile.title}</span>
        {tile.text && <span className={cn("line-clamp-2 text-xs", photo ? "text-white/80" : s.sub)}>{tile.text}</span>}
        {tile.cta && (
          <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-pill bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm ring-1 ring-white/15 transition-colors group-hover:bg-primary/90">
            {tile.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </span>
    </AnyLink>
  );
}

/** Three mid-page banners: the first three promo tiles. */
export function PromoBanners() {
  const { t } = useTranslation();
  const fallback = useMemo<PromoTile[]>(
    () => DEFAULT_TILES.map(({ id, key, link }) => ({
      id,
      tag: t(`tpl_market:promo.${key}.tag`),
      title: t(`tpl_market:promo.${key}.title`),
      text: t(`tpl_market:promo.${key}.text`),
      cta: t(`tpl_market:promo.${key}.cta`),
      link,
      image: null,
    })),
    [t],
  );
  const { tiles, isLoading } = usePromoTiles(fallback);
  if (isLoading) return <div className={cn(WRAP, "grid gap-4 md:grid-cols-3")}>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[170px] rounded-xl sm:h-[190px]" />)}</div>;
  const shown = tiles.slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <section aria-label={t("tpl_market:promo.label")} className={cn(WRAP, "grid gap-3 sm:gap-4", shown.length === 3 ? "md:grid-cols-3" : shown.length === 2 && "md:grid-cols-2")}>
      {shown.map((tile, i) => <PromoBanner key={tile.id || i} tile={tile} index={i} />)}
    </section>
  );
}

/* ------------------------------------------------------------------ Stats */

/** Shown until the owner saves Template content > Stats. Keys under tpl_market:stats. */
// Only what every store on this platform offers; owners add their own numbers in admin
const DEFAULT_STATS = ["online", "secure", "tracking"] as const;
const STAT_ICONS: LucideIcon[] = [Headset, ShieldCheck, Package, RotateCcw, BadgeCheck];

export function StatsBar() {
  const { t } = useTranslation();
  const fallback = useMemo(
    () => ({ items: DEFAULT_STATS.map((k) => ({ value: t(`tpl_market:stats.${k}.value`), label: t(`tpl_market:stats.${k}.label`) })) }),
    [t],
  );
  const { block } = useTemplateBlock("stats", fallback);
  const items = block?.items.filter((s) => s.value.trim() || s.label.trim()) ?? [];
  if (items.length === 0) return null;
  return (
    <section aria-label={t("tpl_market:stats.label")} className={WRAP}>
      <ul
        className={cn(
          "grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.07] via-card to-primary/[0.07] px-4 py-5 sm:px-6 md:gap-6",
          items.length >= 5 ? "md:grid-cols-3 lg:grid-cols-5" : items.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3",
        )}
      >
        {items.map((s, i) => {
          const Icon = STAT_ICONS[i % STAT_ICONS.length];
          return (
            <li key={`${s.value}-${i}`} className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground" aria-hidden="true">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-extrabold leading-tight text-primary">{s.value}</span>
                <span className="block truncate text-xs text-muted-foreground">{s.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Testimonials */

export function Testimonials() {
  const { t } = useTranslation();
  // Only reviews the owner added (Template content > Reviews); never sample quotes
  const { block } = useTemplateBlock("testimonials", null);
  const items = block?.items.filter((t) => t.text.trim()) ?? [];
  if (!block || items.length === 0) return null;
  return (
    <section aria-labelledby="ts-reviews" className={WRAP}>
      <SectionHeader id="ts-reviews" title={block.title || t("tpl_market:testimonials.title")} />
      <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
        {items.map((r, i) => (
          <li key={`${r.name}-${i}`} className="w-[85%] shrink-0 snap-start md:w-auto">
            <figure className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
              {r.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} className="h-3.5 w-3.5" />
                  <span className="sr-only">{t("common:product.ratedOutOf", { rating: r.rating })}</span>
                </div>
              )}
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">“{r.text}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary" aria-hidden="true">
                  {r.name.trim().charAt(0) || "?"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-bold text-foreground">{r.name}</span>
                  {r.note && <span className="block truncate text-[11px] text-primary">{r.note}</span>}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ Newsletter */

/** Sign-up panel. No backend yet: thanks the shopper. */
export function Newsletter() {
  const { t } = useTranslation();
  // Shown until the owner saves Template content > Newsletter
  const fallback = useMemo(() => ({ title: t("tpl_market:newsletter.title"), text: t("tpl_market:newsletter.text") }), [t]);
  const { block } = useTemplateBlock("newsletter", fallback);
  const id = useId();
  const [email, setEmail] = useState("");
  if (!block) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success(t("common:footer.subscribed"), { description: t("tpl_market:newsletter.thanksText") });
    setEmail("");
  };

  return (
    <section aria-labelledby={`${id}-h`} className={WRAP}>
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-primary/[0.1] px-5 py-7 sm:px-8 md:py-9">
        <span className="absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm" aria-hidden="true">
              <Mail className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 id={`${id}-h`} className="font-display text-lg font-extrabold tracking-tight text-foreground sm:text-xl">{block.title || fallback.title}</h2>
              {block.text && <p className="mt-1 text-sm text-muted-foreground">{block.text}</p>}
            </div>
          </div>
          <div className="w-full lg:max-w-md">
            <form onSubmit={submit} className="flex gap-2">
              <label htmlFor={`${id}-email`} className="sr-only">{t("common:form.emailAddress")}</label>
              <input
                id={`${id}-email`}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("common:footer.emailPlaceholder")}
                className="h-11 min-w-0 flex-1 rounded-pill border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <button type="submit" className={cn("h-11 shrink-0 rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90", FOCUS)}>
                {t("common:actions.subscribe")}
              </button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">{t("common:footer.noSpam")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
