import { Link } from "react-router-dom";
import { Lock, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreChrome, type NavLink } from "@/templates/shared/useStoreChrome";
import { FOCUS } from "./lib";

const LINK = cn("rounded-sm text-[13px] text-muted-foreground transition-colors hover:text-highlight", FOCUS);

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.to + l.label} className="truncate">
            <Link to={l.to} className={LINK}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Utilitarian marketplace footer: store and contact, three link columns, payment and social chips. */
export default function Footer() {
  const { storeName, logo, tagline, contact, helpLinks, shopLinks, companyLinks, paymentMethods, socials, year } = useStoreChrome();
  const payWith = paymentMethods.length > 0 ? paymentMethods : ["Cash on delivery"];

  return (
    <footer className="border-t border-border bg-card">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-3 md:py-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 min-w-0 md:col-span-3 lg:col-span-1">
          <Link to="/" className={cn("inline-block rounded-sm", FOCUS)}>
            {logo ? (
              <img src={logo} alt={storeName} className="h-10 w-auto max-w-[180px] object-contain" />
            ) : (
              <span className="font-display text-xl font-extrabold tracking-tight text-foreground">{storeName}</span>
            )}
          </Link>
          {tagline && <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{tagline}</p>}
          <ul className="mt-4 space-y-2 text-[13px]">
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone}`} className={cn("flex items-center gap-2 text-foreground hover:text-highlight", "rounded-sm", FOCUS)}>
                  <Phone className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" /> {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li className="min-w-0">
                <a href={`mailto:${contact.email}`} className={cn("flex min-w-0 items-center gap-2 rounded-sm text-foreground hover:text-highlight", FOCUS)}>
                  <Mail className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" /> <span className="truncate">{contact.email}</span>
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-highlight" aria-hidden="true" /> {contact.address}
              </li>
            )}
          </ul>
        </div>

        <LinkColumn title="Customer care" links={helpLinks} />
        <LinkColumn title="Shop" links={shopLinks} />
        <LinkColumn title="Company" links={companyLinks} />

        <div className="col-span-2 min-w-0 md:col-span-3 lg:col-span-1">
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">Pay with</h3>
          <ul className="flex flex-wrap gap-1.5">
            {payWith.map((m) => (
              <li key={m} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">{m}</li>
            ))}
          </ul>
          {socials.length > 0 && (
            <>
              <h3 className="mb-3 mt-6 font-display text-sm font-bold uppercase tracking-wide text-foreground">Follow us</h3>
              <ul className="flex gap-2">
                {socials.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn("flex size-9 items-center justify-center rounded-md bg-ink text-ink-foreground transition-colors hover:bg-highlight hover:text-highlight-foreground", FOCUS)}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="bg-ink text-ink-foreground">
        <div className="container flex flex-col items-center justify-between gap-1.5 py-3 text-center text-xs sm:flex-row sm:text-left">
          <p className="text-ink-foreground/75">© {year} {storeName}. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-ink-foreground/75">
            <Lock className="h-3.5 w-3.5 text-highlight-soft" aria-hidden="true" /> 100% secure checkout · Your details stay private
          </p>
        </div>
      </div>
    </footer>
  );
}
