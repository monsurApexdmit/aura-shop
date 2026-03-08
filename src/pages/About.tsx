import { motion } from "framer-motion";
import { Users, Award, Truck, ShieldCheck, Heart, Target, Zap, Globe } from "lucide-react";

const stats = [
  { label: "Happy Customers", value: "50K+", icon: Users },
  { label: "Products Delivered", value: "200K+", icon: Truck },
  { label: "Awards Won", value: "15+", icon: Award },
  { label: "Countries Served", value: "30+", icon: Globe },
];

const values = [
  { title: "Quality First", description: "We handpick every product to ensure it meets our rigorous quality standards before it reaches you.", icon: ShieldCheck },
  { title: "Customer Love", description: "Your satisfaction drives everything we do. Our support team is always ready to help you.", icon: Heart },
  { title: "Fast Delivery", description: "From our warehouse to your doorstep — we make sure your orders arrive quickly and safely.", icon: Zap },
  { title: "Our Mission", description: "To make premium products accessible to everyone, with an experience that feels personal and effortless.", icon: Target },
];

const team = [
  { name: "Sarah Johnson", role: "Founder & CEO", bio: "Passionate about redefining e-commerce with a human touch." },
  { name: "Michael Chen", role: "Head of Operations", bio: "Keeps the wheels turning — from logistics to customer delight." },
  { name: "Emily Rodriguez", role: "Creative Director", bio: "Curates the brand aesthetic and product storytelling." },
  { name: "David Kim", role: "Lead Developer", bio: "Builds the tech that powers seamless shopping experiences." },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function About() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      {/* Hero */}
      <section className="container text-center mb-20">
        <motion.p {...fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Our Story</motion.p>
        <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5 leading-tight">
          We're Building the Future<br className="hidden sm:block" /> of Online Shopping
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
          Founded in 2020, ShopVibe started with a simple belief — everyone deserves access to high-quality products at fair prices, delivered with care and a smile.
        </motion.p>
      </section>

      {/* Stats */}
      <section className="container mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container mb-20">
        <motion.h2 {...fadeUp} className="font-display font-bold text-2xl text-center text-foreground mb-10">What We Stand For</motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => (
            <motion.div key={v.title} {...fadeUp} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="container">
        <motion.h2 {...fadeUp} className="font-display font-bold text-2xl text-center text-foreground mb-10">Meet the Team</motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((t, i) => (
            <motion.div key={t.name} {...fadeUp} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground">{t.name}</h3>
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">{t.role}</p>
              <p className="text-muted-foreground text-sm">{t.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
