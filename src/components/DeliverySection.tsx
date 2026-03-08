import { motion } from "framer-motion";
import { Truck, Clock, ShieldCheck, Package, ArrowRight } from "lucide-react";

const stats = [
  { value: "30min", label: "Average Delivery", icon: Clock },
  { value: "50K+", label: "Happy Customers", icon: Package },
  { value: "100%", label: "Secure Payment", icon: ShieldCheck },
];

export default function DeliverySection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full hero-gradient opacity-50" />

      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Truck className="h-3 w-3" />
              Fast & Reliable
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-[1.15]">
              Lightning-Fast Delivery to Your
              <span className="text-gradient"> Doorstep</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-base max-w-md">
              From groceries to gadgets — we deliver everything you need with speed and care. Track your orders in real-time.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-4 rounded-xl bg-card border border-border card-shadow"
                >
                  <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="font-display font-bold text-xl text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <button className="inline-flex items-center gap-2 gradient-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg text-sm">
              Download Our App <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            {/* Abstract delivery illustration */}
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse-soft" />
              <div className="absolute inset-6 rounded-full bg-primary/8" />
              <div className="absolute inset-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl animate-float">
                  <Truck className="h-14 w-14 md:h-18 md:w-18 text-primary-foreground" />
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-2 right-4 md:right-8 bg-card rounded-xl p-3 card-shadow border border-border"
              >
                <p className="text-xs text-muted-foreground">Delivery in</p>
                <p className="font-display font-bold text-primary text-lg">30 min</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-4 -left-2 md:left-2 bg-card rounded-xl p-3 card-shadow border border-border"
              >
                <p className="text-xs text-muted-foreground">Orders today</p>
                <p className="font-display font-bold text-accent text-lg">2,847+</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}