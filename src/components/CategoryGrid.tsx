import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronRight, Monitor, Shirt, Pill, ShoppingBasket, Home, Sparkles, Dumbbell, BookOpen, Baby, Coffee, Wrench, Gamepad2, Tag } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "electronics":       Monitor,
  "fashion":           Shirt,
  "fashion-apparel":   Shirt,
  "health":            Pill,
  "health-medicine":   Pill,
  "grocery":           ShoppingBasket,
  "grocery-food":      ShoppingBasket,
  "home":              Home,
  "home-kitchen":      Home,
  "beauty":            Sparkles,
  "beauty-skincare":   Sparkles,
  "sports":            Dumbbell,
  "sports-outdoors":   Dumbbell,
  "books":             BookOpen,
  "books-stationery":  BookOpen,
  "baby":              Baby,
  "baby-kids":         Baby,
  "beverages":         Coffee,
  "tools":             Wrench,
  "tools-hardware":    Wrench,
  "gaming":            Gamepad2,
};

function getCatIcon(slug: string): LucideIcon {
  if (ICON_MAP[slug]) return ICON_MAP[slug];
  // partial match
  const key = Object.keys(ICON_MAP).find((k) => slug.includes(k) || k.includes(slug));
  return key ? ICON_MAP[key] : Tag;
}

export default function CategoryGrid() {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const { data: categories = [], isLoading } = useCategories();

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-semibold text-sm uppercase tracking-widest mb-2"
          >
            Browse by Category
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold text-foreground"
          >
            Shop From Top Categories
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            : categories.slice(0, 12).map((cat, i) => {
                const Icon = getCatIcon(cat.slug);
                return (
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    viewport={{ once: true }}
                    onMouseEnter={() => setHoveredCat(cat.slug)}
                    onMouseLeave={() => setHoveredCat(null)}
                    className="relative"
                  >
                    <Link
                      to={`/shop?cat=${cat.slug}`}
                      className="group block rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 p-5 text-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-display font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {cat.children.length} subcategories
                        </p>
                      </div>
                    </Link>

                    {/* Subcategory tooltip on hover - Desktop only */}
                    {hoveredCat === cat.slug && cat.children.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-30 py-2 hidden md:block"
                      >
                        {cat.children.map((child) => (
                          <Link
                            key={child.slug}
                            to={`/shop?cat=${cat.slug}&sub=${child.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-xs text-popover-foreground hover:bg-muted hover:text-primary transition-colors"
                          >
                            {child.name}
                            <ChevronRight className="h-3 w-3 opacity-40" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
