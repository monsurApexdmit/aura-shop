import { Link } from "react-router-dom";
import { Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { useStoreChrome } from "../shared/useStoreChrome";
import Logo from "./Logo";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary";

/** Compact centred footer: who we are, how to reach us, policies, payment methods. */
export default function Footer() {
  const chrome = useStoreChrome();
  const { phone, email, address } = chrome.contact;
  const whatsApp = chrome.socials.find((s) => s.label === "WhatsApp");
  const socials = chrome.socials.filter((s) => s.label !== "WhatsApp");

  const contacts: { icon: LucideIcon; label: string; href?: string; external?: boolean }[] = [
    ...(phone ? [{ icon: Phone, label: phone, href: `tel:${phone.replace(/\s+/g, "")}` }] : []),
    ...(whatsApp ? [{ icon: MessageCircle, label: "WhatsApp", href: whatsApp.href, external: true }] : []),
    ...(email ? [{ icon: Mail, label: email, href: `mailto:${email}` }] : []),
    ...(address ? [{ icon: MapPin, label: address }] : []),
  ];

  const links = [{ label: "Shop all", to: "/shop" }, ...chrome.helpLinks, ...chrome.companyLinks];

  return (
    <footer className="border-t border-border bg-secondary text-foreground">
      <div className="container flex max-w-4xl flex-col items-center gap-6 py-12 text-center md:py-14">
        <div className="flex flex-col items-center gap-2">
          <Logo logo={chrome.logo} storeName={chrome.storeName} imgClassName="h-10 max-w-[180px]" />
          {chrome.tagline && <p className="max-w-md text-sm text-muted-foreground">{chrome.tagline}</p>}
        </div>

        {contacts.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2">
            {contacts.map(({ icon: Icon, label, href, external }) => {
              const body = (
                <>
                  <Icon className="size-4 shrink-0 text-highlight" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </>
              );
              const cls = "inline-flex h-10 max-w-full items-center gap-2 rounded-pill bg-card px-4 text-sm font-medium text-foreground card-shadow";
              return (
                <li key={label} className="max-w-full">
                  {href ? (
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${cls} transition hover:text-highlight ${FOCUS}`}>{body}</a>
                  ) : (
                    <span className={cls}>{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <nav aria-label="Help and policies">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={`${l.label}-${l.to}`}>
                <Link to={l.to} className={`rounded-sm text-muted-foreground transition hover:text-foreground ${FOCUS}`}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {socials.length > 0 && (
          <ul className="flex justify-center gap-2">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex size-11 items-center justify-center rounded-full bg-ink text-ink-foreground transition hover:bg-highlight hover:text-highlight-foreground ${FOCUS}`}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}

        {chrome.paymentMethods.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">We accept</p>
            <ul className="flex flex-wrap justify-center gap-1.5">
              {chrome.paymentMethods.map((m) => (
                <li key={m} className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground">{m}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground">© {chrome.year} {chrome.storeName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
