import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Flame, SearchX } from "lucide-react";
import { useProductPage } from "../shared/useProductPage";
import { useHeroSlides, useHomeProducts, useProductList } from "../shared/useHomeContent";
import type { Product } from "@/types/product";
import Countdown from "./Countdown";
import Footer from "./Footer";
import LandingHero from "./LandingHero";
import { Benefits, Description, Faq, Gallery, Reviews } from "./LandingSections";
import OrderSection from "./OrderSection";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";
import StickyOrderBar, { STICKY_BAR_SPACER } from "./StickyOrderBar";
import { HeroSkeleton } from "./HeroSkeleton";
import { scrollToSection } from "./scroll";

/** Other products in the store for "More from us": the homepage pick first, then the latest. */
function useMoreProducts(currentId: string | undefined) {
  const home = useHomeProducts();
  const latest = useProductList("latest", { limit: 6 });
  return useMemo(() => {
    const seen = new Set<string>(currentId ? [currentId] : []);
    const out: Product[] = [];
    for (const p of [...home.products, ...latest.products]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
    return out.slice(0, 4);
  }, [home.products, latest.products, currentId]);
}

/** The whole store as one landing page for a product; Home and the product page both render it. */
export default function Landing({ slug }: { slug: string }) {
  const page = useProductPage(slug);
  const { slides } = useHeroSlides();
  const { hash } = useLocation();
  const ready = page.status === "ready";
  const more = useMoreProducts(ready ? page.product.id : undefined);

  // Header links from other pages land here as /#order etc.: scroll once the sections exist.
  useEffect(() => {
    if (!ready || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const t = window.setTimeout(() => scrollToSection(id), 350);
    return () => window.clearTimeout(t);
  }, [ready, hash]);

  if (page.status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <HeroSkeleton />
      </div>
    );
  }

  if (page.status !== "ready") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
          <span className="flex size-20 items-center justify-center rounded-[1.75rem] bg-tile-3 text-ink">
            <SearchX className="size-9" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">This product isn't here</h1>
          <p className="mt-3 max-w-md text-muted-foreground">It may have sold out or moved. Have a look at everything else we have.</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-pill bg-highlight px-7 font-bold text-highlight-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Browse the shop <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { currentStock, inStock, formatCurrency, currentPrice, originalPrice, discount } = page;
  const lowStock = inStock && currentStock <= 20;

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <LandingHero page={page} slide={slides[0]} />

      {/* Urgency */}
      <section aria-label="Limited time offer" className="bg-ink text-ink-foreground">
        <div className="container flex flex-col items-center justify-center gap-3 py-4 sm:flex-row sm:gap-6 sm:py-5">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
            <Flame className="size-4 text-highlight-soft" aria-hidden="true" />
            Offer ends in
          </p>
          <Countdown />
          {lowStock && (
            <p className="rounded-pill bg-highlight px-4 py-1.5 text-sm font-bold text-highlight-foreground">
              Hurry — only {currentStock} left
            </p>
          )}
        </div>
      </section>

      <Benefits />
      <Gallery page={page} />
      <Description page={page} />
      <Reviews page={page} />
      <Faq />
      <OrderSection page={page} slug={page.product.slug} />

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="py-14 md:py-20">
          <div className="container">
            <SectionHeading id="more-title" eyebrow="More from us" title="You might also *like*" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {more.map((p, i) => <ProductCard key={p.id} product={p} index={i + 1} />)}
            </div>
            <div className="mt-8 text-center">
              <Link to="/shop" className="inline-flex h-12 items-center gap-2 rounded-pill border-2 border-border px-6 text-sm font-bold text-foreground transition hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                See everything <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
      {/* Keeps the footer clear of the phone order bar */}
      <div aria-hidden="true" className={`bg-secondary ${STICKY_BAR_SPACER}`} />
      <StickyOrderBar
        price={formatCurrency(currentPrice)}
        originalPrice={originalPrice ? formatCurrency(originalPrice) : null}
        discount={discount}
      />
    </div>
  );
}
