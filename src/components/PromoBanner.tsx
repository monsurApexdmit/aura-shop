import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-primary/5 border-y border-primary/10"
    >
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-primary">
            100% Natural Quality Organic Product
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            See our latest discounted products from here and get a special discount product.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
          Buy Now <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.section>
  );
}
