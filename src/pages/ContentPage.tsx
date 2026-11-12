import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import contentPageApi, {
  type FaqPageContent,
  type PolicyPageContent,
  type StorefrontPageContent,
  inferPageTemplate,
} from "@/services/contentPageApi";
import { Markdown } from "@/lib/markdown";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/common/SectionCard";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import enPages from "@/i18n/locales/en/pages";

const MotionCard = motion.create(Card);

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

/** Looks up a translation key; the built-in defaults are built from keys so they can follow the language */
type Translate = (key: string) => string;

const faqContent = (t: Translate): FaqPageContent => ({
  template: "faq",
  hero: {
    kicker: t("pages:faq.kicker"),
    title: t("pages:faq.title"),
    description: t("pages:faq.description"),
  },
  faqCategories: [
    {
      title: t("pages:faq.orders.title"),
      items: [
        { question: t("pages:faq.orders.trackQ"), answer: t("pages:faq.orders.trackA") },
        { question: t("pages:faq.orders.timeQ"), answer: t("pages:faq.orders.timeA") },
        { question: t("pages:faq.orders.addressQ"), answer: t("pages:faq.orders.addressA") },
      ],
    },
    {
      title: t("pages:faq.payments.title"),
      items: [
        { question: t("pages:faq.payments.methodsQ"), answer: t("pages:faq.payments.methodsA") },
        { question: t("pages:faq.payments.damagedQ"), answer: t("pages:faq.payments.damagedA") },
        { question: t("pages:faq.payments.refundQ"), answer: t("pages:faq.payments.refundA") },
      ],
    },
  ],
  seo: {
    title: t("pages:faq.seoTitle"),
    description: t("pages:faq.seoDescription"),
  },
});

const returnsContent = (t: Translate): PolicyPageContent => ({
  template: "policy",
  hero: {
    kicker: t("pages:returns.kicker"),
    title: t("pages:returns.title"),
    description: t("pages:returns.description"),
  },
  sections: [
    {
      title: t("pages:returns.eligibility.title"),
      paragraphs: [t("pages:returns.eligibility.p1"), t("pages:returns.eligibility.p2")],
    },
    {
      title: t("pages:returns.damaged.title"),
      paragraphs: [t("pages:returns.damaged.p1"), t("pages:returns.damaged.p2")],
    },
    {
      title: t("pages:returns.refunds.title"),
      paragraphs: [t("pages:returns.refunds.p1"), t("pages:returns.refunds.p2")],
    },
  ],
  seo: {
    title: t("pages:returns.seoTitle"),
    description: t("pages:returns.seoDescription"),
  },
});

const shippingContent = (t: Translate): PolicyPageContent => ({
  template: "policy",
  hero: {
    kicker: t("pages:shipping.kicker"),
    title: t("pages:shipping.title"),
    description: t("pages:shipping.description"),
  },
  sections: [
    {
      title: t("pages:shipping.processing.title"),
      paragraphs: [t("pages:shipping.processing.p1"), t("pages:shipping.processing.p2")],
    },
    {
      title: t("pages:shipping.methods.title"),
      paragraphs: [t("pages:shipping.methods.p1"), t("pages:shipping.methods.p2")],
    },
    {
      title: t("pages:shipping.address.title"),
      paragraphs: [t("pages:shipping.address.p1"), t("pages:shipping.address.p2")],
    },
  ],
  seo: {
    title: t("pages:shipping.seoTitle"),
    description: t("pages:shipping.seoDescription"),
  },
});

const privacyContent = (t: Translate): PolicyPageContent => ({
  template: "policy",
  hero: {
    kicker: t("pages:privacy.kicker"),
    title: t("pages:privacy.title"),
    description: t("pages:privacy.description"),
  },
  sections: [
    {
      title: t("pages:privacy.collect.title"),
      paragraphs: [t("pages:privacy.collect.p1"), t("pages:privacy.collect.p2")],
    },
    {
      title: t("pages:privacy.use.title"),
      paragraphs: [t("pages:privacy.use.p1"), t("pages:privacy.use.p2")],
    },
    {
      title: t("pages:privacy.retention.title"),
      paragraphs: [t("pages:privacy.retention.p1"), t("pages:privacy.retention.p2")],
    },
  ],
  seo: {
    title: t("pages:privacy.seoTitle"),
    description: t("pages:privacy.seoDescription"),
  },
});

/** English straight from the resources, so the exported defaults don't depend on i18n init order */
const english: Translate = (key) =>
  key
    .replace(/^pages:/, "")
    .split(".")
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], enPages) as string;

// English copies kept as exports (App.tsx passes them as fallbackContent). ContentPage swaps
// them for the shopper's language; content the owner saved is shown as-is.
export const defaultFaqPageContent: FaqPageContent = faqContent(english);
export const defaultReturnsRefundsPageContent: PolicyPageContent = returnsContent(english);
export const defaultShippingPolicyPageContent: PolicyPageContent = shippingContent(english);
export const defaultPrivacyPolicyPageContent: PolicyPageContent = privacyContent(english);

const LOCALIZED_DEFAULTS = new Map<StorefrontPageContent, (t: Translate) => StorefrontPageContent>([
  [defaultFaqPageContent, faqContent],
  [defaultReturnsRefundsPageContent, returnsContent],
  [defaultShippingPolicyPageContent, shippingContent],
  [defaultPrivacyPolicyPageContent, privacyContent],
]);

type ContentPageProps = {
  slug: string;
  fallbackContent: StorefrontPageContent;
};

export default function ContentPage({ slug, fallbackContent }: ContentPageProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState<StorefrontPageContent>(fallbackContent);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const { onlineStore } = useCurrency();
  const policyKey = ({ returns: "returns", shipping: "shipping", privacy: "privacy" } as const)[slug as "returns"];
  const policyText = policyKey ? onlineStore?.policies?.[policyKey]?.trim() : "";

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const page = await contentPageApi.getBySlug(slug);
        if (active && page?.content) {
          setMissing(false);
          setContent(page.content);
          if (page.content.seo?.title) {
            document.title = page.content.seo.title;
          }
        }
      } catch {
        if (active) {
          setMissing(true);
          setContent(fallbackContent);
          const localize = LOCALIZED_DEFAULTS.get(fallbackContent);
          const fallbackTitle = (localize ? localize((key) => i18n.t(key)) : fallbackContent).seo?.title;
          if (fallbackTitle) {
            document.title = fallbackTitle;
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      active = false;
    };
  }, [fallbackContent, slug]);

  // Built-in default (not owner content): show it in the shopper's language
  const localizeDefault = content === fallbackContent ? LOCALIZED_DEFAULTS.get(fallbackContent) : undefined;
  const shown = localizeDefault ? localizeDefault((key) => t(key)) : content;
  const template = inferPageTemplate(slug, shown);
  const useStorePolicy = !loading && missing && !!policyText;

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <section className="container text-center mb-16">
        <motion.p {...fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
          {shown.hero.kicker}
        </motion.p>
        <motion.h1
          {...fadeUp}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5 leading-tight"
        >
          {shown.hero.title}
        </motion.h1>
        <motion.p
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-3xl mx-auto text-base leading-relaxed"
        >
          {shown.hero.description}
        </motion.p>
      </section>

      {useStorePolicy ? (
        <section className="container max-w-4xl">
          <Card className="p-6 sm:p-8">
            <Markdown source={policyText ?? ""} />
          </Card>
        </section>
      ) : template === "faq" ? (
        <section className="container max-w-4xl">
          <div className="space-y-8">
            {(shown as FaqPageContent).faqCategories.map((category, index) => (
              <motion.div key={`${category.title}-${index}`} {...fadeUp} transition={{ delay: index * 0.08 }}>
                <SectionCard title={<span className="text-2xl">{category.title}</span>}>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={`${item.question}-${itemIndex}`} value={`${category.title}-${itemIndex}`}>
                        <AccordionTrigger className="text-left font-semibold text-foreground">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </SectionCard>
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <section className="container max-w-4xl">
          <div className="space-y-6">
            {(shown as PolicyPageContent).sections.map((section, index) => (
              <MotionCard
                key={`${section.title}-${index}`}
                {...fadeUp}
                transition={{ delay: index * 0.08 }}
                className="p-6 sm:p-8"
              >
                <h2 className="font-semibold text-2xl mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.title}-${paragraphIndex}`} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </MotionCard>
            ))}
          </div>
        </section>
      )}

      {loading && <div className="sr-only">{t("pages:loadingContent")}</div>}
    </div>
  );
}
