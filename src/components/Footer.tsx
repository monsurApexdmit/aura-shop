import { Link } from "react-router-dom";
import { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useHomepageSections, useShopNavLinks } from "@/hooks/useHomepageSections";
import { useStorefrontPages, pageLinkHref } from "@/hooks/useStorefrontPages";
import { useCollections } from "@/hooks/useCollections";
import { StoreHoursList } from "@/components/StoreHours";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { WithTooltip } from "@/components/common/WithTooltip"

const LINK = "text-sm text-white/60 transition-colors hover:text-white";

export default function Footer() {
  const { storeName, paymentMethods, storePhone, storeEmail, storeAddress, bannerUrl, onlineStore } = useCurrency();
  const navLinks = useShopNavLinks();
  const { data: pages = [] } = useStorefrontPages();
  const [email, setEmail] = useState("");
  const { data: sections } = useHomepageSections();
  const { data: collections = [] } = useCollections();
  // Admin: Online store > Homepage sections > Footer text.
  const tagline = sections?.footer ? sections.footer.tagline : "Color-forward, joyfully made clothing for women, men and kids.";
  // Pages published with "Footer" placement in admin (Pages); policies and FAQ go under Help.
  const footerPages = pages.filter((p) => p.place === 'footer');
  const toLink = (p: (typeof pages)[number]) => ({ label: p.title, to: pageLinkHref(p.slug) });
  const columns = [
    { title: "Shop", links: [...navLinks, { label: "All clothing", to: "/shop" }, ...(collections.length > 0 ? [{ label: "Collections", to: "/collections" }] : []), { label: "Sale", to: "/deals" }] },
    {
      title: "Help",
      links: [
        ...footerPages.filter((p) => p.type === 'policy' || p.type === 'faq').map(toLink),
        { label: "Contact", to: "/contact" },
        { label: "Track order", to: "/track-order" },
      ],
    },
    {
      title: "Company",
      links: [
        ...footerPages.filter((p) => p.type !== 'policy' && p.type !== 'faq').map(toLink),
        { label: "My account", to: "/account" },
      ],
    },
  ];
  const rawSocial = onlineStore?.social;
  const waRaw = rawSocial?.whatsapp?.trim() ?? '';
  const waHref = waRaw && (/^https?:\/\//i.test(waRaw) ? waRaw : `https://wa.me/${waRaw.replace(/[^0-9]/g, '')}`);
  const socials = [
    { label: 'Facebook', href: rawSocial?.facebook, Icon: Facebook },
    { label: 'Instagram', href: rawSocial?.instagram, Icon: Instagram },
    { label: 'YouTube', href: rawSocial?.youtube, Icon: Youtube },
    { label: 'WhatsApp', href: waHref, Icon: MessageCircle },
  ].filter((x): x is { label: string; href: string; Icon: typeof Facebook } => !!x.href && /^https?:\/\//i.test(x.href));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 bg-[#1C1917] text-white">
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            {bannerUrl ? (
              <img src={bannerUrl} alt={storeName} className="h-12 w-auto max-w-[220px] rounded-lg object-contain" />
            ) : (
              <span className="font-display text-2xl font-extrabold tracking-tight">{storeName}</span>
            )}
            {tagline && <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{tagline}</p>}
            <form className="mt-6 flex max-w-sm items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <Input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 flex-1 rounded-full border-white/15 bg-white/5 px-5 text-white placeholder:text-white/40"
              />
              <Button type="submit" variant="ghost" className="h-11 rounded-full px-4 font-semibold text-white hover:bg-white/10 hover:text-white">
                Join
              </Button>
            </form>
            <div className="mt-6 space-y-2">
              {storePhone && (
                <a href={`tel:${storePhone}`} className={`flex items-center gap-2.5 ${LINK}`}>
                  <Phone className="h-4 w-4 shrink-0" /> {storePhone}
                </a>
              )}
              {storeEmail && (
                <a href={`mailto:${storeEmail}`} className={`flex items-center gap-2.5 ${LINK}`}>
                  <Mail className="h-4 w-4 shrink-0" /> {storeEmail}
                </a>
              )}
              {storeAddress && (
                <p className="flex items-center gap-2.5 text-sm text-white/60">
                  <MapPin className="h-4 w-4 shrink-0" /> {storeAddress}
                </p>
              )}
              <StoreHoursList />
            </div>
          </div>

          {columns.map(({ title, links }, i) => (
            <div key={title} className={i === 0 ? "col-span-1 md:col-span-2 md:col-start-7" : "col-span-1 md:col-span-2"}>
              <h3 className="font-display text-base font-bold">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className={LINK}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-white/10" />
      <div className="container flex flex-col items-center justify-between gap-3 py-5 md:flex-row">
        <p className="text-xs text-white/50">© {year} {storeName}. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {paymentMethods.map((m) => (
            <Badge key={m} variant="outline" className="border-white/20 font-medium text-white/60">
              {m}
            </Badge>
          ))}
          {socials.map(({ label, href, Icon }) => (
            <WithTooltip key={label} content={label}><Button asChild variant="ghost" size="icon" className="rounded-full text-white/60 hover:bg-white/10 hover:text-white">
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <Icon className="h-4 w-4" />
              </a>
            </Button></WithTooltip>
          ))}
        </div>
      </div>
    </footer>
  );
}
