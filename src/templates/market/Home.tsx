import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import HeroSlider from "./HeroSlider";
import { BestAndNew, FeaturedProducts, Perks, ShopByCategory } from "./HomeSections";
import { Newsletter, PromoBanners, StatsBar, Testimonials } from "./HomeExtras";
import Footer from "./Footer";
import { WRAP } from "./lib";

/**
 * Tech Store home, top to bottom: hero slider, service perks, category cards, featured tabs,
 * three promo banners, best sellers beside new arrivals, stats, testimonials and newsletter.
 */
export default function Home() {
  const { storeName } = useStoreChrome();
  return (
    <div className="min-h-screen bg-background">
      <h1 className="sr-only">{storeName}</h1>
      <div className="space-y-8 pb-12 pt-4 sm:space-y-10 sm:pt-6 lg:space-y-12 lg:pb-16">
        <div className={WRAP}><HeroSlider /></div>
        <div className="!mt-4 sm:!mt-5"><Perks /></div>
        <ShopByCategory />
        <FeaturedProducts />
        <PromoBanners />
        <BestAndNew />
        <StatsBar />
        <Testimonials />
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
}
