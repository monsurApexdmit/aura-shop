import { useId } from "react";
import { Link } from "react-router-dom";
import { Banknote, Bike, Copy, Percent, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { CouponResult } from "@/services/couponApi";
import { SectionHeading } from "./Rail";
import { copyCode, couponCondition, couponOffer } from "./helpers";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Big yellow coupon card for the hero's side column / phone carousel. */
export function CouponCard({ coupon, className }: { coupon: CouponResult; className?: string }) {
  const { formatCurrency } = useCurrency();
  return (
    <div className={cn("relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-highlight p-5 text-highlight-foreground", className)}>
      <Percent className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 opacity-10" strokeWidth={2.5} aria-hidden="true" />
      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-wider opacity-75">{coupon.campaign_name || "Today's offer"}</p>
        <p className="mt-1 font-display text-[1.4rem] font-extrabold leading-[1.05] md:text-xl lg:text-2xl xl:text-[1.75rem]">
          Use code {coupon.code} — {couponOffer(coupon, formatCurrency)}
        </p>
        <p className="mt-1 text-sm font-semibold opacity-80">{couponCondition(coupon, formatCurrency)}</p>
      </div>
      <button
        type="button"
        onClick={() => copyCode(coupon.code)}
        aria-label={`Copy code ${coupon.code}`}
        className={cn("relative mt-4 flex h-10 w-fit items-center gap-2 rounded-pill bg-card px-4 text-sm font-extrabold text-card-foreground shadow-sm transition-transform active:scale-95", FOCUS)}
      >
        <Copy className="h-4 w-4" aria-hidden="true" />
        Copy code
      </button>
    </div>
  );
}

/** Store promise card used when there are no coupons to show. */
export function PromiseCard({ kind, className }: { kind: "delivery" | "cod"; className?: string }) {
  const { formatCurrency, freeShippingThreshold } = useCurrency();
  const content: { Icon: LucideIcon; tag: string; title: string; text: string; tileClass: string } =
    kind === "delivery"
      ? {
          Icon: Bike,
          tag: "Delivery",
          title: freeShippingThreshold != null ? `Free delivery over ${formatCurrency(freeShippingThreshold)}` : "Fast home delivery",
          text: "Order today, get it within 24 hours.",
          tileClass: "bg-tile-2",
        }
      : {
          Icon: Banknote,
          tag: "Easy payment",
          title: "Cash on delivery",
          text: "Pay when your groceries arrive.",
          tileClass: "bg-tile-4",
        };
  const { Icon } = content;
  return (
    <Link
      to="/shop"
      className={cn("group relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-5 text-ink", content.tileClass, FOCUS, className)}
    >
      <Icon className="pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 opacity-15 transition-transform duration-300 group-hover:-rotate-6" strokeWidth={1.75} aria-hidden="true" />
      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-wider opacity-70">{content.tag}</p>
        <p className="mt-1 font-display text-[1.4rem] font-extrabold leading-[1.05] md:text-xl lg:text-2xl xl:text-[1.75rem]">{content.title}</p>
        <p className="mt-1 text-sm font-semibold opacity-80">{content.text}</p>
      </div>
      <span className="relative mt-4 w-fit rounded-pill bg-ink px-4 py-2 text-sm font-extrabold text-ink-foreground">Shop now</span>
    </Link>
  );
}

/** "Offers for you": yellow tickets with a dashed tear line and a copyable code. */
export function OfferTickets({ coupons }: { coupons: CouponResult[] }) {
  const { formatCurrency } = useCurrency();
  const headingId = useId();
  if (coupons.length === 0) return null;
  return (
    <section aria-labelledby={headingId} className="py-4 md:py-6">
      <SectionHeading id={headingId} title="Offers for you" subtitle="Tap a code to copy it, then paste at checkout" />
      <ul className="container no-scrollbar flex snap-x scroll-px-4 gap-3 overflow-x-auto pb-1 md:gap-4">
        {coupons.map((c) => (
          <li key={c.code} className="w-[280px] shrink-0 snap-start md:w-[320px]">
            <div className="relative flex h-full min-h-[104px] overflow-hidden rounded-2xl bg-highlight text-highlight-foreground">
              <div className="min-w-0 flex-1 p-4">
                <p className="font-display text-2xl font-extrabold leading-none">{couponOffer(c, formatCurrency)}</p>
                {c.campaign_name && <p className="mt-1.5 truncate text-sm font-bold">{c.campaign_name}</p>}
                <p className="mt-0.5 text-xs font-semibold opacity-75">{couponCondition(c, formatCurrency)}</p>
              </div>
              <div className="relative flex w-[104px] shrink-0 flex-col items-center justify-center gap-1.5 border-l-2 border-dashed border-highlight-foreground/30 px-2">
                <span aria-hidden="true" className="absolute -left-[13px] -top-3 size-6 rounded-full bg-background" />
                <span aria-hidden="true" className="absolute -bottom-3 -left-[13px] size-6 rounded-full bg-background" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">Code</span>
                <button
                  type="button"
                  onClick={() => copyCode(c.code)}
                  aria-label={`Copy code ${c.code}`}
                  className={cn("flex max-w-full items-center gap-1 rounded-pill bg-card px-2.5 py-1.5 text-card-foreground shadow-sm transition-transform active:scale-95", FOCUS)}
                >
                  <span className="truncate font-mono text-xs font-extrabold">{c.code}</span>
                  <Copy className="h-3 w-3 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
