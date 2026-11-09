import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { useHomeProducts, useProductList } from "../shared/useHomeContent";
import Landing from "./Landing";
import Footer from "./Footer";
import { HeroSkeleton } from "./HeroSkeleton";

/**
 * "/" is the landing page for the store's lead product: the admin's homepage product pick
 * (Homepage sections > Products: featured or a category), else the newest product.
 */
export default function Home() {
  const home = useHomeProducts();
  const latest = useProductList("latest", { limit: 6, enabled: !home.isLoading });
  const lead = (home.enabled ? home.products[0] : undefined) ?? latest.products[0];

  if (lead) return <Landing key={lead.slug} slug={lead.slug} />;

  if (home.isLoading || latest.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <HeroSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
        <span className="flex size-20 items-center justify-center rounded-[1.75rem] bg-tile-1 text-ink">
          <PackageOpen className="size-9" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">Something good is coming</h1>
        <p className="mt-3 max-w-md text-muted-foreground">We're getting our products ready. Check back soon, or get in touch and we'll tell you first.</p>
        <Link
          to="/contact"
          className="mt-8 inline-flex h-12 items-center rounded-pill bg-highlight px-7 font-bold text-highlight-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Contact us
        </Link>
      </div>
      <Footer />
    </div>
  );
}
