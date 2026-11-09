import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AccentText } from "@/components/common/AccentText";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { SOURCE_LINK, useHomeProducts, useProductList } from "@/templates/shared/useHomeContent";
import HomeHero from "./HomeHero";
import { CategoryGrid, CollectionBanners, FlashSale, ServiceStrip, Vouchers } from "./HomeSections";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import { FOCUS } from "./lib";

const GRID = "grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
const STEP = 12;

/** Endless-feeling product feed: the admin's homepage product block, with "Load more". */
function JustForYou() {
  const home = useHomeProducts();
  const { data: sections } = useHomepageSections();
  const baseLimit = sections?.products?.limit ?? 8;
  const categoryId = sections?.products?.categoryId ?? null;
  // null until the shopper asks for more; then a bigger list replaces the first one
  const [limit, setLimit] = useState<number | null>(null);
  const asked = limit ?? baseLimit;
  const more = useProductList(home.source, { limit: asked, categoryId, enabled: limit != null });
  // The list keeps showing the previous page while the bigger one loads, so watch the fetch itself
  const fetching = useIsFetching({ queryKey: home.source === "latest" ? ["products", { limit: asked }] : ["deals", home.source, asked] });

  if (!home.enabled) return null;
  const products = limit != null && more.products.length > 0 ? more.products : home.products;
  const loadingMore = limit != null && (more.isLoading || fetching > 0);
  const hasMore = loadingMore || products.length >= asked;
  const title = home.title || "Just for you";

  if (!home.isLoading && home.products.length === 0) return null;

  return (
    <section aria-labelledby="mk-feed" className="container">
      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <h2 id="mk-feed" className="flex items-center gap-2 font-display text-lg font-bold text-foreground sm:text-xl">
          <Sparkles className="h-5 w-5 text-highlight" aria-hidden="true" />
          <AccentText text={title} accentClassName="not-italic text-highlight" />
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      {home.subtitle && <p className="-mt-1 mb-3 text-center text-sm text-muted-foreground">{home.subtitle}</p>}

      <div className={GRID}>
        {home.isLoading
          ? Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
                <Skeleton className="aspect-square rounded-none" />
                <div className="space-y-2 p-2.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))
          : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>

      {!home.isLoading && (
        <div className="mt-4 flex justify-center">
          {hasMore ? (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => setLimit(asked + STEP)}
              className={cn("inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-md border-2 border-highlight bg-card text-sm font-bold text-highlight transition-colors hover:bg-highlight hover:text-highlight-foreground disabled:opacity-60", FOCUS)}
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          ) : (
            <Link to={SOURCE_LINK[home.source] ?? "/shop"} className={cn("rounded-sm text-sm font-semibold text-highlight hover:underline", FOCUS)}>
              Browse the full shop →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

/** Mega Market home: dense hero block, perks, categories, flash sale, vouchers, collections, product feed. */
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-3 pb-6 md:space-y-4 md:pb-10">
        <HomeHero />
        <ServiceStrip />
        <CategoryGrid />
        <FlashSale />
        <Vouchers />
        <CollectionBanners />
        <div className="pt-2">
          <JustForYou />
        </div>
      </div>
      <Footer />
    </div>
  );
}
