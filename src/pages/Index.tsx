import HeroSection from "@/components/HeroSection";
import CouponStrip from "@/components/CouponStrip";
import DepartmentAisles from "@/components/DepartmentAisles";
import HomepageProducts from "@/components/HomepageProducts";
import HomepageCollections from "@/components/HomepageCollections";
import LookbookBanner from "@/components/LookbookBanner";
import FeaturesBar from "@/components/FeaturesBar";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <HeroSection />
    <CouponStrip />
    <DepartmentAisles />
    <HomepageProducts />
    <HomepageCollections />
    <LookbookBanner />
    <FeaturesBar />
    <Footer />
  </div>
);

export default Index;
