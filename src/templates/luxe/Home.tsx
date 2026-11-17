import Hero from "./Hero";
import { CtaBand, FeaturedProperties, LatestProperties, PropertyCategories, WhyChooseUs } from "./HomeSections";
import Footer from "./Footer";

/** Property Listings home: photo hero with search and stats, categories, featured listings, why us, latest listings, CTA band. */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Hero />
      <div className="space-y-16 pb-16 pt-14 sm:space-y-20 sm:pb-20 sm:pt-16">
        <PropertyCategories />
        <FeaturedProperties />
        <WhyChooseUs />
        <LatestProperties />
        <CtaBand />
      </div>
      <Footer />
    </div>
  );
}
