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
  const featuredCategories = categories.slice(0, 2);
  const pillCategories = categories.slice(2, 12);

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="mb-5 flex items-end justify-between md:hidden">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-semibold text-xs uppercase tracking-widest mb-1"
            >
              Browse by Category
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-xl font-bold text-foreground"
            >
              Categories
            </motion.h2>
            <p className="text-xs text-muted-foreground mt-0.5">Shop by what you need</p>
          </div>
          <Link to="/shop" className="mb-0.5 flex items-center gap-1 text-xs font-bold text-primary">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="text-center mb-10 hidden md:block">
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

        <div className="md:hidden">
          {isLoading ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </div>
              <div className="mt-3 flex gap-2 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {featuredCategories.map((cat, i) => {
                  const Icon = getCatIcon(cat.slug);
                  return (
                    <motion.div
                      key={cat.slug}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        to={`/shop?cat=${cat.slug}`}
                        className={`relative flex min-h-28 flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-colors ${
                          i === 0
                            ? "border-orange-400/35 bg-orange-500/10"
                            : "border-primary/35 bg-primary/10"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <Icon className={`h-5 w-5 ${i === 0 ? "text-orange-400" : "text-primary"}`} />
                          {i === 0 && (
                            <span className="rounded-md bg-orange-400 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-background">
                              Popular
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-bold leading-tight text-card-foreground">
                            {cat.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {cat.children.length} subcategories
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {pillCategories.length > 0 && (
                <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex w-max gap-2">
                    {pillCategories.map((cat) => {
                      const Icon = getCatIcon(cat.slug);
                      return (
                        <Link
                          key={cat.slug}
                          to={`/shop?cat=${cat.slug}`}
                          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground"
                        >
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
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
