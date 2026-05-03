import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden"
    >
      <div className="gradient-primary">
        <div className="container py-8 md:py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-primary-foreground/10">
                <Zap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">
                  Flash Sale — Up to 60% Off Everything
                </h2>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  Limited time offer on thousands of products. Don't miss out!
                </p>
              </div>
            </div>
            <button className="inline-flex w-full items-center justify-center gap-2 bg-background text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-background/90 transition-colors shadow-lg text-sm shrink-0 sm:w-auto">
              Shop the Sale <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-primary-foreground/5" />
      </div>
    </motion.section>
  );
}
