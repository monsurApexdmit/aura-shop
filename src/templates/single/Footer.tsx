import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreChrome, type NavLink } from "@/templates/shared/useStoreChrome";
import { Wave } from "./parts";
import { FOCUS_ON_PURPLE, navLabel } from "./lib";

const LINK = cn("rounded-sm text-sm underline-offset-4 hover:underline", FOCUS_ON_PURPLE);

function LinkColumn({ title, links }: { title: string; links: (NavLink | { label: string; onClick: () => void })[] }) {
  if (links.length === 0) return null;
  return (
    <div className="min-w-0">
      <h2 className="mb-3 font-display text-base font-semibold">{title}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label} className="truncate">
            {"to" in l ? <Link to={l.to} className={LINK}>{l.label}</Link> : <button type="button" onClick={l.onClick} className={LINK}>{l.label}</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Heart icon with its word kept for screen readers ("Picked with <heart>love</heart> …"). */
function HeartWord({ children }: { children?: ReactNode }) {
  return (
    <>
      <Heart className="h-3.5 w-3.5 fill-current text-[hsl(345_100%_82%)]" aria-hidden="true" />
      <span className="sr-only">{children}</span>
    </>
  );
}

/** Purple footer under a wavy edge: brand and socials, Shop / Customer care / About columns, payments and contact. */
export default function Footer() {
  const { storeName, logo, tagline, contact, shopLinks, helpLinks, companyLinks, socials, paymentMethods, cart, year } = useStoreChrome();
  const { t } = useTranslation();
  const name = storeName || t("tpl_single:brand.store");
  const tr = <T extends NavLink>(l: T) => ({ ...l, label: navLabel(t, l) });

  return (
    <footer className="mt-10 sm:mt-14">
      <Wave className="-mb-px text-primary dark:text-ink" />
      <div className="bg-primary text-primary-foreground dark:bg-ink dark:text-ink-foreground">
        <div className="container grid grid-cols-2 gap-x-6 gap-y-8 pb-8 pt-6 sm:pt-8 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div className="col-span-2 min-w-0 md:col-span-3 lg:col-span-1">
            <Link to="/" aria-label={t("tpl_single:brand.home", { store: name })} className={cn("inline-flex max-w-full rounded-xl", FOCUS_ON_PURPLE)}>
              {logo ? (
                <span className="flex h-12 items-center rounded-xl bg-white px-3">
                  <img src={logo} alt="" className="max-h-9 w-auto max-w-[170px] object-contain" />
                </span>
              ) : (
                <span className="truncate font-display text-[26px] font-bold uppercase leading-none tracking-wide" aria-hidden="true">
                  {Array.from(name).map((ch, i) => (
                    <span key={i} className={i % 2 ? "text-[hsl(45_100%_70%)]" : undefined}>{ch}</span>
                  ))}
                </span>
              )}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              {tagline || t("tpl_single:footer.tagline")}
            </p>
            {socials.length > 0 && (
              <ul className="mt-4 flex gap-2">
                {socials.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cn("flex size-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25", FOCUS_ON_PURPLE)}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <LinkColumn title={t("common:nav.shop")} links={[{ label: t("common:nav.allCategories"), to: "/categories" }, ...shopLinks.slice(0, 7).map(tr)]} />
          <LinkColumn
            title={t("common:footer.customerService")}
            links={[...helpLinks.map(tr), { label: t("tpl_single:footer.myWishlist"), to: "/wishlist" }, { label: t("tpl_single:footer.myCart"), onClick: cart.open }]}
          />
          <LinkColumn title={t("tpl_single:footer.aboutUs")} links={companyLinks.map(tr)} />

          <div className="col-span-2 min-w-0 md:col-span-3 lg:col-span-1">
            {paymentMethods.length > 0 && (
              <>
                <h2 className="mb-3 font-display text-base font-semibold">{t("tpl_single:footer.paymentMethods")}</h2>
                <ul className="flex flex-wrap gap-1.5" aria-label={t("tpl_single:footer.paymentMethodsAccepted")}>
                  {paymentMethods.map((m) => (
                    <li key={m} className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-extrabold text-[hsl(252_42%_30%)]">{m}</li>
                  ))}
                </ul>
              </>
            )}
            <ul className={cn("space-y-2 text-sm", paymentMethods.length > 0 && "mt-5")}>
              {contact.email && (
                <li className="min-w-0">
                  <a href={`mailto:${contact.email}`} className={cn("inline-flex max-w-full items-center gap-2 rounded-sm hover:underline", FOCUS_ON_PURPLE)}>
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> <span className="truncate">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone}`} className={cn("inline-flex items-center gap-2 rounded-sm hover:underline", FOCUS_ON_PURPLE)}>
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {contact.phone}
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span className="min-w-0 break-words">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15">
          <div className="container flex flex-col gap-1.5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>{t("common:footer.rights", { year, store: name })}</p>
            <p className="flex items-center gap-1">
              <Trans i18nKey="tpl_single:footer.pickedWithLove" components={{ heart: <HeartWord /> }} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
