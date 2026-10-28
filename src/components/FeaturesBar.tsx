import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Truck, RotateCcw, ShieldCheck, Heart, Gift, Star, Sparkles, Package, Clock, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useStorefrontPages } from "@/hooks/useStorefrontPages";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import type { HomepagePerkIcon } from "@/services/storefrontSettingsApi";

const ICONS: Record<HomepagePerkIcon, LucideIcon> = {
  truck: Truck, rotate: RotateCcw, shield: ShieldCheck, heart: Heart, gift: Gift,
  star: Star, sparkles: Sparkles, package: Package, clock: Clock, phone: Phone,
};

const MAX_TEXT = 90;

// First sentence of an admin policy, trimmed to fit a card.
function summary(policy: string | undefined) {
  const first = policy?.trim().split(/(?<=[.!?])\s/)[0] ?? "";
  return first.length > MAX_TEXT ? `${first.slice(0, MAX_TEXT - 1).trimEnd()}…` : first;
}

interface Perk {
  icon: LucideIcon;
  title: string;
  text: string;
  to?: string;
}

// Admin can write these cards (Online store > Homepage sections > Perk cards). Otherwise they are built
// from the free-shipping threshold, Online store policies, published pages and payment gateways.
export default function FeaturesBar() {
  const { formatCurrency, freeShippingThreshold, onlineStore, paymentMethods } = useCurrency();
  const { data: pages = [] } = useStorefrontPages();
  const { data: sections, isLoading } = useHomepageSections();
  const custom = sections?.perks;
  const hasPage = (slug: string) => pages.some((p) => p.slug === slug);
  const policies = onlineStore?.policies;

  const automatic: Perk[] = [
    {
      icon: Truck,
      title: freeShippingThreshold != null ? `Free shipping over ${formatCurrency(freeShippingThreshold)}` : "Delivery to your door",
      text: summary(policies?.shipping) || "See delivery areas, charges and timelines.",
      to: hasPage("shipping") ? "/shipping" : undefined,
    },
    ...(policies?.returns || hasPage("returns")
      ? [{
          icon: RotateCcw,
          title: "Returns & exchanges",
          text: summary(policies?.returns) || "See what you can return and how.",
          to: hasPage("returns") ? "/returns" : undefined,
        }]
      : []),
    {
      icon: ShieldCheck,
      title: "Secure checkout",
      text: paymentMethods.length > 0 ? `Pay with ${paymentMethods.join(", ")}.` : "Your payment details stay protected.",
    },
  ];
  const perks: Perk[] = custom
    ? custom.items.map((p) => ({ icon: ICONS[p.icon] ?? Sparkles, title: p.title, text: p.text, to: p.link ?? undefined }))
    : automatic;

  if (isLoading) return null;
  if (custom && (!custom.enabled || perks.length === 0)) return null;

  return (
    <section aria-label="Store perks" className="container py-14 md:py-20">
      <ul className={cn("grid gap-4 sm:grid-cols-2 md:gap-5", perks.length === 3 && "lg:grid-cols-3", perks.length === 4 && "lg:grid-cols-4")}>
        {perks.map(({ icon: Icon, title, text, to }) => {
          const body = (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">{title}</h3>
              {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
            </>
          );
          return (
            <li key={title} className={cn(perks.length === 3 && "sm:last:col-span-2 lg:last:col-span-1")}>
              {to ? (
                <Link to={to} className="block h-full rounded-2xl bg-secondary p-6 transition-colors hover:bg-accent">{body}</Link>
              ) : (
                <div className="h-full rounded-2xl bg-secondary p-6">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
