import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Tag, Clock, Percent, Zap, Gift } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const dealFilters = ["All Deals", "Hot Deals", "Best Sellers", "Clearance"] as const;

const banners = [
  { title: "Flash Sale — Up to 40% Off", subtitle: "Limited time deals on electronics & fashion", icon: Zap, color: "from-primary to-accent" },
  { title: "Free Shipping on Orders $50+", subtitle: "Use code FREESHIP at checkout", icon: Gift, color: "from-accent to-primary" },
];

export default function Deals() {
  const [activeFilter, setActiveFilter] = useState<string>("All Deals");

  const { data, isLoading } = useProducts({ limit: 48 });
  const allProducts = useMemo(() => (data?.data ?? []).map(mapApiProduct), [data]);

  const dealProducts = useMemo(() => {
    const withDiscount = allProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
    if (activeFilter === "All Deals") return withDiscount;
    if (activeFilter === "Hot Deals") return withDiscount.filter((p) => p.badge === "Hot Deal");
    if (activeFilter === "Best Sellers") return withDiscount.filter((p) => p.badge === "Best Seller");
    if (activeFilter === "Clearance") return withDiscount.filter((p) => {
      const discount = ((p.originalPrice! - p.price) / p.originalPrice!) * 100;
      return discount >= 20;
    });
    return withDiscount;
  }, [allProducts, activeFilter]);

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
              className={`bg-gradient-to-r ${b.color} rounded-2xl p-6 text-primary-foreground flex items-center gap-4`}
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
          {dealFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === filter
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {filter === "Hot Deals" && <Flame className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
              {filter === "Clearance" && <Percent className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
              {filter === "All Deals" && <Tag className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
              {filter === "Best Sellers" && <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="container">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : dealProducts.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-display font-bold text-lg text-foreground">No deals in this category</p>
            <p className="text-sm text-muted-foreground">Try a different filter or check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dealProducts.map((product, i) => (
              <motion.div key={product.id} {...fadeUp} transition={{ delay: (i % 4) * 0.05 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        {!isLoading && (
          <motion.p {...fadeUp} className="text-center text-muted-foreground text-sm mt-8">
            Showing {dealProducts.length} deal{dealProducts.length !== 1 ? "s" : ""}
          </motion.p>
        )}
      </section>
    </div>
  );
}
