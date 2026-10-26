import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Award, Truck, ShieldCheck, Heart, Target, Zap, Globe, LucideIcon } from "lucide-react";
import contentPageApi, { type AboutPageContent } from "@/services/contentPageApi";
import { Card } from "@/components/ui/card";
import { ItemMedia } from "@/components/ui/item";
import { UserAvatar } from "@/components/common/UserAvatar";

const MotionCard = motion.create(Card);

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
              <MotionCard
                key={`${stat.label}-${i}`}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="p-6 text-center"
              >
                <ItemMedia variant="icon" className="mx-auto mb-3">
                  <Icon />
                </ItemMedia>
                <p className="font-semibold text-2xl tabular-nums">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </MotionCard>
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
              <MotionCard
                key={`${value.title}-${i}`}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="p-6"
              >
                <ItemMedia variant="icon" className="mb-4">
                  <Icon />
                </ItemMedia>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </MotionCard>
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
            <MotionCard
              key={`${member.name}-${i}`}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
              className="p-6 text-center"
            >
              <UserAvatar name={member.name} fallback={<Users className="h-7 w-7 text-muted-foreground" />} className="size-16 mx-auto mb-4" />
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">{member.role}</p>
              <p className="text-muted-foreground text-sm">{member.bio}</p>
            </MotionCard>
          ))}
        </div>
      </section>

      {loading && <div className="sr-only">Loading page content</div>}
    </div>
  );
}
