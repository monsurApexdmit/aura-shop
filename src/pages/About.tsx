import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Award, Truck, ShieldCheck, Heart, Target, Zap, Globe, LucideIcon } from "lucide-react";
import contentPageApi, { type AboutPageContent } from "@/services/contentPageApi";
import { Card } from "@/components/ui/card";
import { ItemMedia } from "@/components/ui/item";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useTranslation } from "react-i18next";

const MotionCard = motion.create(Card);

/** Built-in About content, shown (in the shopper's language) until the owner saves their own */
const defaultContent = (t: (key: string) => string): AboutPageContent => ({
  template: "about",
  hero: {
    kicker: t("pages:about.kicker"),
    title: t("pages:about.title"),
    description: t("pages:about.description"),
  },
  valuesHeading: t("pages:about.valuesHeading"),
  teamHeading: t("pages:about.teamHeading"),
  stats: [
    { label: t("pages:about.stats.customers"), value: "50K+", icon: "users" },
    { label: t("pages:about.stats.delivered"), value: "200K+", icon: "truck" },
    { label: t("pages:about.stats.awards"), value: "15+", icon: "award" },
    { label: t("pages:about.stats.countries"), value: "30+", icon: "globe" },
  ],
  values: [
    { title: t("pages:about.values.qualityTitle"), description: t("pages:about.values.qualityText"), icon: "shield-check" },
    { title: t("pages:about.values.loveTitle"), description: t("pages:about.values.loveText"), icon: "heart" },
    { title: t("pages:about.values.deliveryTitle"), description: t("pages:about.values.deliveryText"), icon: "zap" },
    { title: t("pages:about.values.missionTitle"), description: t("pages:about.values.missionText"), icon: "target" },
  ],
  team: [
    { name: "Sarah Johnson", role: t("pages:about.team.ceoRole"), bio: t("pages:about.team.ceoBio") },
    { name: "Michael Chen", role: t("pages:about.team.opsRole"), bio: t("pages:about.team.opsBio") },
    { name: "Emily Rodriguez", role: t("pages:about.team.creativeRole"), bio: t("pages:about.team.creativeBio") },
    { name: "David Kim", role: t("pages:about.team.devRole"), bio: t("pages:about.team.devBio") },
  ],
  seo: {
    title: t("pages:about.seoTitle"),
    description: t("pages:about.seoDescription"),
  },
});

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
  const { t } = useTranslation();
  // null = owner hasn't saved About content (or it failed to load): use the translated default
  const [saved, setSaved] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const page = await contentPageApi.getBySlug("about");
        if (active && page?.content) {
          setSaved(page.content as AboutPageContent);
          if (page.content.seo?.title) {
            document.title = page.content.seo.title;
          }
        }
      } catch {
        if (active) {
          setSaved(null);
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

  const content = saved ?? defaultContent((key) => t(key));

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

      {loading && <div className="sr-only">{t("pages:loadingContent")}</div>}
    </div>
  );
}
