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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type SortOption = "default" | "price-asc" | "price-desc" | "newest";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCatSlug = searchParams.get("cat") || null;
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
      <div className="bg-muted/40 border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={!activeCatSlug ? "text-foreground font-medium" : "hover:text-primary cursor-pointer transition-colors"}>
              {activeCatSlug ? (
                <button onClick={() => selectCategory(null, null)}>Shop</button>
              ) : "Shop"}
            </span>
            {activeCategory && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className={!activeSubSlug ? "text-foreground font-medium" : "hover:text-primary cursor-pointer transition-colors"}>
                  {activeSubSlug
                    ? <button onClick={() => selectCategory(activeCatSlug, null)}>{activeCategory.name}</button>
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
          <h1 className="font-display text-xl md:text-2xl font-bold text-foreground mt-2">
            {activeSubCategory?.name || activeCategory?.name || (searchQuery ? `Results for "${searchQuery}"` : "All Products")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${data?.meta?.total ?? filteredProducts.length} product${(data?.meta?.total ?? filteredProducts.length) !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      <div className="container py-6 md:py-8">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-40 bg-card border border-border rounded-2xl p-5 max-h-[calc(100vh-180px)] overflow-y-auto">
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
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="lg:hidden rounded-xl gap-2" onClick={() => setMobileFilterOpen(true)}>
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
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-9 pl-8 pr-3 rounded-xl border border-border bg-background text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
                <div className="hidden md:flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setGridCols(3)} className={`p-2 transition-colors ${gridCols === 3 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                    <LayoutList className="h-4 w-4" />
                  </button>
                  <button onClick={() => setGridCols(4)} className={`p-2 transition-colors ${gridCols === 4 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridCols === 4 ? "md:grid-cols-4 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-3"} gap-3 md:gap-4`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={() => { selectCategory(null, null); setPriceRange([0, 1500]); }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridCols === 4 ? "md:grid-cols-4 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-3"} gap-3 md:gap-4`}>
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.meta.last_page > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl">
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {data.meta.current_page} of {data.meta.last_page}
                    </span>
                    <Button variant="outline" disabled={page === data.meta.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-xl">
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
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-display font-bold text-lg">Filters</h2>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setMobileFilterOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
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
