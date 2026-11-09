import { Link } from "react-router-dom";
import { ArrowRight, Banknote, Clock, Gift, Heart, Package, Phone, RotateCcw, ShieldCheck, Sparkles, Star, Truck, type LucideIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductReviews from "@/components/ProductReviews";
import { AccentText } from "@/components/common/AccentText";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { HomepagePerkIcon } from "@/services/storefrontSettingsApi";
import { onProductImageError, type ProductPageState } from "../shared/useProductPage";
import SectionHeading from "./SectionHeading";
import Stars from "./Stars";
import { anchorClick } from "./scroll";
import { tileClass } from "./tiles";

const SECTION = "scroll-mt-20 py-14 md:py-20";

const PERK_ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift,
  star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};

const DEFAULT_PERKS: { icon: LucideIcon; title: string; text: string; link?: string | null }[] = [
  { icon: Sparkles, title: "Premium quality", text: "Carefully made and checked before it leaves us." },
  { icon: Banknote, title: "Cash on delivery", text: "No advance payment. Pay when it reaches your door." },
  { icon: RotateCcw, title: "7-day easy return", text: "Not happy? Tell us within 7 days and we'll sort it out." },
  { icon: Truck, title: "Fast delivery", text: "Quick home delivery, anywhere in the country." },
];

/* ---------------------------------------------------------------- Benefits */

export function Benefits() {
  const { data: sections } = useHomepageSections();
  const perks = sections?.perks;
  const items = perks?.enabled && perks.items.length > 0
    ? perks.items.map((p) => ({ icon: PERK_ICONS[p.icon] ?? Sparkles, title: p.title, text: p.text, link: p.link }))
    : DEFAULT_PERKS;

  return (
    <section id="benefits" aria-labelledby="benefits-title" className={SECTION}>
      <div className="container">
        <SectionHeading id="benefits-title" eyebrow="Why choose us" title="Made to make you *smile*" />
        <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {items.map((item, i) => {
            const body = (
              <>
                <span className={cn("flex size-12 items-center justify-center rounded-2xl text-ink sm:size-14", tileClass(i))}>
                  <item.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="mt-4 block font-display text-sm font-bold leading-snug text-foreground sm:text-lg">{item.title}</span>
                {item.text && <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{item.text}</span>}
              </>
            );
            const cls = "block h-full rounded-[1.5rem] bg-card p-4 card-shadow sm:p-6";
            const link = item.link?.trim();
            return (
              <li key={`${item.title}-${i}`}>
                {link && link.startsWith("/") ? (
                  <Link to={link} className={cn(cls, "transition-shadow hover:card-shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}>{body}</Link>
                ) : link && /^https?:\/\//i.test(link) ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className={cn(cls, "transition-shadow hover:card-shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}>{body}</a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Gallery */

// Varied heights on desktop columns for a masonry feel (full class names so Tailwind keeps them)
const GALLERY_RATIOS = ["md:aspect-[4/5]", "md:aspect-square", "md:aspect-[3/4]", "md:aspect-square", "md:aspect-[4/5]"];

export function Gallery({ page }: { page: ProductPageState }) {
  const images = page.images.filter((src) => !!src);
  if (images.length < 2) return null;
  return (
    <section aria-labelledby="gallery-title" className={cn(SECTION, "bg-secondary/60")}>
      <div className="container">
        <SectionHeading id="gallery-title" eyebrow="Gallery" title="See it up *close*" />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:block md:columns-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
          {images.map((src, i) => (
            <figure
              key={`${src}-${i}`}
              className={cn(
                "w-[78%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] sm:w-[45%] md:mb-4 md:w-full md:break-inside-avoid",
                tileClass(i + 1),
              )}
            >
              <img
                src={src}
                alt={`${page.product.name} — photo ${i + 1}`}
                loading="lazy"
                onError={onProductImageError}
                className={cn("aspect-[4/5] h-full w-full object-cover", GALLERY_RATIOS[i % GALLERY_RATIOS.length])}
              />
            </figure>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground md:hidden">Swipe to see more</p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Description + lookbook */

export function Description({ page }: { page: ProductPageState }) {
  const { data: sections } = useHomepageSections();
  const lookbook = sections?.lookbook?.enabled ? sections.lookbook : null;
  const description = page.product.description?.trim() ?? "";
  if (!description && !lookbook) return null;
  const lookImage = lookbook?.images?.[0] ? getImageUrl(lookbook.images[0]) : page.images[1] ?? page.images[0];
  const link = lookbook?.link?.trim();

  return (
    <section aria-label="Product details" className={SECTION}>
      <div className="container">
        {description && (
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-highlight">The details</p>
            <h2 className="font-display text-[1.65rem] font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              Everything you need to know
            </h2>
            <div className="mt-6 whitespace-pre-line border-l-4 border-highlight pl-5 text-base leading-relaxed text-foreground/85 sm:text-lg">
              {description}
            </div>
          </div>
        )}

        {lookbook && (
          <div className={cn("grid items-center gap-6 overflow-hidden rounded-[2rem] bg-card p-3 card-shadow md:grid-cols-2 md:gap-10 md:p-4", description && "mt-14 md:mt-20")}>
            <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-tile-3 md:aspect-square">
              {lookImage ? (
                <img src={lookImage} alt="" loading="lazy" onError={onProductImageError} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-ink/30"><Sparkles className="size-12" /></span>
              )}
            </div>
            <div className="px-3 pb-5 md:px-4 md:py-6">
              <span className="inline-flex rounded-pill bg-highlight/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-highlight">
                {lookbook.tag?.trim() || "How to use"}
              </span>
              <h2 className="mt-4 text-balance font-display text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
                <AccentText text={lookbook.title?.trim() || "Why you'll *love* it"} accentClassName="not-italic text-highlight" />
              </h2>
              {lookbook.text && <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{lookbook.text}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#order" onClick={anchorClick("order")} className="inline-flex h-12 items-center gap-2 rounded-pill bg-highlight px-6 text-sm font-bold text-highlight-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                  Order now <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                {link && lookbook.cta && (
                  link.startsWith("/") ? (
                    <Link to={link} className="inline-flex h-12 items-center rounded-pill border-2 border-border px-6 text-sm font-bold text-foreground hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{lookbook.cta}</Link>
                  ) : /^https?:\/\//i.test(link) ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center rounded-pill border-2 border-border px-6 text-sm font-bold text-foreground hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{lookbook.cta}</a>
                  ) : null
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Reviews */

export function Reviews({ page }: { page: ProductPageState }) {
  const { product } = page;
  const has = product.reviews > 0;
  return (
    <section id="reviews" aria-labelledby="reviews-title" className={cn(SECTION, "bg-secondary/60")}>
      <div className="container">
        <SectionHeading id="reviews-title" eyebrow="Reviews" title="What our *customers* say" />
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <div className="rounded-[2rem] bg-ink p-6 text-center text-ink-foreground sm:p-8 lg:sticky lg:top-24">
            {has ? (
              <>
                <p className="font-display text-6xl font-extrabold leading-none tracking-tight sm:text-7xl">{product.rating.toFixed(1)}</p>
                <Stars rating={product.rating} className="mt-3" starClassName="size-6 text-highlight-soft" />
                <p className="mt-3 text-sm text-ink-foreground/70">Based on {product.reviews.toLocaleString()} review{product.reviews === 1 ? "" : "s"}</p>
              </>
            ) : (
              <>
                <Stars rating={0} starClassName="size-6 text-ink-foreground/30" />
                <p className="mt-3 font-display text-xl font-bold">No reviews yet</p>
                <p className="mt-2 text-sm text-ink-foreground/70">Bought it already? Be the first to share your experience.</p>
              </>
            )}
            {(product.totalSold ?? 0) > 0 && (
              <p className="mt-5 rounded-pill bg-ink-foreground/10 px-4 py-2 text-sm font-semibold">{(product.totalSold ?? 0).toLocaleString()}+ happy customers</p>
            )}
          </div>
          <div className="min-w-0">
            <ProductReviews productSlug={product.slug} productRating={product.rating} reviewCount={product.reviews} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- FAQ */

export function Faq() {
  const { onlineStore, storePhone } = useCurrency();
  const shipping = onlineStore?.policies?.shipping?.trim();
  const returns = onlineStore?.policies?.returns?.trim();
  const items = [
    {
      q: "How long does delivery take?",
      a: shipping || "Most orders arrive within 2–5 working days. We call you to confirm your order before it ships.",
    },
    {
      q: "Can I pay cash on delivery?",
      a: "Yes. No advance payment is needed — pay the delivery person in cash when your parcel arrives.",
    },
    {
      q: "What if I don't like it?",
      a: returns || "If something is wrong with your order, tell us within 7 days of delivery and we'll replace it or refund you.",
    },
    {
      q: "How do I order?",
      a: "Tap “Order now”, fill in your name, mobile number and address, then press “Confirm order”. That's it — we'll call you to confirm.",
    },
  ];

  return (
    <section id="faq" aria-labelledby="faq-title" className={SECTION}>
      <div className="container max-w-3xl">
        <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions? *Answered.*" />
        <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
          {items.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`} className="rounded-[1.25rem] border-0 bg-card px-5 card-shadow sm:px-6">
              <AccordionTrigger className="gap-3 py-5 text-left font-display text-sm font-bold text-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {storePhone && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Still have a question?{" "}
            <a href={`tel:${storePhone.replace(/\s+/g, "")}`} className="font-bold text-highlight underline-offset-4 hover:underline">
              Call {storePhone}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
