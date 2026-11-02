import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowUpDown, ChevronRight, PackageOpen } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { productCountLabel } from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { useCollection } from "@/hooks/useCollections";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getImageUrl } from "@/lib/api";
import { mapApiProduct } from "@/lib/mappers";
import { pastel } from "@/lib/pastels";
import type { CollectionSort } from "@/services/collectionApi";
import NotFound from "@/pages/NotFound";

// "featured" keeps the order the admin chose for this collection (no sort sent to the API).
const SORT_OPTIONS: { value: CollectionSort | "featured"; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best_selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name", label: "Name: A → Z" },
];
const SORT_VALUES = new Set(SORT_OPTIONS.map((o) => o.value));

const GRID = "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4";

function setMetaDescription(content: string | null) {
  let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!content) return;
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = "description";
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export default function CollectionDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSort = searchParams.get("sort");
  const sort = rawSort && SORT_VALUES.has(rawSort as CollectionSort) ? (rawSort as CollectionSort | "featured") : "featured";
  const { storeName } = useCurrency();
  const [bannerFailed, setBannerFailed] = useState(false);

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCollection(slug, sort === "featured" ? undefined : sort);

  const collection = data?.pages[0]?.collection;
  const total = data?.pages[0]?.products.meta.total ?? collection?.productCount ?? 0;
  const products = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.products.data).map(mapApiProduct),
    [data],
  );

  useEffect(() => {
    if (!collection) return;
    const title = collection.seoTitle || collection.name;
    document.title = storeName ? `${title} | ${storeName}` : title;
    setMetaDescription(collection.seoDescription || collection.description);
  }, [collection, storeName]);

  useEffect(() => setBannerFailed(false), [collection?.imageUrl]);

  const changeSort = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    setSearchParams(next, { replace: true });
  };

  const notFound = isError && isAxiosError(error) && error.response?.status === 404;
  if (notFound || (!isLoading && !isError && !collection)) return <NotFound />;

  const banner = collection?.imageUrl && !bannerFailed ? getImageUrl(collection.imageUrl) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/40">
        <div className="container py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
            <ChevronRight className="h-3 w-3" />
            {collection
              ? <span className="text-foreground font-medium truncate" aria-current="page">{collection.name}</span>
              : <Skeleton className="h-4 w-24" />}
          </nav>
        </div>
      </div>
      <Separator />

      <div className="container py-6 md:py-10">
        {/* Banner + intro */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="aspect-[3/1] w-full rounded-3xl md:aspect-[4/1]" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isError ? (
          <EmptyState
            className="py-20"
            icon={PackageOpen}
            title="This collection could not be loaded"
            description="Please check your connection and try again."
            action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
          />
        ) : collection && (
          <header>
            {banner && (
              <div className={`overflow-hidden rounded-3xl ${pastel(0)}`}>
                <img
                  src={banner}
                  alt={collection.name}
                  onError={() => setBannerFailed(true)}
                  className="aspect-[3/1] w-full object-cover md:aspect-[4/1]"
                />
              </div>
            )}
            <div className={banner ? "mt-6 md:mt-8" : ""}>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">{collection.name}</h1>
              {collection.description && (
                <p className="mt-3 max-w-3xl whitespace-pre-line text-muted-foreground md:text-lg">{collection.description}</p>
              )}
            </div>
          </header>
        )}

        {/* Toolbar */}
        {!isError && (
          <div className="mt-8 mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isLoading ? "Loading products..." : productCountLabel(total)}
            </p>
            <div className="relative">
              <Select value={sort} onValueChange={changeSort}>
                <SelectTrigger className="w-48 pl-8" aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Products */}
        {isLoading ? (
          <div className={GRID}>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
          </div>
        ) : !isError && products.length === 0 ? (
          <EmptyState
            className="py-16"
            icon={PackageOpen}
            title="No products in this collection yet"
            description="Check back soon, or browse everything in the shop."
            action={<Button asChild variant="outline"><Link to="/shop">Shop all</Link></Button>}
          />
        ) : !isError && (
          <>
            <div className={GRID}>
              {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
            </div>
            {hasNextPage && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Showing {products.length} of {total}</p>
                <Button variant="outline" size="lg" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                  {isFetchingNextPage && <Spinner />}
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
