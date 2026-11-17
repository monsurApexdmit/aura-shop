import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { formatCurrency, freeShippingThreshold, onlineStore, paymentMethods } = useCurrency();
  const { data: pages = [] } = useStorefrontPages();
  const { data: sections, isLoading } = useHomepageSections();
  const custom = sections?.perks;
  const hasPage = (slug: string) => pages.some((p) => p.slug === slug);
  const policies = onlineStore?.policies;

  const automatic: Perk[] = [
    {
      icon: Truck,
      title: freeShippingThreshold != null ? t("common:money.freeShippingOver", { amount: formatCurrency(freeShippingThreshold) }) : t("home:features.delivery"),
      text: summary(policies?.shipping) || t("home:features.deliveryText"),
      to: hasPage("shipping") ? "/shipping" : undefined,
    },
    ...(policies?.returns || hasPage("returns")
      ? [{
          icon: RotateCcw,
          title: t("home:features.returns"),
          text: summary(policies?.returns) || t("home:features.returnsText"),
          to: hasPage("returns") ? "/returns" : undefined,
        }]
      : []),
    {
      icon: ShieldCheck,
      title: t("home:features.secure"),
      text: paymentMethods.length > 0 ? t("home:features.payWith", { methods: paymentMethods.join(", ") }) : t("home:features.secureText"),
    },
  ];
  const perks: Perk[] = custom
    ? custom.items.map((p) => ({ icon: ICONS[p.icon] ?? Sparkles, title: p.title, text: p.text, to: p.link ?? undefined }))
    : automatic;

  if (isLoading) return null;
  if (custom && (!custom.enabled || perks.length === 0)) return null;

  return (
    <section aria-label={t("home:features.label")} className="container pb-6 pt-2 sm:py-14 md:py-20">
      <ul className={cn("no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 scroll-px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 md:gap-5", perks.length === 3 && "lg:grid-cols-3", perks.length === 4 && "lg:grid-cols-4")}>
        {perks.map(({ icon: Icon, title, text, to }) => {
          const body = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight text-highlight-foreground sm:rounded-xl sm:bg-primary sm:text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold text-foreground sm:mt-5 sm:text-lg">{title}</h3>
                {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
              </div>
            </>
          );
          return (
            <li key={title} className={cn("w-[78%] shrink-0 snap-start sm:w-auto", perks.length === 3 && "sm:last:col-span-2 lg:last:col-span-1")}>
              {to ? (
                <Link to={to} className="flex h-full items-start gap-4 border-t-2 border-foreground pt-4 transition-colors hover:bg-accent sm:block sm:rounded-2xl sm:border-0 sm:bg-secondary sm:p-6">{body}</Link>
              ) : (
                <div className="flex h-full items-start gap-4 border-t-2 border-foreground pt-4 sm:block sm:rounded-2xl sm:border-0 sm:bg-secondary sm:p-6">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
