import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreChrome, type NavLink } from "@/templates/shared/useStoreChrome";
import { Brand } from "./parts";
import { FOCUS_ON_INK, categoryLink } from "./lib";

const LINK = cn("rounded-sm text-sm text-ink-foreground/70 transition-colors hover:text-ink-foreground", FOCUS_ON_INK);

function Column({ title, links }: { title: string; links: NavLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="min-w-0">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-foreground">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={`${l.label}-${l.to}`} className="truncate">
            <Link to={l.to} className={LINK}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const dedupe = (links: NavLink[]) => links.filter((l, i) => links.findIndex((x) => x.to === l.to) === i);

/** Navy footer: brand, tagline and socials; Explore, Company and Get in touch columns; © line. */
export default function Footer() {
  const { t } = useTranslation();
  const { storeName, logo, tagline, contact, categories, companyLinks, helpLinks, socials, year } = useStoreChrome();

  const explore: NavLink[] = [
    { label: t("tpl_luxe:footer.allProperties"), to: "/shop" },
    ...categories.slice(0, 4).map((c) => ({ label: c.name, to: categoryLink(c) })),
    { label: t("tpl_luxe:footer.savedListings"), to: "/wishlist" },
  ];
  const company = dedupe([...companyLinks, ...helpLinks]);

  return (
    <footer className="relative mt-auto bg-ink text-ink-foreground">
      <div className="h-[3px] bg-gradient-to-r from-primary via-highlight to-primary" aria-hidden="true" />
      <div className="container grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-12 md:py-16">
        <div className="col-span-2 min-w-0 md:col-span-4">
          <Brand logo={logo} storeName={storeName} onInk />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-foreground/70">
            {tagline || t("tpl_luxe:footer.tagline")}
          </p>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cn("flex size-9 items-center justify-center rounded-full border border-ink-foreground/20 text-ink-foreground/80 transition-colors hover:border-highlight hover:text-highlight", FOCUS_ON_INK)}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2 md:col-start-6"><Column title={t("tpl_luxe:footer.explore")} links={explore} /></div>
        <div className="md:col-span-2"><Column title={t("tpl_luxe:footer.company")} links={company} /></div>

        <div className="col-span-2 min-w-0 md:col-span-3">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-foreground">{t("tpl_luxe:footer.getInTouch")}</h2>
          <ul className="space-y-3 text-sm text-ink-foreground/70">
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone}`} className={cn("inline-flex items-center gap-2.5 rounded-sm hover:text-ink-foreground", FOCUS_ON_INK)}>
                  <Phone className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" /> {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li className="min-w-0">
                <a href={`mailto:${contact.email}`} className={cn("inline-flex max-w-full items-center gap-2.5 rounded-sm hover:text-ink-foreground", FOCUS_ON_INK)}>
                  <Mail className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" /> <span className="truncate">{contact.email}</span>
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-highlight" aria-hidden="true" /> <span className="min-w-0 break-words">{contact.address}</span>
              </li>
            )}
            <li>
              <Link to="/contact" className={cn("inline-flex items-center rounded-sm font-semibold text-highlight hover:underline", FOCUS_ON_INK)}>{t("tpl_luxe:footer.sendMessage")}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="container flex flex-col gap-1.5 py-5 text-xs text-ink-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("common:footer.rights", { year, store: storeName })}</p>
          <p>{t("tpl_luxe:footer.strapline")}</p>
        </div>
      </div>
    </footer>
  );
}
