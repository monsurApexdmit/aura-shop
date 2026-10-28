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

  return (
    <section className="border-b border-border" aria-roledescription={slides.length > 1 ? "carousel" : undefined}>
      <div className="container grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div>
          <motion.div
            key={slides.length ? active : "default"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {current.tag && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-highlight" aria-hidden="true" />
                {current.tag}
              </span>
            )}
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <AccentText text={current.title} accentClassName="text-highlight" />
            </h1>
            {current.subtitle && (
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">{current.subtitle}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-7 font-semibold">
                <Link to={current.link}>{current.cta} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              {firstAisle && firstAisle.to !== current.link && (
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-2 border-foreground px-7 font-semibold">
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

        <div className="relative mx-auto h-[340px] w-full max-w-[520px] sm:h-[420px] lg:h-[480px]" aria-hidden="true">
          {COLLAGE.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className={cn("absolute aspect-[4/5] overflow-hidden rounded-3xl shadow-xl", card.tone, card.className)}
            >
              {images[i] ? (
                <img key={images[i]} src={images[i]} alt="" className="h-full w-full object-cover animate-in fade-in duration-500" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-6xl sm:text-7xl">{card.emoji}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
