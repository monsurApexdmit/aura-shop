import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AccentText } from "@/components/common/AccentText";
import { useHeroSlides, type HeroSlide } from "@/templates/shared/useHomeContent";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { EYEBROW, FOCUS } from "./lib";

const EASE = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/** Full-screen campaign image; several slides crossfade slowly. The header floats over it. */
export default function Hero() {
  const { slides, autoplayMs, isLoading } = useHeroSlides();
  const { storeName } = useStoreChrome();
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % count), Math.max(3000, autoplayMs));
    return () => clearInterval(t);
  }, [count, paused, reduceMotion, autoplayMs]);

  useEffect(() => {
    if (current >= count && count > 0) setCurrent(0);
  }, [count, current]);

  if (isLoading) {
    return (
      <section aria-label="Featured" className="relative h-[100svh] min-h-[520px] w-full overflow-hidden bg-tile-4">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />
      </section>
    );
  }

  if (count === 0) return <FallbackHero storeName={storeName} />;

  const slide = slides[Math.min(current, count - 1)];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[100svh] min-h-[520px] w-full overflow-hidden bg-tile-4 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          {slide.image ? (
            <motion.img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover"
              initial={reduceMotion ? false : { scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
            />
          ) : (
            <TileCollage />
          )}
        </motion.div>
      </AnimatePresence>

      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="container pb-14 md:pb-20">
          <SlideCopy key={current} slide={slide} />
        </div>
      </div>

      {count > 1 && (
        <div className="absolute bottom-5 right-4 flex items-center gap-1 md:bottom-8 md:right-8">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setCurrent((c) => (c - 1 + count) % count)}
            className={cn("hidden h-9 px-2 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white sm:block", FOCUS)}
          >
            Prev
          </button>
          <p className="px-2 text-[11px] tracking-[0.2em] tabular-nums" aria-live="polite">
            {pad(current + 1)} <span className="text-white/50">/ {pad(count)}</span>
          </p>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setCurrent((c) => (c + 1) % count)}
            className={cn("h-9 px-2 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white", FOCUS)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

function SlideCopy({ slide }: { slide: HeroSlide }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
      className="max-w-4xl"
    >
      {slide.tag && <p className={cn(EYEBROW, "mb-4 text-white/85 md:mb-6")}>{slide.tag}</p>}
      <h1 className="break-words font-display text-5xl font-normal leading-[0.95] tracking-tight md:text-8xl">
        <AccentText text={slide.title} accentClassName="font-normal italic" />
      </h1>
      {slide.subtitle && <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85 md:mt-7 md:text-base">{slide.subtitle}</p>}
      <Link
        to={slide.link}
        className="mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent md:mt-10"
      >
        {slide.cta === "Shop now" ? "Discover" : slide.cta} <span aria-hidden="true">→</span>
      </Link>
    </motion.div>
  );
}

/** Abstract campaign "photograph" from the theme's muted tile colours. */
function TileCollage() {
  return (
    <div aria-hidden="true" className="absolute inset-0 grid grid-cols-12 grid-rows-6 bg-tile-4">
      <div className="col-span-7 row-span-6 bg-tile-2" />
      <div className="col-span-5 row-span-4 bg-tile-1" />
      <div className="col-span-5 row-span-2 bg-tile-5" />
      <div className="absolute left-[18%] top-[22%] h-[46%] w-[34%] bg-tile-3 md:left-[30%] md:w-[22%]" />
    </div>
  );
}

/** No slides yet: a designed placeholder rather than an empty screen. */
function FallbackHero({ storeName }: { storeName: string }) {
  return (
    <section aria-label="Featured" className="relative h-[100svh] min-h-[520px] w-full overflow-hidden text-white">
      <TileCollage />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="container pb-14 md:pb-20">
          <SlideCopy
            slide={{
              tag: `${storeName || "The house"} — New season`,
              title: "The *new* collection",
              subtitle: "Quiet pieces, considered cuts and materials made to be kept.",
              cta: "Discover",
              link: "/shop",
              image: null,
            }}
          />
        </div>
      </div>
    </section>
  );
}
