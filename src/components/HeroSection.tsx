import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Copy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";
import catHealth from "@/assets/cat-health.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";

const slides = [
  {
    image: heroBanner,
    title: "The Best Quality Products Guaranteed!",
    subtitle: "Shop from thousands of products across all categories with guaranteed quality and fast delivery.",
    cta: "Shop Now",
  },
  {
    image: catGrocery,
    title: "Fresh Grocery & Daily Essentials",
    subtitle: "Get fresh vegetables, fruits, and daily essentials delivered to your doorstep.",
    cta: "Buy Now",
  },
  {
    image: catHealth,
    title: "Health & Wellness Products",
    subtitle: "Take care of yourself with our curated health and wellness collection.",
    cta: "Explore",
  },
];

const coupons = [
  { code: "WELCOME20", discount: "20%", title: "Welcome Gift Voucher", minOrder: 500, active: true },
  { code: "SUMMER24", discount: "10%", title: "Summer Sale Voucher", minOrder: 1000, active: true },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section className="bg-muted/30">
      <div className="container py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Slider */}
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-[16/7] min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img
                  src={slides[current].image}
                  alt={slides[current].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 max-w-lg">
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-background leading-tight mb-3">
                    {slides[current].title}
                  </h1>
                  <p className="text-background/80 text-sm md:text-base mb-6 line-clamp-2">
                    {slides[current].subtitle}
                  </p>
                  <div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6">
                      {slides[current].cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-background/60"}`}
                />
              ))}
            </div>
          </div>

          {/* Coupons Sidebar */}
          <div className="hidden lg:block rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-bold text-base text-card-foreground mb-4 text-center">
              Latest Super Discount Active Coupon Code
            </h3>
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.code} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-lg text-primary">{coupon.discount} Off</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${coupon.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {coupon.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-card-foreground">{coupon.title}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        <span>Limited time offer</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <button
                        onClick={() => navigator.clipboard.writeText(coupon.code)}
                        className="border-2 border-dashed border-primary rounded-md px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center gap-1.5"
                      >
                        <Copy className="h-3 w-3" />
                        {coupon.code}
                      </button>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Min. order ${coupon.minOrder.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
