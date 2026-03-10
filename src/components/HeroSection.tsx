import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Copy, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import catHealth from "@/assets/cat-health.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";

const slides = [
  {
    image: heroBanner,
    tag: "New Collection 2026",
    title: "Discover Products That Define Your Style",
    subtitle: "Curated selections across fashion, electronics, health & more — all in one place.",
    cta: "Explore Now",
    link: "/shop",
    gradient: "from-primary/80 via-primary/40 to-transparent",
  },
  {
    image: catGrocery,
    tag: "Farm Fresh",
    title: "Fresh Grocery Delivered in 30 Minutes",
    subtitle: "Handpicked organic fruits, vegetables, and daily essentials at your doorstep.",
    cta: "Order Fresh",
    link: "/shop?category=grocery",
    gradient: "from-accent/70 via-accent/30 to-transparent",
  },
  {
    image: catHealth,
    tag: "Wellness Hub",
    title: "Your Health, Our Priority",
    subtitle: "Shop vitamins, supplements, and medical essentials with certified quality.",
    cta: "Shop Health",
    link: "/shop?category=health",
    gradient: "from-foreground/70 via-foreground/30 to-transparent",
  },
];

const coupons = [
  { code: "HELLO25", discount: "25%", label: "First Order", minOrder: 300, color: "primary" },
  { code: "FLASH40", discount: "40%", label: "Flash Sale", minOrder: 800, color: "accent" },
  { code: "FREE99", discount: "Free Ship", label: "Shipping", minOrder: 99, color: "primary" },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="hero-gradient">
      <div className="container py-5 md:py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-5">
          {/* Slider */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/7] min-h-[300px] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                <img src={slides[current].image} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].gradient}`} />
                <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-14 max-w-xl">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1.5 bg-background/15 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full w-fit mb-4 border border-primary-foreground/10"
                  >
                    <Sparkles className="h-3 w-3" />
                    {slides[current].tag}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-[1.1] mb-4"
                  >
                    {slides[current].title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-primary-foreground/80 text-sm md:text-base mb-6 leading-relaxed max-w-md"
                  >
                    {slides[current].subtitle}
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                    <button
                      onClick={() => navigate(slides[current].link)}
                      className="inline-flex items-center gap-2 bg-background text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-background/90 transition-colors shadow-lg text-sm"
                    >
                      {slides[current].cta} <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            {/* Progress dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === current ? "bg-primary-foreground w-8" : "bg-primary-foreground/40 w-1.5"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Coupon Sidebar */}
          <div className="hidden lg:flex flex-col gap-3">
            <div className="rounded-2xl border border-border bg-card p-5 flex-1">
              <h3 className="font-display font-bold text-sm text-card-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg gradient-accent flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-accent-foreground" />
                </span>
                Active Coupons
              </h3>
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="group/coupon relative rounded-xl border border-dashed border-primary/30 p-3.5 hover:border-primary/60 transition-colors cursor-pointer"
                    onClick={() => copyCode(coupon.code)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg font-display font-bold text-gradient">{coupon.discount}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{coupon.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Min. ${coupon.minOrder}</span>
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-primary">
                        {copiedCode === coupon.code ? (
                          <><Check className="h-3 w-3" /> Copied!</>
                        ) : (
                          <><Copy className="h-3 w-3" /> {coupon.code}</>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stat */}
            <div className="rounded-2xl gradient-primary p-5 text-primary-foreground">
              <p className="text-xs opacity-80 mb-1">Today's orders</p>
              <p className="font-display font-bold text-2xl">2,847+</p>
              <p className="text-xs opacity-70 mt-1">Happy customers shopping now</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}