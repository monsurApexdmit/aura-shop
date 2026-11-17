import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Gamepad2, Headphones, Laptop, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccentText } from "@/components/common/AccentText";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeroSlides, useProductList, type HeroSlide } from "@/templates/shared/useHomeContent";
import { FOCUS } from "./lib";

/** Shared with New Arrivals so both read one cached request. */
export const LATEST_LIMIT = 4;

const PANEL = "relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.07] via-card to-primary/[0.05] dark:from-primary/[0.14] dark:via-card dark:to-primary/[0.08]";

/** Shown until the owner adds hero slides in admin (Online store > Homepage hero). Translation keys, read at render. */
const DEFAULT_SLIDES = [
  { tag: "tpl_market:hero.slide1.tag", title: "tpl_market:hero.slide1.title", subtitle: "tpl_market:hero.slide1.subtitle", cta: "tpl_market:hero.slide1.cta", link: "/shop" },
  { tag: "tpl_market:hero.slide2.tag", title: "tpl_market:hero.slide2.title", subtitle: "tpl_market:hero.slide2.subtitle", cta: "tpl_market:hero.slide2.cta", link: "/deals" },
  { tag: "tpl_market:hero.slide3.tag", title: "tpl_market:hero.slide3.title", subtitle: "tpl_market:hero.slide3.subtitle", cta: "tpl_market:hero.slide3.cta", link: "/categories" },
] as const;

const ART: LucideIcon[] = [Laptop, Gamepad2, Headphones];

/** Designed picture for slides without a photo. */
function SlideArt({ index }: { index: number }) {
  const Icon = ART[index % ART.length];
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-highlight-soft/40" aria-hidden="true">
      <span className="absolute size-[78%] rounded-full border border-primary/20" />
      <span className="absolute size-[56%] rounded-full border border-primary/25 bg-card/40" />
      <span className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-2xl" />
      <Icon className="relative h-1/3 w-1/3 text-primary" strokeWidth={1.25} />
    </div>
  );
}

function SlidePhoto({ src, index, eager, alt }: { src: string | null; index: number; eager: boolean; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <SlideArt index={index} />;
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
}

function Slide({ slide, index, eager }: { slide: HeroSlide; index: number; eager: boolean }) {
  const { t } = useTranslation();
  const second = slide.link.startsWith("/deals") ? { label: t("tpl_market:nav.shopAll"), to: "/shop" } : { label: t("tpl_market:hero.viewDeals"), to: "/deals" };
  return (
    <div className="grid h-full items-center gap-5 p-4 pb-12 sm:p-6 sm:pb-14 md:grid-cols-[1.05fr_1fr] md:gap-8 md:p-10 md:pb-16 lg:gap-12 lg:px-14 lg:py-12 lg:pb-16">
      <div className="order-2 min-w-0 md:order-1">
        {slide.tag && (
          <p className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary sm:mb-3.5">
            <span className="h-0.5 w-6 rounded-full bg-primary" aria-hidden="true" />
            {slide.tag}
          </p>
        )}
        <h2 className="font-display text-[28px] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[52px]">
          <AccentText text={slide.title} accentClassName="not-italic text-primary" />
        </h2>
        {slide.subtitle && <p className="mt-3 line-clamp-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px] md:mt-4">{slide.subtitle}</p>}
        <div className="mt-5 flex flex-wrap gap-2.5 md:mt-7 md:gap-3">
          <Link to={slide.link} className={cn("inline-flex h-10 items-center gap-2 rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-10px_hsl(var(--primary))] transition-colors hover:bg-primary/90 sm:h-11", FOCUS)}>
            {slide.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to={second.to} className={cn("inline-flex h-10 items-center rounded-pill border border-primary/40 bg-card px-5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-accent sm:h-11", FOCUS)}>
            {second.label}
          </Link>
        </div>
      </div>
      <div className="order-1 aspect-[16/10] w-full overflow-hidden rounded-xl bg-secondary shadow-[0_24px_48px_-28px_hsl(var(--foreground)/0.5)] md:order-2 md:aspect-[4/3]">
        <SlidePhoto src={slide.image} index={index} eager={eager} alt="" />
      </div>
    </div>
  );
}

/** Admin hero slides (or built-in ones until there are any) in a tinted panel: autoplay, swipe, arrows and dots. */
export default function HeroSlider() {
  const { t } = useTranslation();
  const hero = useHeroSlides();
  const { autoplayMs, isLoading } = hero;
  const usingDefaults = !isLoading && hero.slides.length === 0;
  // Built-in slides borrow the newest product photos so the banner shows the store's own goods
  const { products } = useProductList("latest", { limit: LATEST_LIMIT, enabled: usingDefaults });
  const defaults = useMemo<HeroSlide[]>(
    () => DEFAULT_SLIDES.map((s) => ({ tag: t(s.tag), title: t(s.title), subtitle: t(s.subtitle), cta: t(s.cta), link: s.link, image: null })),
    [t],
  );
  const slides = usingDefaults
    ? defaults.map((s, i) => ({ ...s, image: products[i]?.image && !products[i].image.includes("placeholder") ? products[i].image : null }))
    : hero.slides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), Math.max(2500, autoplayMs));
    return () => window.clearInterval(timer);
  }, [count, paused, autoplayMs]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (isLoading) return <Skeleton className="h-[460px] w-full rounded-2xl md:h-[420px] lg:h-[480px]" />;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("tpl_market:hero.label")}
      className={PANEL}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        setPaused(false);
        if (start == null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={t("tpl_market:hero.slideOf", { index: i + 1, count })}
            aria-hidden={i !== index}
            // Off-screen slides leave the tab order (React 18 has no inert prop)
            ref={(el) => { if (el) el.toggleAttribute("inert", i !== index); }}
            className="w-full shrink-0"
          >
            <Slide slide={s} index={i} eager={i === 0} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <div className="absolute bottom-5 left-4 flex gap-1.5 sm:left-6 md:bottom-7 md:left-10 lg:left-14">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={t("tpl_market:hero.goToSlide", { index: i + 1 })}
                aria-current={i === index}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40", FOCUS)}
              />
            ))}
          </div>
          <div className="absolute bottom-3.5 right-4 hidden gap-2 sm:right-6 md:bottom-5 md:right-10 md:flex lg:right-14">
            <button type="button" onClick={() => go(index - 1)} aria-label={t("tpl_market:hero.previous")} className={cn("flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm hover:border-primary hover:text-primary", FOCUS)}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label={t("tpl_market:hero.next")} className={cn("flex size-8 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm hover:border-primary hover:text-primary", FOCUS)}>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
