import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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

const LINK = "text-sm text-ink-foreground/60 transition-colors hover:text-ink-foreground";

export default function Footer() {
  const { t } = useTranslation();
  const { storeName, paymentMethods, storePhone, storeEmail, storeAddress, bannerUrl, onlineStore } = useCurrency();
  const navLinks = useShopNavLinks();
  const { data: pages = [] } = useStorefrontPages();
  const [email, setEmail] = useState("");
  const { data: sections } = useHomepageSections();
  const { data: collections = [] } = useCollections();
  // Admin: Online store > Homepage sections > Footer text.
  const tagline = sections?.footer ? sections.footer.tagline : t("tpl_editorial:footer.tagline");
  // Pages published with "Footer" placement in admin (Pages); policies and FAQ go under Help.
  const footerPages = pages.filter((p) => p.place === 'footer');
  const toLink = (p: (typeof pages)[number]) => ({ label: p.title, to: pageLinkHref(p.slug) });
  const columns = [
    { title: t("common:nav.shop"), links: [...navLinks, { label: t("tpl_editorial:footer.allClothing"), to: "/shop" }, ...(collections.length > 0 ? [{ label: t("common:nav.collections"), to: "/collections" }] : []), { label: t("common:product.sale"), to: "/deals" }] },
    {
      title: t("tpl_editorial:footer.help"),
      links: [
        ...footerPages.filter((p) => p.type === 'policy' || p.type === 'faq').map(toLink),
        { label: t("common:nav.contact"), to: "/contact" },
        { label: t("common:nav.trackOrder"), to: "/track-order" },
      ],
    },
    {
      title: t("tpl_editorial:footer.company"),
      links: [
        ...footerPages.filter((p) => p.type !== 'policy' && p.type !== 'faq').map(toLink),
        { label: t("common:nav.myAccount"), to: "/account" },
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

  // Phones reach these links from the Categories tab instead.
  return (
    <footer className="mt-8 hidden bg-ink text-ink-foreground md:block">
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12 md:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            {bannerUrl ? (
              <img src={bannerUrl} alt={storeName} className="h-12 w-auto max-w-[220px] rounded-lg object-contain" />
            ) : (
              <span className="font-display text-2xl font-extrabold tracking-tight">{storeName}</span>
            )}
            {tagline && <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-foreground/60">{tagline}</p>}
            <form className="mt-6 flex max-w-sm items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-email" className="sr-only">{t("common:form.emailAddress")}</label>
              <Input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("common:footer.emailPlaceholder")}
                className="h-11 flex-1 rounded-pill border-ink-foreground/15 bg-ink-foreground/5 px-5 text-ink-foreground placeholder:text-ink-foreground/40"
              />
              <Button type="submit" variant="ghost" className="h-11 rounded-pill px-4 font-semibold text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground">
                {t("tpl_editorial:footer.join")}
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
                <p className="flex items-center gap-2.5 text-sm text-ink-foreground/60">
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
      <Separator className="bg-ink-foreground/10" />
      <div className="container flex flex-col items-center justify-between gap-3 py-5 md:flex-row">
        <p className="text-xs text-ink-foreground/50">{t("common:footer.rights", { year, store: storeName })}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {paymentMethods.map((m) => (
            <Badge key={m} variant="outline" className="border-ink-foreground/20 font-medium text-ink-foreground/60">
              {m}
            </Badge>
          ))}
          {socials.map(({ label, href, Icon }) => (
            <WithTooltip key={label} content={label}><Button asChild variant="ghost" size="icon" className="rounded-full text-ink-foreground/60 hover:bg-ink-foreground/10 hover:text-ink-foreground">
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
