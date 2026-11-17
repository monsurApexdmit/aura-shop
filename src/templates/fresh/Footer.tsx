import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useStoreChrome, type NavLink } from "../shared/useStoreChrome";
import Brand from "./Brand";
import { FOCUS_ON_DARK, ON_INK_ACCENT } from "./lib";

const LINK = cn("rounded-sm text-[13px] text-ink-foreground/70 transition-colors hover:text-ink-foreground", FOCUS_ON_DARK);
const HEADING = "text-xs font-bold uppercase tracking-[0.12em] text-ink-foreground";

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={title}>
      <h2 className={HEADING}>{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={`${l.label}-${l.to}`}>
            <Link to={l.to} className={LINK}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Dark green footer: brand + socials, link columns, contact, payment badges and the © line. */
export default function Footer() {
  const { t } = useTranslation();
  const chrome = useStoreChrome();
  const { contact, freeShippingThreshold, formatCurrency } = chrome;
  const hasContact = !!(contact.phone || contact.email || contact.address);

  return (
    <footer className="mt-12 bg-ink text-ink-foreground md:mt-16">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-9 py-10 md:grid-cols-3 md:py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Brand storeName={chrome.storeName} logo={chrome.logo} onInk />
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-foreground/70">
            {chrome.tagline || t("tpl_fresh:footer.tagline")}
          </p>
          {chrome.socials.length > 0 && (
            <ul aria-label={t("common:footer.followUs")} className="mt-5 flex flex-wrap gap-2">
              {chrome.socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={cn("flex size-9 items-center justify-center rounded-lg bg-ink-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground", FOCUS_ON_DARK)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          {freeShippingThreshold != null && (
            <p className="mt-5 flex items-start gap-2 text-xs text-ink-foreground/70">
              <Truck className={cn("mt-0.5 h-4 w-4 shrink-0", ON_INK_ACCENT)} aria-hidden="true" />
              {t("tpl_fresh:shared.freeDeliveryOver", { amount: formatCurrency(freeShippingThreshold) })}
            </p>
          )}
        </div>

        <LinkColumn title={t("common:nav.shop")} links={chrome.shopLinks} />
        <LinkColumn title={t("tpl_fresh:shared.customerCare")} links={chrome.helpLinks} />
        <LinkColumn title={t("tpl_fresh:shared.company")} links={chrome.companyLinks} />

        {hasContact && (
          <div className="col-span-2 md:col-span-1">
            <h2 className={HEADING}>{t("tpl_fresh:footer.getInTouch")}</h2>
            <ul className="mt-4 space-y-3 text-[13px]">
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={cn(LINK, "inline-flex items-center gap-2 font-semibold text-ink-foreground")}>
                    <Phone className={cn("h-4 w-4 shrink-0", ON_INK_ACCENT)} aria-hidden="true" />
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className={cn(LINK, "inline-flex items-center gap-2 break-all")}>
                    <Mail className={cn("h-4 w-4 shrink-0", ON_INK_ACCENT)} aria-hidden="true" />
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2 text-ink-foreground/70">
                  <MapPin className={cn("mt-0.5 h-4 w-4 shrink-0", ON_INK_ACCENT)} aria-hidden="true" />
                  <span>{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-ink-foreground/60">{t("common:footer.rights", { year: chrome.year, store: chrome.storeName })}</p>
          {chrome.paymentMethods.length > 0 && (
            <ul aria-label={t("tpl_fresh:footer.paymentMethods")} className="flex flex-wrap items-center gap-1.5">
              {chrome.paymentMethods.map((m) => (
                <li key={m} className="rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-800">{m}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
