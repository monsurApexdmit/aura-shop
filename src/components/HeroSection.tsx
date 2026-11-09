import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import storefrontSettingsApi from "@/services/storefrontSettingsApi";
import { getImageUrl } from "@/lib/api";
import { useProducts } from "@/hooks/useProducts";
import { useShopNavLinks } from "@/hooks/useHomepageSections";
import { mapApiProduct } from "@/lib/mappers";
import { PASTELS } from "@/lib/pastels";
import { AccentText } from "@/components/common/AccentText";

// Three tilted photo cards; each falls back to a pastel tile with an emoji.
const COLLAGE = [
  { tone: PASTELS[0], emoji: "👗", className: "right-[2%] top-0 w-[46%] rotate-[5deg]" },
  { tone: PASTELS[1], emoji: "👔", className: "left-[4%] top-[24%] w-[38%] -rotate-6" },
  { tone: PASTELS[2], emoji: "🧸", className: "right-[8%] bottom-0 w-[34%] -rotate-3" },
];

interface HeroCopy {
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image?: string;
}

// Shown until a hero slide is enabled in admin (Online store > Homepage hero).
const DEFAULT_COPY: HeroCopy = {
  tag: "The new season is here",
  title: "Wear the\n*happy* stuff.",
  subtitle: "Color-forward clothing for women, men and the kids who set the tone.",
  cta: "Shop the drop",
  link: "/shop",
};

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  // Second button: the first shop aisle (admin aisle card, matching category, or top-level category).
  const firstAisle = useShopNavLinks()[0];
  const { data: hero } = useQuery({
    queryKey: ["homepage-hero"],
    queryFn: storefrontSettingsApi.getHomepageHero,
    staleTime: 1000 * 60 * 10,
  });
  const { data } = useProducts({ limit: 8 });

  const slides = useMemo<HeroCopy[]>(
    () => (hero?.slides ?? [])
      .filter((s) => s.enabled && s.title.trim())
      .map((s) => ({
        tag: s.tag,
        title: s.title,
        subtitle: s.subtitle,
        cta: s.cta || "Shop now",
        link: s.link || "/shop",
        image: s.imagePath ? getImageUrl(s.imagePath) : undefined,
      })),
    [hero]
  );
  const [active, setActive] = useState(0);
  const current = slides[active] ?? slides[0] ?? DEFAULT_COPY;
  const autoplayMs = hero?.autoplayMs ?? 6000;

  useEffect(() => {
    if (slides.length < 2 || reduceMotion) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), autoplayMs);
    return () => clearInterval(id);
  }, [slides.length, autoplayMs, reduceMotion, active]);

  // The active slide's photo leads the collage, then other slide photos, then product photos.
  const images = useMemo(() => {
    const productImages = (data?.data ?? []).map(mapApiProduct).map((p) => p.image).filter((src) => !src.includes("placeholder"));
    const slideImages = slides.map((s) => s.image).filter((src): src is string => !!src);
    return Array.from(new Set([current.image, ...slideImages, ...productImages].filter((src): src is string => !!src))).slice(0, 3);
  }, [data, slides, current.image]);

  // Phone cover: each slide brings its own photo (falls back to product photos).
  const cards = useMemo(() => (slides.length > 0 ? slides : [DEFAULT_COPY]), [slides]);
  const cardImages = useMemo(() => {
    const productImages = (data?.data ?? []).map(mapApiProduct).map((p) => p.image).filter((src) => !src.includes("placeholder"));
    return cards.map((c, i) => c.image ?? productImages[i % Math.max(productImages.length, 1)]);
  }, [cards, data]);
  // Swipe left/right on the cover to change slide.
  const onSwipe = (dx: number) => {
    if (cards.length < 2 || Math.abs(dx) < 40) return;
    setActive((i) => (i + (dx < 0 ? 1 : -1) + cards.length) % cards.length);
  };
  const cover = cards[active] ?? cards[0];

  return (
    <>
    {/* Phones: a full-bleed cover card. Photo fills the card, copy sits on a dark fade at the bottom,
        story-style progress bars on top. Without a photo the card is a pastel tile with dark text. */}
    <section className="px-4 pb-6 pt-4 md:hidden" aria-roledescription={cards.length > 1 ? "carousel" : undefined}>
      <motion.div
        drag={cards.length > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => onSwipe(info.offset.x)}
        className={cn(
          "relative isolate flex aspect-[4/5] max-h-[calc(100dvh-13rem)] min-h-[420px] w-full touch-pan-y flex-col overflow-hidden rounded-[28px] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]",
          PASTELS[active % PASTELS.length]
        )}
      >
        {cardImages[active] ? (
          <>
            <motion.img
              key={cardImages[active]}
              src={cardImages[active]}
              alt=""
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 -z-10 h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-black/10" aria-hidden="true" />
          </>
        ) : (
          <span className="absolute inset-x-0 top-[14%] -z-10 text-center text-[7rem] leading-none" aria-hidden="true">
            {COLLAGE[active % COLLAGE.length].emoji}
          </span>
        )}

        {/* Top: progress bars + tag */}
        <div className="p-4">
          {cards.length > 1 && (
            <div className="mb-3 flex gap-1" role="group" aria-label="Choose slide">
              {cards.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show slide ${i + 1}: ${c.title.replace(/\*/g, "")}`}
                  aria-current={i === active || undefined}
                  onClick={() => setActive(i)}
                  className="flex h-4 flex-1 items-center"
                >
                  <span className={cn(
                    "block h-[3px] w-full rounded-full transition-colors",
                    cardImages[active] ? (i === active ? "bg-white" : "bg-white/35") : (i === active ? "bg-neutral-950" : "bg-neutral-950/20")
                  )} />
                </button>
              ))}
            </div>
          )}
          <span className={cn(
            "inline-flex max-w-full items-center gap-1.5 truncate rounded-pill px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]",
            cardImages[active] ? "bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md" : "bg-white/70 text-neutral-950"
          )}>
            <span className="size-1.5 shrink-0 rounded-full bg-highlight" aria-hidden="true" />
            {cover.tag || "New season"}
          </span>
        </div>

        {/* Bottom: headline, subtitle, CTA */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={cn("mt-auto p-5 pt-0", cardImages[active] ? "text-white" : "text-neutral-950")}
        >
          <h1 className="line-clamp-3 pb-1 font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.02em]">
            <AccentText text={cover.title} accentClassName={cn("italic", cardImages[active] ? "text-highlight-soft" : "text-highlight")} />
          </h1>
          {cover.subtitle && (
            <p className={cn("mt-2 line-clamp-2 text-[13px] leading-snug", cardImages[active] ? "text-white/80" : "text-neutral-950/70")}>{cover.subtitle}</p>
          )}
          <Link
            to={cover.link}
            className={cn(
              "mt-4 flex h-12 w-full items-center justify-between rounded-pill pl-5 pr-1.5 text-xs font-bold uppercase tracking-[0.14em] active:scale-[0.98]",
              cardImages[active] ? "bg-white text-neutral-950" : "bg-ink text-ink-foreground"
            )}
          >
            {cover.cta}
            <span className="flex size-9 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>

    <section className="hidden border-b border-border md:block" aria-roledescription={slides.length > 1 ? "carousel" : undefined}>
      <div className="container grid items-center gap-6 py-8 sm:gap-10 sm:py-12 md:py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div>
          <motion.div
            key={slides.length ? active : "default"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {current.tag && (
              <span className="inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1 text-xs font-medium text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-highlight" aria-hidden="true" />
                {current.tag}
              </span>
            )}
            <h1 className="mt-5 font-display text-[2.75rem] sm:mt-6 sm:text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground md:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <AccentText text={current.title} accentClassName="text-highlight" />
            </h1>
            {current.subtitle && (
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">{current.subtitle}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <Button asChild size="lg" className="h-11 rounded-pill px-6 sm:h-12 sm:px-7 font-semibold">
                <Link to={current.link}>{current.cta} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              {firstAisle && firstAisle.to !== current.link && (
                <Button asChild size="lg" variant="outline" className="h-11 rounded-pill border-2 border-foreground px-6 sm:h-12 sm:px-7 font-semibold">
                  <Link to={firstAisle.to}>Shop {firstAisle.label}</Link>
                </Button>
              )}
            </div>
          </motion.div>

          {slides.length > 1 && (
            <div className="mt-8 flex items-center gap-2" role="group" aria-label="Choose slide">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show slide ${i + 1}: ${s.title.replace(/\*/g, "")}`}
                  aria-current={i === active || undefined}
                  onClick={() => setActive(i)}
                  className="flex h-6 items-center"
                >
                  <span className={cn("block h-1.5 rounded-full transition-all", i === active ? "w-8 bg-foreground" : "w-3 bg-foreground/25")} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative mx-auto h-[250px] w-full max-w-[320px] sm:h-[420px] sm:max-w-[520px] lg:h-[480px]" aria-hidden="true">
          {COLLAGE.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className={cn("absolute aspect-[4/5] overflow-hidden rounded-2xl shadow-xl sm:rounded-3xl", card.tone, card.className)}
            >
              {images[i] ? (
                <img key={images[i]} src={images[i]} alt="" className="h-full w-full object-cover animate-in fade-in duration-500" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-5xl sm:text-7xl">{card.emoji}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
