import { BadgeCheck, Banknote, Package, Phone, RotateCcw, Truck } from "lucide-react";
import { QuickOrderForm } from "@/pages/QuickOrder";
import { useCurrency } from "@/contexts/CurrencyContext";
import { onProductImageError, type ProductPageState } from "../shared/useProductPage";
import SectionHeading from "./SectionHeading";

const GUARANTEES = [
  { icon: Banknote, label: "No advance payment — pay cash when it arrives" },
  { icon: Truck, label: "Fast home delivery" },
  { icon: RotateCcw, label: "Easy returns if something's wrong" },
];

/** The goal of the page: product recap beside the real order form. */
export default function OrderSection({ page, slug }: { page: ProductPageState; slug: string }) {
  const { storePhone } = useCurrency();
  const { product, images, currentPrice, originalPrice, discount, formatCurrency } = page;
  const image = images[0];

  return (
    <section id="order" aria-labelledby="order-title" className="scroll-mt-16 bg-ink py-14 text-ink-foreground md:py-20">
      <div className="container">
        <SectionHeading id="order-title" invert eyebrow="Order in 1 minute" title="Order now — pay when it *arrives*" subtitle="Fill in your details and we'll call you to confirm." />

        <div className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-8 lg:gap-10">
          {/* Recap */}
          <aside aria-label="Your order" className="rounded-[2rem] bg-card p-4 text-foreground card-shadow sm:p-6 md:sticky md:top-24">
            <div className="flex items-center gap-4 md:block">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-[1.25rem] bg-tile-2 p-2 sm:size-28 md:aspect-square md:size-auto md:w-full md:rounded-[1.5rem] md:p-6">
                {image ? (
                  <img src={image} alt="" loading="lazy" onError={onProductImageError} className="h-full w-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="flex h-full items-center justify-center text-ink/30"><Package className="size-10" /></span>
                )}
                {discount > 0 && (
                  <span className="absolute left-2 top-2 rounded-pill bg-highlight px-2 py-0.5 font-display text-[10px] font-bold text-highlight-foreground md:left-4 md:top-4 md:text-sm">-{discount}%</span>
                )}
              </div>
              <div className="min-w-0 md:mt-5">
                <p className="line-clamp-2 font-display text-base font-bold leading-snug sm:text-xl">{product.name}</p>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{formatCurrency(currentPrice)}</span>
                  {originalPrice && <span className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>}
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
              {GUARANTEES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3 text-sm font-medium">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-highlight/10 text-highlight">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="pt-1.5 leading-snug">{label}</span>
                </li>
              ))}
            </ul>

            {storePhone && (
              <a
                href={`tel:${storePhone.replace(/\s+/g, "")}`}
                className="mt-5 flex h-12 items-center justify-center gap-2 rounded-pill bg-secondary px-4 text-sm font-bold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Phone className="size-4" aria-hidden="true" />
                Prefer to call? {storePhone}
              </a>
            )}
          </aside>

          {/* Form */}
          <div className="min-w-0 rounded-[2rem] bg-card p-4 text-foreground card-shadow sm:p-6 md:p-8">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-highlight">
              <BadgeCheck className="size-5" aria-hidden="true" />
              Safe & simple — no account needed
            </div>
            <QuickOrderForm slug={slug} embedded />
          </div>
        </div>
      </div>
    </section>
  );
}
