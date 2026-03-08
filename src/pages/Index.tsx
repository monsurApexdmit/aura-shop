import HeroSection from "@/components/HeroSection";
import FeaturesBar from "@/components/FeaturesBar";
import PromoBanner from "@/components/PromoBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import DeliverySection from "@/components/DeliverySection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesBar />
      <CategoryGrid />
      <PromoBanner />

      {/* Popular Products */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-semibold text-sm uppercase tracking-widest mb-2"
            >
              Trending Now
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl font-bold text-foreground"
            >
              Popular Products for Daily Shopping
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto"
            >
              Handpicked products loved by thousands. Find your daily essentials with exclusive deals.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <DeliverySection />

      {/* Discounted Products */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-accent font-semibold text-sm uppercase tracking-widest mb-2"
            >
              Save Big Today
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl font-bold text-foreground"
            >
              Latest Discounted Products
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto"
            >
              Grab these deals before they're gone — special discounts with free shipping.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {products.filter((p) => p.originalPrice).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;