import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const footerLinks = {
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Contact Us", to: "/contact" },
    { label: "Careers", to: "/careers" },
    { label: "Press", to: "/press" },
  ],
  "Customer Care": [
    { label: "FAQ", to: "/faq" },
    { label: "Returns & Refunds", to: "/returns" },
    { label: "Shipping Policy", to: "/shipping" },
    { label: "Privacy Policy", to: "/privacy" },
  ],
  "My Account": [
    { label: "Dashboard", to: "/account" },
    { label: "Order History", to: "/orders" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Track Order", to: "/track-order" },
  ],
};

export default function Footer() {
  const { data: categories = [] } = useCategories();
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">S</span>
              </div>
              <div>
                <span className="font-display font-bold text-lg text-background leading-none">StoreFront</span>
                <p className="text-[9px] text-background/40 uppercase tracking-[0.2em]">Marketplace</p>
              </div>
            </div>
            <p className="text-sm text-background/50 leading-relaxed mb-5 max-w-xs">
              Your universal marketplace for health, fashion, electronics, grocery & beyond. Quality products, fast delivery.
            </p>
            <div className="space-y-2.5">
              <a href="tel:+1234567890" className="flex items-center gap-2.5 text-sm text-background/50 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                +1 234-567-890
              </a>
              <a href="mailto:hello@storefront.com" className="flex items-center gap-2.5 text-sm text-background/50 hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                hello@storefront.com
              </a>
              <p className="flex items-center gap-2.5 text-sm text-background/50">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                123 Commerce St, NY
              </p>
            </div>
          </div>

          {/* Top Categories */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-display font-semibold text-sm text-background mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/shop?cat=${cat.slug}`} className="text-sm text-background/40 hover:text-primary transition-colors flex items-center gap-1 group">
                    {cat.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1 md:col-span-2">
              <h3 className="font-display font-semibold text-sm text-background mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-background/40 hover:text-primary transition-colors flex items-center gap-1 group">
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/30">
            © 2026 StoreFront. All rights reserved. Built with ❤️
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Visa", "Mastercard", "PayPal", "Apple Pay", "GPay"].map((m) => (
              <span key={m} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-background/8 text-background/40 font-medium border border-background/5">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
