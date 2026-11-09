import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccentText } from "@/components/common/AccentText";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeroSlides, type HeroSlide } from "@/templates/shared/useHomeContent";
import { FOCUS } from "./lib";

const FRAME = "relative aspect-[16/8] w-full overflow-hidden rounded-lg sm:aspect-[16/7] lg:aspect-auto lg:h-full lg:min-h-[340px]";

/** Designed ink banner for slides without a photo, and for stores with no slides yet. */
function InkBanner({ tag, title, subtitle, cta, link, secondary }: Omit<HeroSlide, "image"> & { secondary?: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center overflow-hidden bg-ink px-5 text-ink-foreground sm:px-10">
      {/* Graphic: stacked raspberry discs and a grid of dots, all from tokens */}
      <span aria-hidden="true" className="absolute -right-16 -top-20 size-64 rounded-full bg-highlight/80 sm:-right-10 sm:size-80" />
      <span aria-hidden="true" className="absolute -bottom-24 right-16 size-56 rounded-full border-[28px] border-ink-foreground/10 sm:right-40" />
      <span aria-hidden="true" className="absolute right-6 top-1/2 hidden -translate-y-1/2 grid-cols-6 gap-2 sm:grid">
        {Array.from({ length: 24 }, (_, i) => <span key={i} className="size-1.5 rounded-full bg-ink-foreground/25" />)}
      </span>
      <div className="relative z-10 max-w-[75%] sm:max-w-md">
        {tag && (
          <span className="mb-2 inline-flex items-center gap-1 rounded-sm bg-highlight px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-highlight-foreground sm:text-xs">
            <Flame className="h-3 w-3" aria-hidden="true" /> {tag}
          </span>
        )}
        <p className="font-display text-xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
          <AccentText text={title} accentClassName="not-italic text-highlight-soft" />
        </p>
        {subtitle && <p className="mt-1.5 line-clamp-2 text-xs text-ink-foreground/75 sm:mt-3 sm:text-base">{subtitle}</p>}
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-5">
          <Link to={link} className={cn("inline-flex h-8 items-center gap-1.5 rounded-md bg-highlight px-3 text-xs font-bold text-highlight-foreground hover:bg-highlight/90 sm:h-10 sm:px-5 sm:text-sm", FOCUS)}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" /> {cta}
          </Link>
          {secondary && (
            <Link to="/deals" className={cn("inline-flex h-8 items-center rounded-md border border-ink-foreground/30 px-3 text-xs font-semibold text-ink-foreground hover:bg-ink-foreground/10 sm:h-10 sm:px-5 sm:text-sm", FOCUS)}>
              Today's deals
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SlideView({ slide, eager }: { slide: HeroSlide; eager: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!slide.image || failed) return <InkBanner {...slide} />;
  return (
    <Link to={slide.link} className="group relative block h-full w-full outline-none" aria-label={`${slide.title.replace(/\*/g, "")} – ${slide.cta}`}>
      <img src={slide.image} alt="" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} className="h-full w-full object-cover" />
      {/* Photos keep the admin's words on a dark fade so they stay readable */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
      <span className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center px-5 text-white sm:px-10">
        {slide.tag && <span className="mb-1.5 w-fit rounded-sm bg-highlight px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-highlight-foreground sm:text-xs">{slide.tag}</span>}
        <span className="font-display text-lg font-extrabold leading-tight sm:text-3xl lg:text-4xl">
          <AccentText text={slide.title} accentClassName="not-italic text-highlight-soft" />
        </span>
        {slide.subtitle && <span className="mt-1 line-clamp-2 text-xs text-white/85 sm:mt-2 sm:text-base">{slide.subtitle}</span>}
        <span className="mt-2.5 inline-flex h-8 w-fit items-center rounded-md bg-white px-3 text-xs font-bold text-black transition-colors group-hover:bg-white/90 group-focus-visible:ring-2 group-focus-visible:ring-highlight sm:mt-4 sm:h-10 sm:px-5 sm:text-sm">
          {slide.cta} →
        </span>
      </span>
    </Link>
  );
}

const DEFAULT_SLIDE: Omit<HeroSlide, "image"> = {
  tag: "Mega savings",
  title: "Everything you need, *one place*",
  subtitle: "Thousands of products, fast delivery and cash on delivery across the country.",
  cta: "Start shopping",
  link: "/shop",
};

/** Admin hero slides as image banners: autoplay, swipe, arrows and dots. */
export default function HeroSlider() {
  const { slides, autoplayMs, isLoading } = useHeroSlides();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), Math.max(2500, autoplayMs));
    return () => window.clearInterval(t);
  }, [count, paused, autoplayMs]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  if (isLoading) return <Skeleton className={FRAME} />;
  if (count === 0) {
    return (
      <div className={FRAME}>
        <InkBanner {...DEFAULT_SLIDE} secondary />
      </div>
    );
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className={cn(FRAME, "bg-secondary")}
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
      <div className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            // Off-screen slides leave the tab order (React 18 has no inert prop)
            ref={(el) => { if (el) el.toggleAttribute("inert", i !== index); }}
            className="h-full w-full shrink-0"
          >
            <SlideView slide={s} eager={i === 0} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className={cn("absolute left-2 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-foreground shadow hover:bg-card sm:flex", FOCUS)}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className={cn("absolute right-2 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-foreground shadow hover:bg-card sm:flex", FOCUS)}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:bottom-3">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-highlight" : "w-1.5 bg-white/70 hover:bg-white", FOCUS)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
