import { cn } from "@/lib/utils"
import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card } from "@/components/ui/card";

const MotionCard = motion.create(Card);

export default function FeaturesBar() {
  const { formatCurrency, freeShippingThreshold } = useCurrency();

  const features = [
    { icon: Truck, title: "Free Shipping", desc: freeShippingThreshold != null ? `On orders over ${formatCurrency(freeShippingThreshold)}` : "Fast & reliable delivery", color: "from-primary/10 to-primary/5" },
    { icon: Shield, title: "Secure Payment", desc: "SSL encrypted", color: "from-accent/10 to-accent/5" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day guarantee", color: "from-primary/10 to-primary/5" },
    { icon: Headphones, title: "24/7 Support", desc: "Expert assistance", color: "from-accent/10 to-accent/5" },
  ];
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {features.map((f, i) => (
            <MotionCard
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="p-3 sm:p-4 md:border-0 md:bg-transparent md:shadow-none md:p-0 flex flex-col items-center text-center gap-2 md:flex-row md:text-left md:gap-4"
            >
              <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br", f.color, "flex items-center justify-center shrink-0")}>
                <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-xs sm:text-sm text-foreground leading-tight">{f.title}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  );
}
