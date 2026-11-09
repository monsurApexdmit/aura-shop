import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStoreChrome, type NavLink } from "@/templates/shared/useStoreChrome";
import Newsletter from "./Newsletter";
import { EYEBROW, FOCUS } from "./lib";

/** Quiet footer: the house name set huge, a newsletter line, three link columns, fine print. */
export default function Footer() {
  const chrome = useStoreChrome();
  const columns: { title: string; links: NavLink[] }[] = [
    { title: "Client services", links: chrome.helpLinks },
    { title: "Shop", links: chrome.shopLinks },
    { title: "The house", links: chrome.companyLinks },
  ];

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="container pt-16 md:pt-24">
        <Link to="/" className={cn("block text-center", FOCUS)} aria-label={`${chrome.storeName} home`}>
          <span className="block break-words font-display text-[clamp(2.75rem,12vw,10rem)] font-normal uppercase leading-[0.9] tracking-[0.04em]">
            {chrome.storeName}
          </span>
        </Link>

        <div className="mx-auto mt-14 grid max-w-5xl gap-12 md:mt-20 md:grid-cols-[1.2fr_repeat(3,1fr)] md:gap-10">
          <div>
            <h2 className={cn(EYEBROW, "mb-4 text-muted-foreground")}>Newsletter</h2>
            <p className="mb-4 max-w-xs font-display text-lg leading-snug">
              New arrivals and private sales, <em className="italic">first</em>.
            </p>
            <Newsletter compact className="max-w-sm" />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:col-span-3">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className={cn(EYEBROW, "mb-5 text-muted-foreground")}>{col.title}</h2>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.to + l.label}>
                      <Link to={l.to} className={cn("text-sm text-foreground/85 underline-offset-4 hover:text-foreground hover:underline", FOCUS)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {(chrome.contact.email || chrome.contact.phone) && (
          <p className="mx-auto mt-14 flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-2 text-center text-xs text-muted-foreground">
            {chrome.contact.email && <a href={`mailto:${chrome.contact.email}`} className={cn("hover:text-foreground", FOCUS)}>{chrome.contact.email}</a>}
            {chrome.contact.phone && <a href={`tel:${chrome.contact.phone}`} className={cn("hover:text-foreground", FOCUS)}>{chrome.contact.phone}</a>}
          </p>
        )}

        <div className="mt-14 flex flex-col items-center gap-3 border-t border-border py-8 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:mt-20 md:flex-row md:justify-between md:text-left">
          <p>© {chrome.year} {chrome.storeName}</p>
          {chrome.socials.length > 0 && (
            <p className="flex flex-wrap justify-center gap-x-2">
              {chrome.socials.map((s, i) => (
                <span key={s.label}>
                  {i > 0 && <span aria-hidden="true" className="mr-2">·</span>}
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={cn("hover:text-foreground", FOCUS)}>
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
          )}
          {chrome.paymentMethods.length > 0 && <p>{chrome.paymentMethods.join(" · ")}</p>}
        </div>
      </div>
    </footer>
  );
}
