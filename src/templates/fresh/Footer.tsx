import { Link } from "react-router-dom";
import { Banknote, Leaf, Mail, MapPin, Phone, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreChrome, type NavLink } from "../shared/useStoreChrome";

const LINK = "rounded-sm text-sm text-ink-foreground/75 transition-colors hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-foreground";

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={title}>
      <h2 className="font-display text-lg font-bold text-ink-foreground">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={`${l.label}-${l.to}`}>
            <Link to={l.to} className={LINK}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const chrome = useStoreChrome();
  const { contact, freeShippingThreshold, formatCurrency } = chrome;

  const promises = [
    {
      Icon: Truck,
      title: "Delivered in 24 hours",
      text: freeShippingThreshold != null ? `Free over ${formatCurrency(freeShippingThreshold)}` : "Right to your door",
    },
    { Icon: Leaf, title: "Fresh or replaced", text: "Our freshness promise" },
    { Icon: Banknote, title: "Cash on delivery", text: "Pay when it arrives" },
  ];

  return (
    <footer className="mt-10 rounded-t-[2rem] bg-ink text-ink-foreground md:mt-16 md:rounded-t-[3rem]">
      {/* Delivery promise row */}
      <div className="container pt-8 md:pt-12">
        <ul className="grid gap-3 sm:grid-cols-3 md:gap-4">
          {promises.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 rounded-2xl bg-ink-foreground/[0.07] p-3 md:p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-base font-bold leading-tight">{title}</span>
                <span className="block text-xs text-ink-foreground/65">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:py-14">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-foreground">
            {chrome.logo ? (
              <span className="inline-flex rounded-2xl bg-card p-2">
                <img src={chrome.logo} alt={chrome.storeName} className="h-9 w-auto max-w-[180px] object-contain" />
              </span>
            ) : (
              <span className="font-display text-3xl font-extrabold leading-none">{chrome.storeName}</span>
            )}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-foreground/70">
            {chrome.tagline || "Fresh groceries and daily needs, delivered to your door."}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={cn(LINK, "inline-flex items-center gap-2 font-bold text-ink-foreground")}>
                  <Phone className="h-4 w-4 text-highlight" aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className={cn(LINK, "inline-flex items-center gap-2 break-all")}>
                  <Mail className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2 text-ink-foreground/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-highlight" aria-hidden="true" />
                <span>{contact.address}</span>
              </li>
            )}
          </ul>
        </div>
        <LinkColumn title="Shop" links={chrome.shopLinks} />
        <LinkColumn title="Help" links={chrome.helpLinks} />
        <LinkColumn title="Company" links={chrome.companyLinks} />
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="container flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {chrome.socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-full bg-ink-foreground/10 text-ink-foreground transition-colors hover:bg-highlight hover:text-highlight-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-foreground"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
          {chrome.paymentMethods.length > 0 && (
            <ul aria-label="Payment methods" className="flex flex-wrap items-center gap-2">
              {chrome.paymentMethods.map((m) => (
                <li key={m} className="rounded-pill bg-card px-3 py-1 text-xs font-extrabold text-card-foreground">{m}</li>
              ))}
            </ul>
          )}
        </div>
        <p className="container pb-8 text-xs text-ink-foreground/55">
          © {chrome.year} {chrome.storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
