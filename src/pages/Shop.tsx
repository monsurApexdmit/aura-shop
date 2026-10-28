import { cn } from "@/lib/utils"
import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SlidersHorizontal, X, Grid3X3, LayoutList, ArrowUpDown } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import FilterPanel from "@/components/features/shop/FilterPanel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { WithTooltip } from "@/components/common/WithTooltip"

type SortOption = "default" | "price-asc" | "price-desc" | "newest";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Admin-built links use ?category=, storefront links use ?cat=.
  const activeCatSlug = searchParams.get("cat") || searchParams.get("category") || null;
  const activeSubSlug = searchParams.get("sub") || null;
  const searchQuery   = searchParams.get("search") || "";

  const [expandedCats, setExpandedCats]     = useState<string[]>(activeCatSlug ? [activeCatSlug] : []);
  const [priceRange, setPriceRange]         = useState<[number, number]>([0, 1500]);
  const [sortBy, setSortBy]                 = useState<SortOption>("default");
  const [gridCols, setGridCols]             = useState<3 | 4>(4); // 4=6col, 3=4col
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage]                     = useState(1);

  const { data: categories = [] } = useCategories();

  // Find active category/sub by slug
  const activeCategory    = categories.find((c) => c.slug === activeCatSlug);
  const activeSubCategory = activeCategory?.children.find((s) => s.slug === activeSubSlug);

  // Build API filters — use subcategory id when selected, otherwise parent category id
  const activeCategoryId = activeSubCategory?.id ?? activeCategory?.id;

  const apiFilters = useMemo(() => ({
    search:      searchQuery || undefined,
    category_id: activeCategoryId,
    limit:       24,
    page,
  }), [searchQuery, activeCategoryId, page]);

  const { data, isLoading } = useProducts(apiFilters);

  const products = useMemo(() => (data?.data ?? []).map(mapApiProduct), [data]);

  // Client-side sort & price filter
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) =>
      (p.price ?? 0) >= priceRange[0] && (p.price ?? 0) <= priceRange[1]
    );
    switch (sortBy) {
      case "price-asc":  result = [...result].sort((a, b) => a.price - b.price); break;
      case "price-desc": result = [...result].sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return result;
  }, [products, priceRange, sortBy]);

  const toggleCatExpand = (slug: string) =>
    setExpandedCats((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);

  const selectCategory = (catSlug: string | null, subSlug: string | null) => {
    const params = new URLSearchParams();
    if (catSlug) params.set("cat", catSlug);
    if (subSlug) params.set("sub", subSlug);
    if (searchQuery) params.set("search", searchQuery);
    setSearchParams(params);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/40">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={!activeCatSlug ? "text-foreground font-medium" : "hover:text-primary cursor-pointer transition-colors"}>
              {activeCatSlug ? (
                <Button variant="link" onClick={() => selectCategory(null, null)} className="h-auto p-0">Shop</Button>
              ) : "Shop"}
            </span>
            {activeCategory && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className={!activeSubSlug ? "text-foreground font-medium" : "hover:text-primary cursor-pointer transition-colors"}>
                  {activeSubSlug
                    ? <Button variant="link" onClick={() => selectCategory(activeCatSlug, null)} className="h-auto p-0">{activeCategory.name}</Button>
                    : activeCategory.name}
                </span>
              </>
            )}
            {activeSubCategory && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{activeSubCategory.name}</span>
              </>
            )}
          </div>
          <PageHeader
            className="mt-2"
            title={activeSubCategory?.name || activeCategory?.name || (searchQuery ? `Results for "${searchQuery}"` : "All Products")}
            description={isLoading ? "Loading..." : `${data?.meta?.total ?? filteredProducts.length} product${(data?.meta?.total ?? filteredProducts.length) !== 1 ? "s" : ""} found`}
          />
        </div>
      </div>
      <Separator />

      <div className="container py-6 md:py-8">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card className="sticky top-40 p-5 max-h-[calc(100vh-180px)] overflow-y-auto">
              <FilterPanel
                activeCatSlug={activeCatSlug}
                activeSubSlug={activeSubSlug}
                priceRange={priceRange}
                expandedCats={expandedCats}
                onSelectCategory={selectCategory}
                onPriceChange={setPriceRange}
                onToggleCatExpand={toggleCatExpand}
              />
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="lg:hidden gap-2" onClick={() => setMobileFilterOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </Button>
                {(activeCatSlug || priceRange[0] > 0 || priceRange[1] < 1500) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeCategory && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => selectCategory(null, null)}>
                        {activeCategory.name} <X className="h-3 w-3" />
                      </Badge>
                    )}
                    {activeSubCategory && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => selectCategory(activeCatSlug, null)}>
                        {activeSubCategory.name} <X className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-44 pl-8" aria-label="Sort products">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="price-asc">Price: Low → High</SelectItem>
                      <SelectItem value="price-desc">Price: High → Low</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                  <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
                <ButtonGroup className="hidden md:flex" aria-label="Grid density">
                  <WithTooltip content="Larger cards"><Button variant={gridCols === 3 ? "default" : "outline"} size="icon" aria-label="Larger cards" aria-pressed={gridCols === 3} onClick={() => setGridCols(3)}>
                    <LayoutList className="h-4 w-4" />
                  </Button></WithTooltip>
                  <WithTooltip content="Compact grid"><Button variant={gridCols === 4 ? "default" : "outline"} size="icon" aria-label="Compact grid" aria-pressed={gridCols === 4} onClick={() => setGridCols(4)}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button></WithTooltip>
                </ButtonGroup>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className={cn("grid grid-cols-2 sm:grid-cols-3", gridCols === 4 ? "md:grid-cols-4 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-3", "gap-x-4 gap-y-8")}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-72" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                className="py-20"
                title="No products found"
                description="Try adjusting your filters"
                action={
                  <Button variant="outline" onClick={() => { selectCategory(null, null); setPriceRange([0, 1500]); }}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <>
                <div className={cn("grid grid-cols-2 sm:grid-cols-3", gridCols === 4 ? "md:grid-cols-4 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-3", "gap-x-4 gap-y-8")}>
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.meta.last_page > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {data.meta.current_page} of {data.meta.last_page}
                    </span>
                    <Button variant="outline" disabled={page === data.meta.last_page} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileFilterOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-background z-50 lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between p-4">
                <h2 className="font-semibold text-lg">Filters</h2>
                <WithTooltip content="Close filters"><Button variant="ghost" size="icon" aria-label="Close filters" onClick={() => setMobileFilterOpen(false)}>
                  <X className="h-5 w-5" />
                </Button></WithTooltip>
              </div>
              <Separator />
              <div className="p-4">
                <FilterPanel
                  activeCatSlug={activeCatSlug}
                  activeSubSlug={activeSubSlug}
                  priceRange={priceRange}
                  expandedCats={expandedCats}
                  onSelectCategory={selectCategory}
                  onPriceChange={setPriceRange}
                  onToggleCatExpand={toggleCatExpand}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
