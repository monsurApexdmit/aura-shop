import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Baby, Heart, Pause, Play, Puzzle, Rabbit, Shirt, Sparkles, Star, ToyBrick, Gift, Milk, Bike, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccentText } from "@/components/common/AccentText";
import { useHeroSlides, type HeroSlide } from "@/templates/shared/useHomeContent";
import { Scallops } from "./parts";
import { FOCUS, tone } from "./lib";

/** Shown until the owner adds hero slides in admin (Online store > Homepage hero). Translation keys, read at render. */
const DEFAULT_SLIDES = [
  { tag: "tpl_single:hero.slide1.tag", title: "tpl_single:hero.slide1.title", subtitle: "tpl_single:hero.slide1.subtitle", cta: "tpl_single:hero.slide1.cta", link: "/shop" },
  { tag: "tpl_single:hero.slide2.tag", title: "tpl_single:hero.slide2.title", subtitle: "tpl_single:hero.slide2.subtitle", cta: "tpl_single:hero.slide2.cta", link: "/shop" },
  { tag: "tpl_single:hero.slide3.tag", title: "tpl_single:hero.slide3.title", subtitle: "tpl_single:hero.slide3.subtitle", cta: "tpl_single:hero.slide3.cta", link: "/deals" },
] as const;

/** Icon sets for the drawn artwork on slides without a photo. */
const ART: LucideIcon[][] = [
  [ToyBrick, Puzzle, Rabbit, Star],
  [Baby, Shirt, Heart, Milk],
  [Gift, Bike, Sparkles, ToyBrick],
];

const FRAME = "relative aspect-[2/1] w-full sm:aspect-[16/10] md:aspect-[4/3]";

/** Pastel blocks with toy icons, standing in for a photo. */
function DrawnArt({ index }: { index: number }) {
  const icons = ART[index % ART.length];
  return (
    <div className={cn(FRAME, "overflow-hidden rounded-[1.75rem] border-4 border-card bg-card/70 shadow-[0_24px_48px_-28px_hsl(var(--primary)/0.6)]")} aria-hidden="true">
      <div className="grid h-full grid-cols-4 grid-rows-2 gap-2.5 p-3 sm:gap-3 sm:p-4 md:grid-cols-2 md:grid-rows-2">
        {icons.map((Icon, i) => {
          const t = tone(index + i);
          return (
            <span key={i} className={cn("flex items-center justify-center rounded-2xl md:rounded-3xl", t.bg, i % 2 ? "rotate-2" : "-rotate-2", "max-md:row-span-2")}>
              <Icon className={cn("h-9 w-9 sm:h-12 sm:w-12 md:h-16 md:w-16", t.fg)} strokeWidth={1.6} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SlidePhoto({ slide, eager, index }: { slide: HeroSlide; eager: boolean; index: number }) {
  const [failed, setFailed] = useState(false);
  if (!slide.image || failed) return <DrawnArt index={index} />;
  return (
    <div className={cn(FRAME, "overflow-hidden rounded-[1.75rem] border-4 border-card bg-card shadow-[0_24px_48px_-28px_hsl(var(--primary)/0.6)]")}>
      <img src={slide.image} alt="" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} className="h-full w-full object-cover" />
    </div>
  );
}

function Slide({ slide, index }: { slide: HeroSlide; index: number }) {
  const { t } = useTranslation();
  const second = slide.link.startsWith("/deals") ? { label: t("tpl_single:nav.shopAll"), to: "/shop" } : { label: t("tpl_single:hero.giftIdeas"), to: "/deals" };
  return (
    <div className="grid h-full items-center gap-6 px-5 pb-12 pt-7 sm:px-10 md:grid-cols-[1.05fr_1fr] md:gap-10 md:px-14 md:pb-14 md:pt-12">
      <div className="min-w-0">
        {slide.tag && (
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            {slide.tag} <Heart className="h-4 w-4 text-highlight" aria-hidden="true" />
          </p>
        )}
        <h2 className="mt-2 font-display text-[34px] font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-[58px]">
          <AccentText text={slide.title} accentClassName="font-bold not-italic text-highlight" />
        </h2>
        {slide.subtitle && <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">{slide.subtitle}</p>}
        <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
          <Link to={slide.link} className={cn("inline-flex h-11 items-center gap-2 rounded-pill bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-[0_10px_20px_-10px_hsl(var(--primary))] transition-colors hover:bg-primary/90", FOCUS)}>
            {slide.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to={second.to} className={cn("inline-flex h-11 items-center rounded-pill border-2 border-[hsl(45_95%_60%)] bg-card px-6 text-sm font-extrabold text-foreground transition-colors hover:bg-tile-2 dark:hover:bg-tile-2/15", FOCUS)}>
            {second.label}
          </Link>
        </div>
      </div>
      <div className="relative min-w-0">
        <SlidePhoto slide={slide} eager={index === 0} index={index} />
        <span className="absolute -top-4 right-3 flex size-16 rotate-6 items-center justify-center rounded-full bg-primary text-center font-display text-sm font-semibold leading-tight text-primary-foreground shadow-lg sm:-top-6 sm:size-20 sm:text-base" aria-hidden="true">
          <Trans i18nKey="tpl_single:hero.newIn" />
        </span>
      </div>
    </div>
  );
}

/** Pink panel with scalloped edges: admin hero slides (or the built-in ones), autoplay, swipe, keys and dots. */
export default function HeroSlider() {
  const { t } = useTranslation();
  const hero = useHeroSlides();
  const { autoplayMs, isLoading } = hero;
  const defaults = useMemo<HeroSlide[]>(
    () => DEFAULT_SLIDES.map((s) => ({ tag: t(s.tag), title: t(s.title), subtitle: t(s.subtitle), cta: t(s.cta), link: s.link, image: null })),
    [t],
  );
  const slides = hero.slides.length > 0 ? hero.slides : defaults;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const playing = count > 1 && !stopped && !reducedMotion;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (!playing || hovered) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), Math.max(3000, autoplayMs));
    return () => window.clearInterval(timer);
  }, [playing, hovered, count, autoplayMs]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  return (
    <div className="container pt-5 sm:pt-7">
      <div className="relative mt-2 [--panel:hsl(var(--highlight-soft))] dark:[--panel:hsl(var(--highlight)/0.14)]">
        <Scallops edge="top" />
        <section
          aria-roledescription="carousel"
          aria-label={t("tpl_single:hero.label")}
          aria-busy={isLoading}
          className="relative overflow-hidden rounded-[2rem] bg-[color:var(--panel)]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(false); }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setHovered(true); }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            touchX.current = null;
            setHovered(false);
            if (start == null) return;
            const dx = e.changedTouches[0].clientX - start;
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(index + 1);
            if (e.key === "ArrowLeft") go(index - 1);
          }}
        >
          {/* Confetti */}
          <Star className="pointer-events-none absolute left-[46%] top-4 h-4 w-4 fill-[hsl(45_95%_60%)] text-[hsl(45_95%_60%)]" aria-hidden="true" />
          <Heart className="pointer-events-none absolute bottom-10 left-[44%] hidden h-4 w-4 text-highlight/60 md:block" aria-hidden="true" />
          <Sparkles className="pointer-events-none absolute right-3 top-1/2 hidden h-4 w-4 text-primary/50 lg:block" aria-hidden="true" />

          <div
            className={cn("flex transition-transform duration-500 ease-out motion-reduce:transition-none", isLoading && "opacity-0")}
            style={{ transform: `translateX(-${index * 100}%)` }}
            aria-live={playing && !hovered ? "off" : "polite"}
          >
            {slides.map((s, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={t("tpl_single:hero.slideOf", { index: i + 1, count })}
                aria-hidden={i !== index}
                // Off-screen slides leave the tab order (React 18 has no inert prop)
                ref={(el) => { if (el) el.toggleAttribute("inert", i !== index); }}
                className="w-full shrink-0"
              >
                <Slide slide={s} index={i} />
              </div>
            ))}
          </div>

          {count > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t("tpl_single:hero.goToSlide", { index: i + 1 })}
                  aria-current={i === index}
                  className={cn("h-2 rounded-full transition-all motion-reduce:transition-none", i === index ? "w-6 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/50", FOCUS)}
                />
              ))}
              {!reducedMotion && (
                <button
                  type="button"
                  onClick={() => setStopped((s) => !s)}
                  aria-label={stopped ? t("tpl_single:hero.play") : t("tpl_single:hero.pause")}
                  className={cn("ml-2 flex size-6 items-center justify-center rounded-full text-primary hover:bg-primary/10", FOCUS)}
                >
                  {stopped ? <Play className="h-3 w-3 fill-current" aria-hidden="true" /> : <Pause className="h-3 w-3 fill-current" aria-hidden="true" />}
                </button>
              )}
            </div>
          )}
        </section>
        <Scallops edge="bottom" />
      </div>
    </div>
  );
}
