import { cn } from "@/lib/utils"
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Tag, Clock, Percent, Star, Gift, Zap } from "lucide-react";
import { useDeals } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import type { DealFilter } from "@/services/productApi";
import { useCurrency } from "@/contexts/CurrencyContext";

const dealFilters: { label: string; value: DealFilter; icon: React.ElementType }[] = [
  { label: "All Deals",    value: "all",         icon: Tag     },
  { label: "Hot Deals",    value: "hot_deal",    icon: Flame   },
  { label: "Best Sellers", value: "best_seller", icon: Clock   },
  { label: "Featured",     value: "featured",    icon: Star    },
  { label: "On Sale",      value: "on_sale",     icon: Percent },
];

export default function Deals() {
  const [activeFilter, setActiveFilter] = useState<DealFilter>("all");
  const { formatCurrency, freeShippingThreshold } = useCurrency();

  const banners = [
    { title: "Flash Sale — Up to 40% Off", subtitle: "Limited time deals on electronics & fashion", icon: Zap,  color: "from-primary to-accent"  },
    ...(freeShippingThreshold != null
      ? [{ title: `Free Shipping on Orders ${formatCurrency(freeShippingThreshold)}+`, subtitle: "Use code FREESHIP at checkout", icon: Gift, color: "from-accent to-primary" }]
      : []),
  ];

  const { data, isLoading } = useDeals(activeFilter, 48);
  const dealProducts = useMemo(() => (data?.data ?? []).map(mapApiProduct), [data]);

  const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      {/* Hero */}
      <section className="container text-center mb-10">
        <motion.div {...fadeUp} className="flex items-center justify-center gap-2 mb-3">
          <Flame className="h-5 w-5 text-accent" />
          <p className="text-accent font-semibold text-sm uppercase tracking-widest">Offers & Deals</p>
        </motion.div>
        <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4">
          Today's Best Deals
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-xl mx-auto">
          Grab incredible discounts before they're gone. New deals added daily!
        </motion.p>
      </section>

      {/* Promo Banners */}
      <section className="container mb-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {banners.map((b, i) => (
            <motion.div key={b.title} {...fadeUp} transition={{ delay: i * 0.1 }}
              className={cn("bg-gradient-to-r", b.color, "rounded-2xl p-5 sm:p-6 text-primary-foreground flex flex-col text-center items-center gap-4 sm:flex-row sm:text-left")}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <b.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">{b.title}</h3>
                <p className="text-sm opacity-90">{b.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="container mb-8">
        <div className="flex flex-wrap gap-2">
          {dealFilters.map(({ label, value, icon: Icon }) => (
            <Button
              key={value}
              variant={activeFilter === value ? "default" : "outline"}
              aria-pressed={activeFilter === value}
              onClick={() => setActiveFilter(value)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="container">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : dealProducts.length === 0 ? (
          <EmptyState
            className="py-16"
            icon={Tag}
            title="No deals in this category"
            description="Try a different filter or check back later!"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {dealProducts.map((product, i) => (
              <motion.div key={product.id} {...fadeUp} transition={{ delay: (i % 4) * 0.05 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        {!isLoading && dealProducts.length > 0 && (
          <motion.p {...fadeUp} className="text-center text-muted-foreground text-sm mt-8">
            Showing {dealProducts.length} deal{dealProducts.length !== 1 ? "s" : ""}
          </motion.p>
        )}
      </section>
    </div>
  );
}
