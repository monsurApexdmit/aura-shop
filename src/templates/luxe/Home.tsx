import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { AccentText } from "@/components/common/AccentText";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useCategories } from "@/hooks/useCategories";
import { useCollections } from "@/hooks/useCollections";
import { SOURCE_LINK, useHomeProducts } from "@/templates/shared/useHomeContent";
import type { ApiCollection } from "@/services/collectionApi";
import Hero from "./Hero";
import Footer from "./Footer";
import Newsletter from "./Newsletter";
import { LuxeCard } from "./ProductCard";
import { EYEBROW, FOCUS, TEXT_LINK, hasPhoto, tile } from "./lib";

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.1, ease: EASE },
} as const;

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <Hero />
      <Intro />
      <NewIn />
      <Lookbook />
      <Aisles />
      <Collections />
      <JoinTheList />
      <Footer />
    </div>
  );
}

/** Section heading: small capitals on a hairline rule, optional text link on the right. */
function SectionHead({ title, link, linkLabel = "View all" }: { title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-3 md:mb-12">
      <h2 className={cn(EYEBROW, "text-foreground")}>{title}</h2>
      {link && (
        <Link to={link} className={cn(TEXT_LINK, "shrink-0 no-underline hover:underline")}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function Intro() {
  const { data: sections } = useHomepageSections();
  const text = sections?.footer?.tagline?.trim() || "Pieces chosen slowly, made with care and meant to be *kept* — season after season.";
  return (
    <section className="container py-24 md:py-40">
      <motion.p {...fadeIn} className="mx-auto max-w-4xl text-balance text-center font-display text-2xl font-normal leading-snug sm:text-3xl md:text-[2.75rem] md:leading-[1.25]">
        <AccentText text={text} accentClassName="font-normal italic" />
      </motion.p>
      <div aria-hidden="true" className="mx-auto mt-10 h-12 w-px bg-border md:mt-14 md:h-16" />
    </section>
  );
}

function NewIn() {
  const { enabled, title, source, products, isLoading } = useHomeProducts();
  if (!enabled) return null;
  if (!isLoading && products.length === 0) return null;
  // The lead tile needs enough neighbours to fill its two rows.
  const editorial = products.length >= 5;

  return (
    <section className="container pb-24 md:pb-36">
      <SectionHead title={title || "New in"} link={SOURCE_LINK[source] ?? "/shop"} />
      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <Skeleton className="mt-4 h-3 w-3/4 rounded-none" />
              <Skeleton className="mt-2 h-3 w-1/3 rounded-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
          {products.map((p, i) => (
            <div key={p.id} className={cn("min-w-0", editorial && i === 0 && "col-span-2 md:row-span-2")}>
              <LuxeCard product={p} index={i} featured={editorial && i === 0} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const LOOKBOOK_DEFAULT = {
  tag: "The lookbook",
  title: "Dressed in *quiet* light",
  text: "Soft tailoring, honest fabrics and a palette borrowed from early mornings. A wardrobe that does not ask for attention — it simply holds it.",
  cta: "Explore the edit",
  link: "/shop",
};

function Lookbook() {
  const { data: sections, isLoading } = useHomepageSections();
  const { products } = useHomeProducts();
  const custom = sections?.lookbook;

  const images = useMemo(() => {
    const own = custom ? custom.images.map((p) => getImageUrl(p)) : [];
    const rest = products.map((p) => p.image);
    return Array.from(new Set([...own, ...rest].filter(hasPhoto))).slice(0, 2);
  }, [custom, products]);

  if (isLoading) return null;
  if (custom && !custom.enabled) return null;
  const copy = custom ?? LOOKBOOK_DEFAULT;

  return (
    <section className="pb-24 md:pb-36">
      <div className="grid md:grid-cols-12 md:items-center">
        <motion.div {...fadeIn} className={cn("relative aspect-[4/5] overflow-hidden md:col-span-7 md:aspect-auto md:h-[92svh] md:max-h-[980px]", tile(1))}>
          {images[0] && <img src={images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />}
        </motion.div>

        <div className="relative px-4 md:col-span-5 md:px-12 lg:px-20">
          {/* Second photo overlaps the first: up on phones, sideways from md */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.2 }}
            className={cn(
              "relative z-10 -mt-24 ml-auto aspect-[3/4] w-[46%] overflow-hidden border-[6px] border-background md:-ml-[45%] md:mb-12 md:mt-0 md:w-[62%] md:border-[10px]",
              tile(3),
            )}
          >
            {images[1] && <img src={images[1]} alt="" loading="lazy" className="h-full w-full object-cover" />}
          </motion.div>

          <motion.div {...fadeIn} className="mt-10 max-w-md md:mt-0">
            {copy.tag && <p className={cn(EYEBROW, "mb-5 text-muted-foreground")}>{copy.tag}</p>}
            <h2 className="break-words font-display text-4xl font-normal leading-[1.05] md:text-5xl lg:text-6xl">
              <AccentText text={copy.title} accentClassName="font-normal italic" />
            </h2>
            {copy.text && <p className="mt-6 text-sm leading-relaxed text-muted-foreground md:text-base">{copy.text}</p>}
            <Link to={copy.link || "/shop"} className={cn(TEXT_LINK, "mt-8")}>
              {copy.cta || LOOKBOOK_DEFAULT.cta} <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface Tile {
  key: string;
  label: string;
  to: string;
  image: string | null;
}

function Aisles() {
  const { data: sections, isLoading } = useHomepageSections();
  const { data: categories = [] } = useCategories();
  const aisles = sections?.aisles;

  const tiles = useMemo<Tile[]>(() => {
    if (aisles?.enabled && aisles.items.length > 0) {
      return aisles.items.map((a) => ({ key: a.id, label: a.label, to: a.link || "/shop", image: a.imagePath ? getImageUrl(a.imagePath) : null }));
    }
    // Categories with photos first, so the three tiles carry pictures when the catalogue has them.
    const sorted = [...categories].sort((a, b) => Number(!!b.image) - Number(!!a.image));
    return sorted.map((c) => ({ key: String(c.id), label: c.name, to: `/shop?cat=${c.slug}`, image: c.image ? getImageUrl(c.image) : null }));
  }, [aisles, categories]).slice(0, 3);

  if (isLoading || (aisles && !aisles.enabled) || tiles.length === 0) return null;

  return (
    <section className="container pb-24 md:pb-36">
      <SectionHead title={(aisles?.enabled && aisles.title) || "Shop by category"} link="/categories" linkLabel="All categories" />
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
        {tiles.map((t, i) => (
          <motion.div
            key={t.key}
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: i * 0.12 }}
            className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto"
          >
            <AisleTile tile={t} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AisleTile({ tile: t, index }: { tile: Tile; index: number }) {
  const [failed, setFailed] = useState(false);
  const photo = !failed && hasPhoto(t.image);
  return (
    <Link to={t.to} className={cn("group relative block aspect-[3/4] overflow-hidden", tile(index), FOCUS)}>
      {photo && (
        <>
          <img
            src={t.image!}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform [transition-duration:1800ms] ease-out group-hover:scale-[1.06]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/25 transition-colors duration-700 group-hover:bg-black/35" />
        </>
      )}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center p-6 text-center", photo ? "text-white" : "text-foreground")}>
        <h3 className="font-display text-3xl font-normal leading-tight transition-all duration-500 group-hover:italic md:text-4xl">{t.label}</h3>
        <span className="mt-4 text-[11px] uppercase tracking-[0.2em] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          Shop now
        </span>
      </div>
    </Link>
  );
}

function Collections() {
  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const { data: collections = [], isLoading } = useCollections();
  const scroller = useRef<HTMLDivElement>(null);
  const custom = sections?.collections;
  const featured = collections.filter((c) => c.showOnHomepage);
  const list = (featured.length > 0 ? featured : collections).slice(0, 8);

  if (sectionsLoading || isLoading) return null;
  if ((custom && !custom.enabled) || list.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="pb-24 md:pb-36">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-3 md:mb-12">
          <h2 className={cn(EYEBROW, "text-foreground")}>{custom?.title || "Collections"}</h2>
          <div className="flex items-center gap-4">
            {list.length > 2 && (
              <div className="hidden items-center gap-1 md:flex">
                <button type="button" aria-label="Scroll collections left" onClick={() => scrollBy(-1)} className={cn("flex h-8 w-8 items-center justify-center hover:opacity-60", FOCUS)}>
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
                </button>
                <button type="button" aria-label="Scroll collections right" onClick={() => scrollBy(1)} className={cn("flex h-8 w-8 items-center justify-center hover:opacity-60", FOCUS)}>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
                </button>
              </div>
            )}
            <Link to="/collections" className={cn(TEXT_LINK, "shrink-0 no-underline hover:underline")}>View all</Link>
          </div>
        </div>
      </div>
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4 md:gap-6 md:px-6 md:scroll-px-6 lg:px-8 lg:scroll-px-8"
      >
        {list.map((c, i) => (
          <CollectionTile key={c.id} collection={c} index={i} />
        ))}
      </div>
    </section>
  );
}

function CollectionTile({ collection, index }: { collection: ApiCollection; index: number }) {
  const [failed, setFailed] = useState(false);
  const src = collection.imageUrl || collection.coverImageUrl;
  const image = src && !failed ? getImageUrl(src) : null;
  return (
    <Link
      to={`/collections/${collection.slug}`}
      className={cn("group block w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]", FOCUS)}
    >
      <div className={cn("relative aspect-[4/5] overflow-hidden", tile(index + 2))}>
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform [transition-duration:1800ms] ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-7xl italic text-foreground/20">
            {collection.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate font-display text-xl font-normal md:text-2xl">{collection.name}</h3>
        <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {collection.productCount} {collection.productCount === 1 ? "piece" : "pieces"}
        </span>
      </div>
    </Link>
  );
}

function JoinTheList() {
  return (
    <section className="border-t border-border">
      <motion.div {...fadeIn} className="container max-w-2xl py-24 text-center md:py-36">
        <p className={cn(EYEBROW, "text-muted-foreground")}>Newsletter</p>
        <h2 className="mt-5 font-display text-4xl font-normal md:text-6xl">
          Join the <em className="italic">list</em>
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          First sight of new arrivals, private sales and stories from the studio.
        </p>
        <Newsletter className="mx-auto mt-10 max-w-md text-left" />
      </motion.div>
    </section>
  );
}
