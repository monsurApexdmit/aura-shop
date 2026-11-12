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
import { useTranslation } from "react-i18next";

// labelKey is translated at render
const dealFilters: { labelKey: string; value: DealFilter; icon: React.ElementType }[] = [
  { labelKey: "shop:deals.filters.all",        value: "all",         icon: Tag     },
  { labelKey: "shop:deals.filters.hotDeal",    value: "hot_deal",    icon: Flame   },
  { labelKey: "shop:deals.filters.bestSeller", value: "best_seller", icon: Clock   },
  { labelKey: "shop:deals.filters.featured",   value: "featured",    icon: Star    },
  { labelKey: "shop:deals.filters.onSale",     value: "on_sale",     icon: Percent },
];

export default function Deals() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<DealFilter>("all");
  const { formatCurrency, freeShippingThreshold } = useCurrency();

  const banners = [
    { title: t("shop:deals.flashTitle"), subtitle: t("shop:deals.flashText"), icon: Zap,  color: "bg-ink text-ink-foreground"  },
    ...(freeShippingThreshold != null
      ? [{ title: t("shop:deals.freeShippingTitle", { amount: formatCurrency(freeShippingThreshold) }), subtitle: t("shop:deals.freeShippingText"), icon: Gift, color: "bg-highlight text-highlight-foreground" }]
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
          <Flame className="h-5 w-5 text-foreground" />
          <p className="text-foreground font-bold text-sm uppercase tracking-widest">{t("shop:deals.kicker")}</p>
        </motion.div>
        <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="font-display font-extrabold tracking-tight text-5xl sm:text-7xl text-foreground mb-4">
          {t("shop:deals.title")}
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-xl mx-auto">
          {t("shop:deals.subtitle")}
        </motion.p>
      </section>

      {/* Promo Banners */}
      <section className="container mb-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {banners.map((b, i) => (
            <motion.div key={b.title} {...fadeUp} transition={{ delay: i * 0.1 }}
              className={cn(b.color, "rounded-2xl p-5 sm:p-6 flex flex-col text-center items-center gap-4 sm:flex-row sm:text-left")}
            >
              <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center shrink-0">
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
          {dealFilters.map(({ labelKey, value, icon: Icon }) => (
            <Button
              key={value}
              variant={activeFilter === value ? "default" : "outline"}
              aria-pressed={activeFilter === value}
              onClick={() => setActiveFilter(value)}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(labelKey)}
            </Button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="container">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : dealProducts.length === 0 ? (
          <EmptyState
            className="py-16"
            icon={Tag}
            title={t("shop:deals.emptyTitle")}
            description={t("shop:deals.emptyText")}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8">
            {dealProducts.map((product, i) => (
              <motion.div key={product.id} {...fadeUp} transition={{ delay: (i % 4) * 0.05 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        {!isLoading && dealProducts.length > 0 && (
          <motion.p {...fadeUp} className="text-center text-muted-foreground text-sm mt-8">
            {t("shop:deals.showing", { count: dealProducts.length })}
          </motion.p>
        )}
      </section>
    </div>
  );
}
