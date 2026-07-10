import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Award, Truck, ShieldCheck, Heart, Target, Zap, Globe, LucideIcon } from "lucide-react";
import contentPageApi, { type AboutPageContent } from "@/services/contentPageApi";

const defaultContent: AboutPageContent = {
  template: "about",
  hero: {
    kicker: "Our Story",
    title: "We're Building the Future of Online Shopping",
    description:
      "Founded in 2020, Aura Shop started with a simple belief: everyone deserves access to high-quality products at fair prices, delivered with care and consistency.",
  },
  valuesHeading: "What We Stand For",
  teamHeading: "Meet the Team",
  stats: [
    { label: "Happy Customers", value: "50K+", icon: "users" },
    { label: "Products Delivered", value: "200K+", icon: "truck" },
    { label: "Awards Won", value: "15+", icon: "award" },
    { label: "Countries Served", value: "30+", icon: "globe" },
  ],
  values: [
    {
      title: "Quality First",
      description: "We handpick every product to ensure it meets our rigorous quality standards before it reaches you.",
      icon: "shield-check",
    },
    {
      title: "Customer Love",
      description: "Your satisfaction drives everything we do. Our support team is always ready to help you.",
      icon: "heart",
    },
    {
      title: "Fast Delivery",
      description: "From our warehouse to your doorstep, we make sure your orders arrive quickly and safely.",
      icon: "zap",
    },
    {
      title: "Our Mission",
      description: "To make premium products accessible to everyone, with an experience that feels personal and effortless.",
      icon: "target",
    },
  ],
  team: [
    { name: "Sarah Johnson", role: "Founder & CEO", bio: "Passionate about redefining e-commerce with a human touch." },
    { name: "Michael Chen", role: "Head of Operations", bio: "Keeps the wheels turning from logistics to customer delight." },
    { name: "Emily Rodriguez", role: "Creative Director", bio: "Curates the brand aesthetic and product storytelling." },
    { name: "David Kim", role: "Lead Developer", bio: "Builds the tech that powers seamless shopping experiences." },
  ],
  seo: {
    title: "About Aura Shop",
    description: "Learn about Aura Shop, our story, values, and the team behind the brand.",
  },
};

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  award: Award,
  truck: Truck,
  "shield-check": ShieldCheck,
  heart: Heart,
  target: Target,
  zap: Zap,
  globe: Globe,
};

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const getIcon = (iconName: string | undefined, fallback: LucideIcon): LucideIcon => {
  if (!iconName) return fallback;
  return iconMap[iconName] ?? fallback;
};

export default function About() {
  const [content, setContent] = useState<AboutPageContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const page = await contentPageApi.getBySlug("about");
        if (active && page?.content) {
          setContent(page.content as AboutPageContent);
          if (page.content.seo?.title) {
            document.title = page.content.seo.title;
          }
        }
      } catch {
        if (active) {
          setContent(defaultContent);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <section className="container text-center mb-20">
        <motion.p {...fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
          {content.hero.kicker}
        </motion.p>
        <motion.h1
          {...fadeUp}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5 leading-tight"
        >
          {content.hero.title}
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed"
        >
          {content.hero.description}
        </motion.p>
      </section>

      <section className="container mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {content.stats.map((stat, i) => {
            const Icon = getIcon(stat.icon, Users);
            return (
              <motion.div
                key={`${stat.label}-${i}`}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="container mb-20">
        <motion.h2 {...fadeUp} className="font-display font-bold text-2xl text-center text-foreground mb-10">
          {content.valuesHeading}
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {content.values.map((value, i) => {
            const Icon = getIcon(value.icon, ShieldCheck);
            return (
              <motion.div
                key={`${value.title}-${i}`}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="container">
        <motion.h2 {...fadeUp} className="font-display font-bold text-2xl text-center text-foreground mb-10">
          {content.teamHeading}
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {content.team.map((member, i) => (
            <motion.div
              key={`${member.name}-${i}`}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground">{member.name}</h3>
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">{member.role}</p>
              <p className="text-muted-foreground text-sm">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {loading && <div className="sr-only">Loading page content</div>}
    </div>
  );
}
