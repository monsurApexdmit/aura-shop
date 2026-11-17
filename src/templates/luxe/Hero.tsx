import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Award, ChevronDown, Home, MapPin, Search, Sparkles, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccentText } from "@/components/common/AccentText";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useHeroSlides, type HeroSlide } from "@/templates/shared/useHomeContent";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { useTemplateBlock } from "@/templates/shared/useTemplateContent";
import { Skyline } from "./parts";
import { BTN_PRIMARY, FOCUS, FOCUS_ON_INK } from "./lib";

const STAT_ICONS: LucideIcon[] = [Home, MapPin, Users, Award];

/** Placeholder values replaced with live numbers while the owner has never saved the stats block. */
const LIVE_LISTINGS = "{listings}";
const LIVE_TYPES = "{types}";

function SearchCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories } = useStoreChrome();
  const [cat, setCat] = useState("");
  const [keyword, setKeyword] = useState("");
  const tabs = [{ slug: "", name: t("tpl_luxe:hero.all") }, ...categories.slice(0, 2).map((c) => ({ slug: c.slug, name: c.name }))];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (cat) params.set("cat", cat);
    const qs = params.toString();
    navigate(qs ? `/shop?${qs}` : "/shop");
  };

  return (
    <form role="search" aria-label={t("tpl_luxe:hero.findProperty")} onSubmit={submit} className="w-full max-w-3xl rounded-xl bg-card p-3 text-foreground shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)] sm:p-4">
      {categories.length > 0 && (
        <div className="mb-3 flex gap-1 overflow-x-auto no-scrollbar" role="group" aria-label={t("tpl_luxe:hero.propertyType")}>
          {tabs.map((tab) => {
            const active = cat === tab.slug;
            return (
              <button
                key={tab.slug || "all"}
                type="button"
                onClick={() => setCat(tab.slug)}
                aria-pressed={active}
                className={cn("h-8 shrink-0 rounded-pill px-3.5 text-xs font-semibold transition-colors", active ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground", FOCUS)}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-[1.4]">
          <span className="sr-only">{t("tpl_luxe:hero.keyword")}</span>
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-highlight" aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t("tpl_luxe:hero.keywordPlaceholder")}
            className={cn("h-11 w-full rounded-pill border border-border bg-secondary/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground", FOCUS, "focus-visible:ring-offset-card")}
          />
        </label>
        {categories.length > 0 && (
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t("tpl_luxe:hero.propertyType")}</span>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className={cn("h-11 w-full appearance-none rounded-pill border border-border bg-secondary/60 pl-3 pr-9 text-sm text-foreground", FOCUS, "focus-visible:ring-offset-card")}
            >
              <option value="">{t("tpl_luxe:hero.allTypes")}</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </label>
        )}
        <button type="submit" className={cn(BTN_PRIMARY, "h-11 shrink-0 sm:px-6", FOCUS, "focus-visible:ring-offset-card")}>
          <Search className="h-4 w-4" aria-hidden="true" /> {t("common:search.submit")}
        </button>
      </div>
    </form>
  );
}

function Stats() {
  const { t } = useTranslation();
  const { categories } = useStoreChrome();
  const { data } = useProducts({ limit: 1 });
  const total = data?.meta?.total ?? 0;
  // Shown while the owner has never saved the stats block; stable per language for useTemplateBlock.
  const defaultStats = useMemo(() => ({
    items: [
      { value: LIVE_LISTINGS, label: t("tpl_luxe:hero.statListings") },
      { value: LIVE_TYPES, label: t("tpl_luxe:hero.statTypes") },
      { value: "24/7", label: t("tpl_luxe:hero.statEnquiries") },
    ],
  }), [t]);
  const { block, isLoading } = useTemplateBlock("stats", defaultStats);

  const items = useMemo(() => {
    const raw = (block?.items ?? []).filter((s) => s.value.trim() || s.label.trim());
    return raw
      .map((s) => {
        if (s.value === LIVE_LISTINGS) return total > 0 ? { ...s, value: String(total) } : null;
        if (s.value === LIVE_TYPES) return categories.length > 0 ? { ...s, value: String(categories.length) } : null;
        return s;
      })
      .filter((s): s is { value: string; label: string } => !!s)
      .slice(0, 4);
  }, [block, total, categories.length]);

  if (isLoading) {
    return (
      <div className="container relative z-10 -mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[84px] rounded-xl" />)}
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="container relative z-10 -mt-12 sm:-mt-14">
      <ul className={cn("grid gap-3 md:gap-5", items.length === 1 ? "grid-cols-1" : items.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-4")}>
        {items.map((s, i) => {
          const Icon = STAT_ICONS[i % STAT_ICONS.length];
          return (
            <li key={`${s.label}-${i}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 card-shadow sm:gap-4 sm:p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary sm:size-12" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">{s.value}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground sm:text-xs">{s.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Full-width photo hero (first admin slide, navy overlay) with the search card, then stats cards over its bottom edge. */
export default function Hero() {
  const { t } = useTranslation();
  const { slides, isLoading } = useHeroSlides();
  // Shown until the owner adds a hero slide in admin.
  const defaultSlide: HeroSlide = {
    tag: t("tpl_luxe:hero.tag"),
    title: t("tpl_luxe:hero.title"),
    subtitle: t("tpl_luxe:hero.subtitle"),
    cta: t("tpl_luxe:hero.cta"),
    link: "/shop",
    image: null,
  };
  const slide = slides[0] ?? defaultSlide;
  const isOwnSlide = slides.length > 0;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = slide.image && slide.image !== failedSrc ? slide.image : null;

  return (
    <>
      <section aria-labelledby="lx-hero-title" className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        {image ? (
          <>
            <img src={image} alt="" onError={() => setFailedSrc(image)} className="absolute inset-0 -z-20 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/40" aria-hidden="true" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-primary/45" />
            <div className="absolute -right-32 -top-40 size-[34rem] rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 size-[26rem] rounded-full bg-highlight/10 blur-3xl" />
            <Skyline className="absolute inset-x-0 bottom-0 h-40 w-full text-ink-foreground/[0.06] sm:h-56" />
          </div>
        )}

        <div className="container pb-24 pt-12 sm:pb-28 sm:pt-16 lg:pb-32 lg:pt-24">
          {isLoading ? (
            <div className="max-w-2xl space-y-4" aria-hidden="true">
              <Skeleton className="h-6 w-40 rounded-full bg-ink-foreground/10" />
              <Skeleton className="h-12 w-full bg-ink-foreground/10" />
              <Skeleton className="h-5 w-3/4 bg-ink-foreground/10" />
              <Skeleton className="h-28 w-full max-w-3xl rounded-xl bg-ink-foreground/10" />
            </div>
          ) : (
            <>
              <div className="max-w-2xl">
                {slide.tag && (
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-ink-foreground/15 bg-ink-foreground/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-foreground backdrop-blur-sm sm:text-[11px]">
                    <Sparkles className="h-3 w-3 text-highlight" aria-hidden="true" /> {slide.tag}
                  </p>
                )}
                <h1 id="lx-hero-title" className="mt-4 font-display text-[2.15rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                  <AccentText text={slide.title} accentClassName="font-semibold text-highlight" />
                </h1>
                {slide.subtitle && <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-foreground/80 sm:text-base">{slide.subtitle}</p>}
                {isOwnSlide && slide.cta && (
                  <Link to={slide.link} className={cn("mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-highlight hover:underline", FOCUS_ON_INK)}>
                    {slide.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className="mt-7 sm:mt-9">
                <SearchCard />
              </div>
            </>
          )}
        </div>
      </section>
      <Stats />
    </>
  );
}

