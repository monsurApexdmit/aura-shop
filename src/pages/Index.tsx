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
      <PromoBanner />
      <CategoryGrid />

      {/* Popular Products */}
      <section className="py-10 md:py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8">
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
              className="text-muted-foreground text-sm mt-2"
            >
              See all our popular products in this week. Choose your daily needs products from this list and get some special offer with free shipping.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <DeliverySection />

      {/* Discounted Products */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container">
          <div className="text-center mb-8">
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
              className="text-muted-foreground text-sm mt-2"
            >
              See our latest discounted products below. Choose your daily needs from here and get a special discount with free shipping.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
