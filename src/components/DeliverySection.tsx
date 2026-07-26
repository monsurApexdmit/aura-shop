import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, Package, Users } from "lucide-react";
import { api } from "@/lib/api";

interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  todayOrders: number;
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
  return n > 0 ? String(n) + "+" : "0";
}

export default function DeliverySection() {
  const [stats, setStats] = useState<StoreStats | null>(null);

  useEffect(() => {
    api.get("/stats").then((r) => setStats(r.data.data)).catch(() => {});
  }, []);

  const statCards = [
    {
      value: stats ? fmt(stats.totalProducts) : "—",
      label: "Products Available",
      icon: Package,
    },
    {
      value: stats ? fmt(stats.totalOrders) : "—",
      label: "Orders Fulfilled",
      icon: Truck,
    },
    {
      value: stats ? fmt(stats.totalCustomers) : "—",
      label: "Happy Customers",
      icon: Users,
    },
    {
      value: "100%",
      label: "Secure Payment",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="hidden md:block py-16 md:py-24 relative overflow-hidden">
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

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="text-center p-4 rounded-xl bg-card border border-border card-shadow"
                >
                  <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="font-display font-bold text-xl text-foreground">
                    {s.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse-soft" />
              <div className="absolute inset-6 rounded-full bg-primary/8" />
              <div className="absolute inset-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl animate-float">
                  <Truck className="h-14 w-14 md:h-18 md:w-18 text-primary-foreground" />
                </div>
              </div>

              {/* Orders today — real */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-2 right-4 md:right-8 bg-card rounded-xl p-3 card-shadow border border-border"
              >
                <p className="text-xs text-muted-foreground">Orders today</p>
                <p className="font-display font-bold text-primary text-lg">
                  {stats ? (stats.todayOrders > 0 ? stats.todayOrders + "+" : "0") : "—"}
                </p>
              </motion.div>

              {/* Total customers — real */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-4 -left-2 md:left-2 bg-card rounded-xl p-3 card-shadow border border-border"
              >
                <p className="text-xs text-muted-foreground">Customers</p>
                <p className="font-display font-bold text-accent text-lg">
                  {stats ? fmt(stats.totalCustomers) : "—"}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
