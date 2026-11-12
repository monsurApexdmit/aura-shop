import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreChrome, type NavLink } from "@/templates/shared/useStoreChrome";
import { FOCUS, WRAP, navLabel } from "./lib";

const LINK = cn("rounded-sm text-[13px] text-muted-foreground transition-colors hover:text-primary", FOCUS);

type FooterLink = NavLink | { label: string; onClick: () => void };

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="min-w-0">
      <h2 className="mb-3.5 text-[13px] font-bold text-foreground">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={"to" in l ? l.to : l.label} className="truncate">
            {"to" in l ? <Link to={l.to} className={LINK}>{l.label}</Link> : <button type="button" onClick={l.onClick} className={LINK}>{l.label}</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

const uniq = <T extends FooterLink>(links: T[]) => {
  const seen = new Set<string>();
  return links.filter((l) => {
    const key = "to" in l ? l.to : l.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/** White footer: brand and socials, Shop / Customer care / Company / Information / Get in touch, then © and payment badges. */
export default function Footer() {
  const { t } = useTranslation();
  const { storeName, logo, tagline, contact, shopLinks, helpLinks, companyLinks, utilityLinks, collections, socials, paymentMethods, cart, year } = useStoreChrome();

  const tr = <T extends NavLink>(l: T) => ({ ...l, label: navLabel(t, l) });
  const shop = uniq([{ label: t("tpl_market:footer.allProducts"), to: "/shop" }, ...shopLinks.filter((l) => l.to !== "/shop" && l.label !== "Shop all").map(tr)]).slice(0, 8);
  const care = uniq([...helpLinks.map(tr), { label: t("tpl_market:footer.returnsRefunds"), to: "/returns" }]);
  const info = uniq<FooterLink>([
    ...utilityLinks.filter((l) => l.to !== "/contact").map(tr),
    { label: t("common:nav.allCategories"), to: "/categories" },
    ...(collections.length > 0 ? [{ label: t("common:nav.collections"), to: "/collections" }] : []),
    { label: t("common:nav.wishlist"), to: "/wishlist" },
    { label: t("tpl_market:footer.myCart"), onClick: cart.open },
  ]);

  return (
    <footer className="border-t border-border bg-card">
      <div className={cn(WRAP, "grid grid-cols-2 gap-x-6 gap-y-9 py-10 md:grid-cols-3 md:py-12 lg:grid-cols-[1.6fr_repeat(5,minmax(0,1fr))]")}>
        <div className="col-span-2 min-w-0 md:col-span-3 lg:col-span-1 lg:pr-6">
          <Link to="/" aria-label={t("tpl_market:nav.storeHome", { store: storeName })} className={cn("inline-flex rounded-sm", FOCUS)}>
            {logo ? (
              <img src={logo} alt="" className="h-9 w-auto max-w-[170px] object-contain" />
            ) : (
              <span className="font-display text-xl font-extrabold tracking-tight text-foreground">{storeName}</span>
            )}
          </Link>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            {tagline || t("tpl_market:footer.tagline")}
          </p>
          {socials.length > 0 && (
            <ul className="mt-4 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cn("flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", FOCUS)}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <LinkColumn title={t("common:nav.shop")} links={shop} />
        <LinkColumn title={t("common:footer.customerService")} links={care} />
        <LinkColumn title={t("tpl_market:footer.company")} links={companyLinks.map(tr)} />
        <LinkColumn title={t("common:footer.information")} links={info} />

        {(contact.phone || contact.email || contact.address) && (
          <div className="col-span-2 min-w-0 md:col-span-1">
            <h2 className="mb-3.5 text-[13px] font-bold text-foreground">{t("tpl_market:footer.getInTouch")}</h2>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground">
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone}`} className={cn("inline-flex items-center gap-2 rounded-sm hover:text-primary", FOCUS)}>
                    <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="min-w-0">
                  <a href={`mailto:${contact.email}`} className={cn("inline-flex max-w-full items-center gap-2 rounded-sm hover:text-primary", FOCUS)}>
                    <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> <span className="truncate">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> <span className="break-words">{contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border">
        <div className={cn(WRAP, "flex flex-col gap-3 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between")}>
          <p>{t("common:footer.rights", { year, store: storeName })}</p>
          {paymentMethods.length > 0 && (
            <ul aria-label={t("tpl_market:footer.paymentMethods")} className="flex flex-wrap gap-1.5">
              {paymentMethods.map((m) => (
                <li key={m} className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground/80">{m}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
