import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import contentPageApi, {
  type FaqPageContent,
  type PolicyPageContent,
  type StorefrontPageContent,
  inferPageTemplate,
} from "@/services/contentPageApi";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export const defaultFaqPageContent: FaqPageContent = {
  template: "faq",
  hero: {
    kicker: "Help Center",
    title: "Frequently Asked Questions",
    description: "Find quick answers about orders, delivery, returns, payments, and account support.",
  },
  faqCategories: [
    {
      title: "Orders & Delivery",
      items: [
        {
          question: "How can I track my order?",
          answer: "After your order ships, use Track Order in Aura Shop with your order number and phone or email to see the latest delivery status.",
        },
        {
          question: "How long does delivery take?",
          answer: "Delivery time depends on the shipping method selected at checkout. Standard delivery usually arrives within 2 to 5 business days.",
        },
        {
          question: "Can I change my delivery address after placing an order?",
          answer: "If your order has not been packed yet, support may still be able to update the address. Contact the team as soon as possible.",
        },
      ],
    },
    {
      title: "Payments & Returns",
      items: [
        {
          question: "Which payment methods do you accept?",
          answer: "Aura Shop supports the payment methods configured by your store, including cash on delivery, cards, and digital payment providers when enabled.",
        },
        {
          question: "What if I receive a damaged or incorrect item?",
          answer: "Contact support within 48 hours of delivery with your order details and clear photos so the team can review the case quickly.",
        },
        {
          question: "When will I receive my refund?",
          answer: "Approved refunds are usually processed within 5 to 10 business days, depending on your original payment provider.",
        },
      ],
    },
  ],
  seo: {
    title: "FAQ | Aura Shop",
    description: "Browse frequently asked questions about Aura Shop orders, delivery, returns, payments, and support.",
  },
};

export const defaultReturnsRefundsPageContent: PolicyPageContent = {
  template: "policy",
  hero: {
    kicker: "Customer Care",
    title: "Returns & Refunds",
    description: "Review the conditions, timelines, and process for requesting returns, exchanges, and refunds.",
  },
  sections: [
    {
      title: "Eligibility for Returns",
      paragraphs: [
        "Items may be returned within 7 days of delivery unless marked as final sale, perishable, customized, or otherwise non-returnable.",
        "Returned items must be unused, in original packaging, and include all tags, accessories, manuals, and proof of purchase.",
      ],
    },
    {
      title: "Damaged, Incorrect, or Missing Items",
      paragraphs: [
        "If your order arrives damaged, incomplete, or incorrect, contact support within 48 hours of delivery.",
        "Provide your order number and supporting photos so the team can verify the issue and arrange a replacement, refund, or store credit.",
      ],
    },
    {
      title: "Refund Processing",
      paragraphs: [
        "Once a return is approved and received, refunds are processed back to the original payment method unless another resolution is agreed in writing.",
        "Banks and payment providers may take additional business days to reflect the refund after it has been issued.",
      ],
    },
  ],
  seo: {
    title: "Returns & Refunds | Aura Shop",
    description: "Read Aura Shop return eligibility, damaged item rules, and refund processing timelines.",
  },
};

export const defaultShippingPolicyPageContent: PolicyPageContent = {
  template: "policy",
  hero: {
    kicker: "Delivery Terms",
    title: "Shipping Policy",
    description: "Understand our fulfillment timeline, shipping options, address rules, and delivery exceptions.",
  },
  sections: [
    {
      title: "Order Processing",
      paragraphs: [
        "Orders are processed after payment confirmation or order verification, depending on the payment method used.",
        "Processing may take longer during holidays, flash sales, severe weather events, or periods of unusually high order volume.",
      ],
    },
    {
      title: "Shipping Methods & Delivery Windows",
      paragraphs: [
        "Available shipping methods and estimated delivery timelines are shown at checkout based on your store settings and service coverage.",
        "Delivery estimates are not guaranteed and may vary because of courier delays, remote locations, or force majeure events.",
      ],
    },
    {
      title: "Address Accuracy",
      paragraphs: [
        "Customers are responsible for entering a complete and accurate shipping address, contact number, and recipient details at checkout.",
        "Aura Shop is not responsible for failed delivery attempts caused by incomplete addresses, unavailable recipients, or unreachable phone numbers.",
      ],
    },
  ],
  seo: {
    title: "Shipping Policy | Aura Shop",
    description: "Review Aura Shop shipping rules, processing timelines, delivery windows, and address requirements.",
  },
};

export const defaultPrivacyPolicyPageContent: PolicyPageContent = {
  template: "policy",
  hero: {
    kicker: "Trust & Transparency",
    title: "Privacy Policy",
    description: "Learn what data we collect, how it is used, and the controls available to customers.",
  },
  sections: [
    {
      title: "Information We Collect",
      paragraphs: [
        "Aura Shop may collect account details, contact information, delivery addresses, order history, payment references, and support communications.",
        "We may also collect technical information such as device details, browser data, and usage activity needed to keep the storefront secure and functional.",
      ],
    },
    {
      title: "How We Use Information",
      paragraphs: [
        "Customer data is used to process orders, coordinate delivery, provide support, improve service quality, and comply with legal or financial obligations.",
        "We do not sell customer personal data. Data may be shared with trusted service providers only when required to operate the service.",
      ],
    },
    {
      title: "Retention & Customer Rights",
      paragraphs: [
        "We retain data only as long as needed for operational, legal, tax, fraud prevention, and support purposes.",
        "Customers may request access, correction, or deletion of eligible personal information by contacting the store support team.",
      ],
    },
  ],
  seo: {
    title: "Privacy Policy | Aura Shop",
    description: "Read Aura Shop privacy practices, data usage, retention, and customer rights.",
  },
};

type ContentPageProps = {
  slug: string;
  fallbackContent: StorefrontPageContent;
};

export default function ContentPage({ slug, fallbackContent }: ContentPageProps) {
  const [content, setContent] = useState<StorefrontPageContent>(fallbackContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const page = await contentPageApi.getBySlug(slug);
        if (active && page?.content) {
          setContent(page.content);
          if (page.content.seo?.title) {
            document.title = page.content.seo.title;
          }
        }
      } catch {
        if (active) {
          setContent(fallbackContent);
          if (fallbackContent.seo?.title) {
            document.title = fallbackContent.seo.title;
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

  const template = inferPageTemplate(slug, content);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <section className="container text-center mb-16">
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
          className="text-muted-foreground max-w-3xl mx-auto text-base leading-relaxed"
        >
          {content.hero.description}
        </motion.p>
      </section>

      {template === "faq" ? (
        <section className="container max-w-4xl">
          <div className="space-y-8">
            {(content as FaqPageContent).faqCategories.map((category, index) => (
              <motion.div key={`${category.title}-${index}`} {...fadeUp} transition={{ delay: index * 0.08 }}>
                <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
                  <h2 className="font-display font-bold text-2xl text-foreground mb-5">{category.title}</h2>
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
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <section className="container max-w-4xl">
          <div className="space-y-6">
            {(content as PolicyPageContent).sections.map((section, index) => (
              <motion.div
                key={`${section.title}-${index}`}
                {...fadeUp}
                transition={{ delay: index * 0.08 }}
                className="bg-card border border-border rounded-3xl p-6 sm:p-8"
              >
                <h2 className="font-display font-bold text-2xl text-foreground mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.title}-${paragraphIndex}`} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {loading && <div className="sr-only">Loading page content</div>}
    </div>
  );
}
