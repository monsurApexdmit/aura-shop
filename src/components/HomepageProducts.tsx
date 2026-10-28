import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals, useProducts } from "@/hooks/useProducts";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { mapApiProduct } from "@/lib/mappers";

const DEFAULT_TITLE = "This week's bloom";
const DEFAULT_SUBTITLE = "Fresh picks, hand-on-heart approved.";

// "Shop all" lands on the matching listing for the chosen source.
const SOURCE_LINK: Record<string, string> = {
  latest: "/shop",
  featured: "/deals",
  best_seller: "/deals",
  hot_deal: "/deals",
  on_sale: "/deals",
};

export default function HomepageProducts() {
  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const custom = sections?.products;
  const source = custom?.source ?? "latest";
  const limit = custom?.limit ?? 8;
  const isLatest = source === "latest";

  // Only the chosen source is fetched; the latest query shares its cache with the hero collage.
  const latest = useProducts({ limit, category_id: custom?.categoryId ?? undefined }, { enabled: !sectionsLoading && isLatest });
  const deals = useDeals(isLatest ? "all" : source, limit, { enabled: !sectionsLoading && !isLatest });
  const { data, isLoading } = isLatest ? latest : deals;
  const products = useMemo(() => (data?.data ?? []).map(mapApiProduct), [data]);

  if (sectionsLoading) return null;
  if (custom && !custom.enabled) return null;
  // A deals-based grid with nothing in it is hidden rather than shown empty.
  if (!isLatest && !isLoading && products.length === 0) return null;

  return (
    <section className="container pb-16 md:pb-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-10">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">{custom?.title || DEFAULT_TITLE}</h2>
          {(custom ? custom.subtitle : DEFAULT_SUBTITLE) && (
            <p className="mt-2 text-sm text-muted-foreground md:text-base">{custom ? custom.subtitle : DEFAULT_SUBTITLE}</p>
          )}
        </div>
        <Link to={SOURCE_LINK[source]} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline">
          Shop all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: Math.min(limit, 8) }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)
          : products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
      </div>
      {!isLoading && products.length === 0 && (
        <p className="rounded-2xl bg-secondary py-12 text-center text-muted-foreground">No products here yet.</p>
      )}
    </section>
  );
}
