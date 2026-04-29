import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function FeaturesBar() {
  const { formatCurrency } = useCurrency();

  const features = [
    { icon: Truck, title: "Free Shipping", desc: `On orders over ${formatCurrency(50)}`, color: "from-primary/10 to-primary/5" },
    { icon: Shield, title: "Secure Payment", desc: "SSL encrypted", color: "from-accent/10 to-accent/5" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day guarantee", color: "from-primary/10 to-primary/5" },
    { icon: Headphones, title: "24/7 Support", desc: "Expert assistance", color: "from-accent/10 to-accent/5" },
  ];
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 md:gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shrink-0`}>
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}