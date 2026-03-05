import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="container py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-4">
                New Season Collection
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                Discover Products
                <br />
                <span className="text-primary">You'll Love</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-muted-foreground text-lg max-w-md leading-relaxed"
            >
              From health essentials to fashion, electronics to groceries — everything you need, delivered to your door.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button variant="hero" size="lg">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="hero-outline" size="lg">
                View Catalog
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex items-center gap-8 pt-4"
            >
              {[
                { label: "Products", value: "10K+" },
                { label: "Happy Customers", value: "50K+" },
                { label: "Categories", value: "200+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={heroBanner}
                alt="Featured products collection"
                className="w-full h-[500px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 card-shadow border border-border">
              <p className="text-xs text-muted-foreground">Today's deal</p>
              <p className="font-display font-bold text-primary text-xl">Up to 40% Off</p>
              <p className="text-xs text-muted-foreground">on selected items</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
