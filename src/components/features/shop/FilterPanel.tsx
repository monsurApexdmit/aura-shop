import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface FilterPanelProps {
  /**
   * Currently active category slug
   */
  activeCatSlug: string | null;

  /**
   * Currently active subcategory slug
   */
  activeSubSlug: string | null;

  /**
   * Price range [min, max]
   */
  priceRange: [number, number];

  /**
   * Expanded category slugs
   */
  expandedCats: string[];

  /**
   * Called when category selection changes
   */
  onSelectCategory: (catSlug: string | null, subSlug: string | null) => void;

  /**
   * Called when price range changes
   */
  onPriceChange: (range: [number, number]) => void;

  /**
   * Called when category expand/collapse changes
   */
  onToggleCatExpand: (slug: string) => void;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * FilterPanel Component
 *
 * Displays filters for shopping (categories, price range, tags).
 * Extracted from Shop.tsx sidebar for reusability.
 *
 * @example
 * ```tsx
 * <FilterPanel
 *   activeCatSlug={activeCatSlug}
 *   activeSubSlug={activeSubSlug}
 *   priceRange={priceRange}
 *   expandedCats={expandedCats}
 *   onSelectCategory={selectCategory}
 *   onPriceChange={setPriceRange}
 *   onToggleCatExpand={toggleCatExpand}
 * />
 * ```
 */
export default function FilterPanel({
  activeCatSlug,
  activeSubSlug,
  priceRange,
  expandedCats,
  onSelectCategory,
  onPriceChange,
  onToggleCatExpand,
  className = "",
}: FilterPanelProps) {
  const { data: categories = [] } = useCategories();
  const { formatCurrency } = useCurrency();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Categories Filter */}
      <div>
        <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-3">
          Categories
        </h3>

        {/* All Products Button */}
        <button
          onClick={() => onSelectCategory(null, null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
            !activeCatSlug
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All Products
        </button>

        {/* Category List */}
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isExpanded = expandedCats.includes(cat.slug);
            const isActive = activeCatSlug === cat.slug && !activeSubSlug;

            return (
              <div key={cat.slug}>
                {/* Category Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => onSelectCategory(cat.slug, null)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex-1 text-left truncate">{cat.name}</span>
                  </button>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => onToggleCatExpand(cat.slug)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Subcategories */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-9 pr-2 pb-1 space-y-0.5">
                        {cat.children.map((sub) => {
                          const isSubActive =
                            activeCatSlug === cat.slug && activeSubSlug === sub.slug;

                          return (
                            <button
                              key={sub.slug}
                              onClick={() => onSelectCategory(cat.slug, sub.slug)}
                              className={`w-full flex items-center px-3 py-1.5 rounded-md text-xs transition-colors ${
                                isSubActive
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              <ChevronRight className="h-3 w-3 opacity-40 mr-1.5 shrink-0" />
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="border-t border-border pt-5">
        <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-4">
          Price Range
        </h3>
        <Slider
          defaultValue={[0, 1500]}
          min={0}
          max={1500}
          step={10}
          value={priceRange}
          onValueChange={(v) => onPriceChange(v as [number, number])}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-md bg-muted font-mono">
            {formatCurrency(priceRange[0])}
          </span>
          <span className="text-border">—</span>
          <span className="px-2 py-1 rounded-md bg-muted font-mono">
            {formatCurrency(priceRange[1])}
          </span>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="border-t border-border pt-5">
        <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-3">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {[
            "Hot Deal",
            "New",
            "Organic",
            "Best Seller",
            "Sale",
            "Trending",
            "Premium",
          ].map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
