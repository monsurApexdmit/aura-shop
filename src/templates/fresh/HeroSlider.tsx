import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Apple, ArrowRight, Carrot, Croissant, Fish, Milk, Tag, Wheat, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { AccentText } from "@/components/common/AccentText";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useActiveCoupons, useHeroSlides, type HeroSlide } from "../shared/useHomeContent";
import { FOCUS_ON_DARK } from "./lib";

/** Shown until the owner adds hero slides in admin (Online store > Homepage hero). Copy: tpl_fresh:hero.slides.<key>. */
const DEFAULT_SLIDES = [
  { key: "fresh", link: "/shop" },
  { key: "savings", link: "/deals" },
  { key: "aisles", link: "/categories" },
] as const;

const CLUSTERS: LucideIcon[][] = [
  [Apple, Carrot, Milk, Croissant],
  [Wheat, Apple, Fish, Milk],
  [Carrot, Croissant, Apple, Wheat],
];
const BUBBLES = [
  "right-[30%] top-[14%] size-24 bg-tile-1",
  "right-[8%] top-[8%] size-32 bg-tile-2",
  "right-[24%] bottom-[12%] size-28 bg-tile-5",
  "right-[4%] bottom-[18%] size-20 bg-tile-4",
];

/** Decorative produce bubbles for the built-in (photo-less) slides. */
function ProduceArt({ tone }: { tone: number }) {
  const icons = CLUSTERS[tone % CLUSTERS.length];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 sm:block">
      <span className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/40" />
      <span className="absolute -bottom-32 right-32 size-80 rounded-full bg-primary/25" />
      {icons.map((Icon, i) => (
        <span key={i} className={cn("absolute flex items-center justify-center rounded-full text-ink shadow-xl", BUBBLES[i])}>
          <Icon className="h-1/2 w-1/2" strokeWidth={1.5} />
        </span>
      ))}
    </div>
  );
}

function Slide({ slide, index, offer, eager }: { slide: HeroSlide; index: number; offer: string | null; eager: boolean }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const photo = slide.image && !failed ? slide.image : null;
  const secondary = slide.link.startsWith("/deals")
    ? { label: t("tpl_fresh:hero.browseCategories"), to: "/categories" }
    : { label: t("tpl_fresh:hero.seeAllDeals"), to: "/deals" };

  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-ink text-white">
      {photo ? (
        <>
          <img src={photo} alt="" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/5" />
        </>
      ) : (
        <>
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-primary/70" />
          <ProduceArt tone={index} />
        </>
      )}

      <div className="relative z-10 max-w-[92%] px-5 py-6 sm:max-w-[60%] sm:px-10 lg:px-12">
        {offer && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1 text-[11px] font-semibold text-highlight-foreground sm:text-xs">
            <Tag className="h-3 w-3" aria-hidden="true" /> {offer}
          </span>
        )}
        {slide.tag && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:text-xs">{slide.tag}</p>}
        <h2 className="mt-1.5 font-display text-[1.75rem] font-bold leading-[1.08] sm:text-4xl lg:text-5xl">
          <AccentText text={slide.title} accentClassName="not-italic text-highlight-soft" />
        </h2>
        {slide.subtitle && <p className="mt-2 line-clamp-2 max-w-md text-xs text-white/85 sm:mt-3 sm:text-sm">{slide.subtitle}</p>}
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
          <Link to={slide.link} className={cn("inline-flex h-10 items-center gap-1.5 rounded-pill bg-highlight px-4 text-sm font-semibold text-highlight-foreground transition-colors hover:bg-highlight/90 sm:h-11 sm:px-5", FOCUS_ON_DARK)}>
            {slide.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to={secondary.to} className={cn("hidden h-10 items-center rounded-pill bg-white px-4 text-sm font-semibold text-neutral-900 transition-colors hover:bg-white/90 sm:inline-flex sm:h-11 sm:px-5", FOCUS_ON_DARK)}>
            {secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Photo hero with dark overlay text, autoplay (paused on hover/focus/touch), swipe and dots. */
export default function HeroSlider({ className }: { className?: string }) {
  const { t } = useTranslation();
  const hero = useHeroSlides();
  const coupons = useActiveCoupons();
  const { formatCurrency, freeShippingThreshold } = useCurrency();
  const defaults = useMemo<HeroSlide[]>(
    () =>
      DEFAULT_SLIDES.map(({ key, link }) => ({
        tag: t(`tpl_fresh:hero.slides.${key}.tag`),
        title: t(`tpl_fresh:hero.slides.${key}.title`),
        subtitle: t(`tpl_fresh:hero.slides.${key}.subtitle`),
        cta: t(`tpl_fresh:hero.slides.${key}.cta`),
        link,
        image: null,
      })),
    [t],
  );
  const slides = hero.slides.length > 0 ? hero.slides : defaults;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const coupon = coupons[0];
  const offer = coupon
    ? coupon.free_shipping
      ? t("tpl_fresh:hero.freeDeliveryCode", { code: coupon.code })
      : coupon.type === "fixed"
        ? t("tpl_fresh:hero.amountOffCode", { amount: formatCurrency(Number(coupon.discount ?? 0)), code: coupon.code })
        : t("tpl_fresh:hero.percentOffCode", { percent: Number(coupon.discount), code: coupon.code })
    : freeShippingThreshold != null
      ? t("tpl_fresh:hero.freeDeliveryOver", { amount: formatCurrency(freeShippingThreshold) })
      : null;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), Math.max(2500, hero.autoplayMs));
    return () => window.clearInterval(timer);
  }, [count, paused, hero.autoplayMs]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  const frame = cn("relative h-[290px] overflow-hidden rounded-2xl sm:h-[340px] lg:h-full lg:min-h-[400px]", className);
  if (hero.isLoading) return <div className={cn(frame, "animate-pulse bg-secondary")} aria-hidden="true" />;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("tpl_fresh:hero.carousel")}
      className={frame}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
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
      <div className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={t("tpl_fresh:hero.slideOf", { n: i + 1, count })}
            aria-hidden={i !== index}
            // Off-screen slides leave the tab order (React 18 has no inert prop)
            ref={(el) => {
              if (el) el.toggleAttribute("inert", i !== index);
            }}
            className="h-full w-full shrink-0"
          >
            <Slide slide={s} index={i} offer={offer} eager={i === 0} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute bottom-3 left-5 z-10 flex gap-1.5 sm:bottom-5 sm:left-10 lg:left-12">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={t("tpl_fresh:hero.goToSlide", { n: i + 1 })}
              aria-current={i === index}
              className={cn("h-2 rounded-full transition-all", i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80", FOCUS_ON_DARK)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
