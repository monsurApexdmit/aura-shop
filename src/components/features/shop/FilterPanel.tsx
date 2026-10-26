import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/contexts/CurrencyContext";
import { WithTooltip } from "@/components/common/WithTooltip"

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
    <div className={cn("space-y-6", className)}>
      {/* Categories Filter */}
      <div>
        <SectionTitle className="mb-3">Categories</SectionTitle>

        {/* All Products Button */}
        <Button
          variant={!activeCatSlug ? "secondary" : "ghost"}
          onClick={() => onSelectCategory(null, null)}
          className="w-full justify-start mb-1"
        >
          All Products
        </Button>

        {/* Category List */}
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isExpanded = expandedCats.includes(cat.slug);
            const isActive = activeCatSlug === cat.slug && !activeSubSlug;

            return (
              <div key={cat.slug}>
                {/* Category Button */}
                <div className="flex items-center">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => onSelectCategory(cat.slug, null)}
                    className="flex-1 min-w-0 justify-start gap-2.5"
                  >
                    <span className="flex-1 text-left truncate">{cat.name}</span>
                  </Button>

                  {/* Expand/Collapse Button */}
                  <WithTooltip content={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}><Button
                    variant="ghost"
                    size="icon"
                    aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                    aria-expanded={isExpanded}
                    onClick={() => onToggleCatExpand(cat.slug)}
                  >
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isExpanded ? "rotate-180" : "")}
                    />
                  </Button></WithTooltip>
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
                            <Button
                              key={sub.slug}
                              variant={isSubActive ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => onSelectCategory(cat.slug, sub.slug)}
                              className="w-full justify-start"
                            >
                              <ChevronRight className="h-3 w-3 opacity-40 mr-1.5 shrink-0" />
                              {sub.name}
                            </Button>
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
      <Separator />
      <div>
        <SectionTitle className="mb-4">Price Range</SectionTitle>
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
          <Badge variant="secondary" className="font-mono">
            {formatCurrency(priceRange[0])}
          </Badge>
          <span className="text-border">—</span>
          <Badge variant="secondary" className="font-mono">
            {formatCurrency(priceRange[1])}
          </Badge>
        </div>
      </div>

      {/* Popular Tags */}
      <Separator />
      <div>
        <SectionTitle className="mb-3">Popular Tags</SectionTitle>
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
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
