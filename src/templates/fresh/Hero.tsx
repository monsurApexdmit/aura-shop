import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Apple, Carrot, Egg, Milk } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveCoupons, useHeroSlides, type HeroSlide } from "../shared/useHomeContent";
import { CouponCard, PromiseCard } from "./Offers";

const DEFAULT_SLIDE: HeroSlide = {
  tag: "Fresh every morning",
  title: "Fresh groceries, *delivered today*",
  subtitle: "Fruits, vegetables, dairy and daily needs at fair prices. Order in a minute, pay on delivery.",
  cta: "Start shopping",
  link: "/shop",
  image: null,
};

/** Renders *word* as the highlighted part of a headline. */
function AccentTitle({ text }: { text: string }) {
  const parts = text.split(/\*(.+?)\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 ? (
          <span key={i} className="box-decoration-clone rounded-xl bg-highlight px-2 text-highlight-foreground">{part}</span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function ProduceCluster({ compact }: { compact?: boolean }) {
  const items = [
    { Icon: Carrot, cls: "bg-tile-3 left-0 top-6 size-20 2xl:size-24" },
    { Icon: Apple, cls: "bg-tile-2 right-2 top-0 size-24 2xl:size-28" },
    { Icon: Milk, cls: "bg-tile-4 bottom-0 left-8 size-24 2xl:size-28" },
    { Icon: Egg, cls: "bg-tile-5 bottom-6 right-0 size-16 2xl:size-20" },
  ];
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute text-ink",
        compact ? "-bottom-12 -right-12 h-48 w-48 scale-[0.6] opacity-50" : "right-8 top-1/2 hidden h-64 w-64 -translate-y-1/2 xl:block 2xl:h-72 2xl:w-72",
      )}
    >
      {items.map(({ Icon, cls }, i) => (
        <span key={i} className={cn("absolute flex items-center justify-center rounded-full shadow-sm ring-4 ring-tile-1", cls)}>
          <Icon className="h-1/2 w-1/2" strokeWidth={1.75} />
        </span>
      ))}
    </div>
  );
}

function HeroPanel({ slide, compact, eager }: { slide: HeroSlide; compact?: boolean; eager?: boolean }) {
  const onPhoto = !!slide.image;
  return (
    <div className={cn("relative flex h-full overflow-hidden rounded-[2rem] bg-tile-1", onPhoto ? "text-white" : "text-ink")}>
      {onPhoto ? (
        <>
          <img src={slide.image!} alt="" loading={eager ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/0" />
        </>
      ) : (
        <ProduceCluster compact={compact} />
      )}
      <div className={cn("relative flex flex-col justify-center", compact ? "max-w-[85%] p-5" : "max-w-[68%] p-8 lg:p-12 xl:max-w-[55%]")}>
        {slide.tag && (
          <span className="mb-2 w-fit rounded-pill bg-highlight px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-highlight-foreground">
            {slide.tag}
          </span>
        )}
        <h2 className={cn("font-display font-extrabold leading-[1.02] tracking-tight", compact ? "text-[1.7rem]" : "text-4xl lg:text-[3.25rem]")}>
          <AccentTitle text={slide.title} />
        </h2>
        {slide.subtitle && (
          <p className={cn("mt-2 font-semibold", onPhoto ? "text-white/85" : "opacity-80", compact ? "line-clamp-2 text-sm" : "text-base lg:text-lg")}>
            {slide.subtitle}
          </p>
        )}
        <Link
          to={slide.link}
          className={cn(
            "mt-4 flex w-fit items-center gap-2 rounded-pill bg-primary font-extrabold text-primary-foreground shadow-md transition-transform hover:gap-3 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            compact ? "h-10 px-4 text-sm" : "h-12 px-6 text-base",
          )}
        >
          {slide.cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/** Desktop: rotating banner + two offer cards. Phones: one snap carousel of banners and offers. */
export default function Hero() {
  const { slides: adminSlides, autoplayMs, isLoading } = useHeroSlides();
  const coupons = useActiveCoupons();
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = adminSlides.length > 0 ? adminSlides : [DEFAULT_SLIDE];
  const active = slides[current % slides.length];

  useEffect(() => {
    if (slides.length < 2 || paused || reduceMotion) return;
    const t = window.setInterval(() => setCurrent((c) => (c + 1) % slides.length), Math.max(autoplayMs, 3000));
    return () => window.clearInterval(t);
  }, [slides.length, paused, reduceMotion, autoplayMs]);

  const side = [
    ...coupons.slice(0, 2).map((c) => ({ key: `c-${c.code}`, node: (cls: string) => <CouponCard coupon={c} className={cls} /> })),
    ...(["delivery", "cod"] as const).map((k) => ({ key: k, node: (cls: string) => <PromiseCard kind={k} className={cls} /> })),
  ].slice(0, 2);

  if (isLoading) {
    return (
      <div className="container pt-4 md:pt-6" aria-hidden="true">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="h-[210px] animate-pulse rounded-[2rem] bg-secondary md:h-[360px]" />
          <div className="hidden grid-rows-2 gap-4 md:grid">
            <div className="animate-pulse rounded-[2rem] bg-secondary" />
            <div className="animate-pulse rounded-[2rem] bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Featured" className="pt-4 md:pt-6">
      {/* Phones */}
      <ul className="container no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto md:hidden">
        {slides.map((s, i) => (
          <li key={`s-${i}`} className="h-[220px] w-[88%] shrink-0 snap-start">
            <HeroPanel slide={s} compact eager={i === 0} />
          </li>
        ))}
        {side.map(({ key, node }) => (
          <li key={key} className="h-[220px] w-[78%] shrink-0 snap-start">{node("h-full")}</li>
        ))}
      </ul>

      {/* md and up */}
      <div className="container hidden gap-4 md:grid md:grid-cols-[2fr_1fr] lg:gap-5">
        <div
          className="relative h-[340px] lg:h-[400px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={current % slides.length}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <HeroPanel slide={active} eager />
            </motion.div>
          </AnimatePresence>
          {slides.length > 1 && (
            <div className="absolute bottom-5 right-6 flex gap-1.5 rounded-pill bg-card/80 p-1.5 backdrop-blur">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Show banner ${i + 1}: ${s.title.replace(/\*/g, "")}`}
                  aria-current={i === current % slides.length}
                  className={cn(
                    "h-2.5 rounded-pill transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    i === current % slides.length ? "w-7 bg-primary" : "w-2.5 bg-foreground/25 hover:bg-foreground/45",
                  )}
                />
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-rows-2 gap-4 lg:gap-5">
          {side.map(({ key, node }) => <div key={key} className="min-h-0">{node("h-full")}</div>)}
        </div>
      </div>
    </section>
  );
}
