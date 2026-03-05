import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  Company: ["About Us", "Contact Us", "Careers", "Latest News"],
  "Top Categories": ["Electronics", "Fashion", "Health & Medicine", "Grocery"],
  "My Account": ["Dashboard", "My Orders", "Account Details", "Wishlist"],
  "Customer Care": ["FAQ", "Returns", "Shipping Info", "Help Center"],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-lg text-background">StoreFront</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed mb-4">
              Your one-stop shop for everything — health, fashion, electronics, grocery, and more.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-background/60">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                123 Commerce St, NY 10001
              </div>
              <div className="flex items-center gap-2 text-xs text-background/60">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                +1 234-567-890
              </div>
              <div className="flex items-center gap-2 text-xs text-background/60">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                support@storefront.com
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display font-semibold text-sm text-background mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-sm text-background/50 hover:text-primary transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment & Copyright */}
        <div className="border-t border-background/10 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-background/40">
              © 2026 StoreFront. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((method) => (
                <span key={method} className="text-[10px] px-3 py-1.5 rounded bg-background/10 text-background/60 font-medium">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
