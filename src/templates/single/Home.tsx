import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStoreChrome } from "@/templates/shared/useStoreChrome";
import { useHomeProducts } from "@/templates/shared/useHomeContent";
import HeroSlider from "./HeroSlider";
import { CategoryCircles, Deals, NewArrivals, Newsletter, PerksBand, PopularPicks, PromoTiles, Testimonials } from "./HomeSections";
import Footer from "./Footer";

/**
 * Kids & Baby home: scalloped hero, category circles, four pastel tiles, Popular Picks (admin product block),
 * perks band, New Arrivals, Deals, parent reviews and the newsletter panel.
 */
export default function Home() {
  const { t } = useTranslation();
  const { storeName } = useStoreChrome();
  const popular = useHomeProducts();
  // New Arrivals skips what Popular Picks already shows (both default to the latest products)
  const shownIds = useMemo(() => (popular.enabled ? popular.products.map((p) => p.id) : []), [popular.enabled, popular.products]);

  return (
    <div className="min-h-screen bg-background">
      <h1 className="sr-only">{storeName ? t("tpl_single:home.heading", { store: storeName }) : t("tpl_single:home.headingNoStore")}</h1>
      <HeroSlider />
      <div className="space-y-10 pt-8 sm:space-y-14 sm:pt-10">
        <CategoryCircles />
        <PromoTiles />
        <PopularPicks {...popular} />
        <PerksBand />
        <NewArrivals exclude={shownIds} />
        <Deals />
        <Testimonials />
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
}
