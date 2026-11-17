import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { couponApi } from "@/services/couponApi";
import storefrontSettingsApi from "@/services/storefrontSettingsApi";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Announcement {
  text: string;
  link?: string;
}

// Built only from admin data: Settings > Promo banner, online coupons, and the free-shipping threshold.
// Renders nothing when none of them are set.
export default function AnnouncementBar() {
  const { t } = useTranslation();
  const { formatCurrency, freeShippingThreshold } = useCurrency();
  const { data: promo } = useQuery({
    queryKey: ["promo-banner"],
    queryFn: storefrontSettingsApi.getPromoBanner,
    staleTime: 1000 * 60 * 10,
  });
  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons-active"],
    queryFn: couponApi.getActive,
    staleTime: 1000 * 60 * 10,
  });

  const items: Announcement[] = [];
  if (promo?.enabled && promo.title) {
    items.push({ text: `✨ ${promo.title}${promo.cta ? ` — ${promo.cta} →` : ""}`, link: promo.link || "/deals" });
  }
  for (const c of coupons) {
    const offer = c.free_shipping
      ? t("home:coupons.freeShipping")
      : t("common:product.off", { value: c.type === "fixed" ? formatCurrency(Number(c.discount ?? 0)) : `${c.discount}%` });
    const text = c.min_order_amount
      ? t("home:announcement.couponMin", { code: c.code, offer, amount: formatCurrency(Number(c.min_order_amount)) })
      : t("home:announcement.coupon", { code: c.code, offer });
    items.push({ text: `🏷️ ${text}` });
  }
  if (freeShippingThreshold != null) {
    items.push({ text: `🚚 ${t("common:money.freeShippingOver", { amount: formatCurrency(freeShippingThreshold) })}` });
  }
  if (items.length === 0) return null;

  // Repeated so one copy fills wide screens; the track scrolls by half its width.
  const copies = Math.max(2, Math.ceil(6 / items.length));
  const run = Array.from({ length: copies }, () => items).flat();

  const renderRun = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {run.map((item, i) => {
        const isCopy = hidden || i >= items.length;
        return (
          <li key={i} aria-hidden={isCopy || undefined} className="whitespace-nowrap px-6 text-[10px] font-bold uppercase tracking-[0.18em] md:text-xs md:font-medium md:normal-case md:tracking-normal">
            {item.link ? (
              <Link to={item.link} tabIndex={isCopy ? -1 : undefined} className="hover:underline underline-offset-4">{item.text}</Link>
            ) : item.text}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div aria-label={t("home:announcement.label")} role="region" className="overflow-hidden bg-ink text-ink-foreground">
      <div className="flex w-max animate-marquee py-2 hover:[animation-play-state:paused] motion-reduce:animate-none">
        {renderRun(false)}
        {renderRun(true)}
      </div>
    </div>
  );
}
