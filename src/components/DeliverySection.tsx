import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Smartphone, Truck, Clock, ShieldCheck } from "lucide-react";

const features = [
  { icon: Truck, label: "Free Delivery" },
  { icon: Clock, label: "24/7 Service" },
  { icon: ShieldCheck, label: "Secure Payment" },
];

export default function DeliverySection() {
  return (
    <section className="py-12 md:py-20 bg-primary/5 overflow-hidden">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
              Organic Products and Food
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Quick Delivery to Your Home
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              There are many products you will find in our shop. Choose your daily necessary products from our
              StoreFront shop and get some special offers with free shipping.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  {f.label}
                </div>
              ))}
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6">
              <Smartphone className="mr-2 h-4 w-4" />
              Download App
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-primary/15 flex items-center justify-center">
                <Truck className="h-24 w-24 text-primary/60" />
              </div>
            </div>
            <div className="absolute -top-2 right-8 bg-card rounded-xl p-3 card-shadow border border-border">
              <p className="text-xs text-muted-foreground">Delivery in</p>
              <p className="font-display font-bold text-primary text-lg">30 min</p>
            </div>
            <div className="absolute bottom-4 left-4 bg-card rounded-xl p-3 card-shadow border border-border">
              <p className="text-xs text-muted-foreground">Orders today</p>
              <p className="font-display font-bold text-primary text-lg">2,000+</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
