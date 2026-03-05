import { Link } from "react-router-dom";

const footerLinks = {
  Shop: ["All Products", "New Arrivals", "Best Sellers", "Sale"],
  Company: ["About Us", "Careers", "Press", "Blog"],
  Support: ["Help Center", "Returns", "Shipping", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-lg text-foreground">StoreFront</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your one-stop shop for everything — health, fashion, electronics, and more.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display font-semibold text-sm text-foreground mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 StoreFront. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
