import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Copy, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { couponApi } from "@/services/couponApi";
import storefrontSettingsApi from "@/services/storefrontSettingsApi";
import { api } from "@/lib/api";
import heroBanner from "@/assets/hero-banner.jpg";
import catHealth from "@/assets/cat-health.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";
import { getImageUrl } from "@/lib/api";
import { useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

const fallbackSlides = [
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


export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();
  const { formatCurrency, bannerUrl, storeName } = useCurrency();

  const { data: activeCoupons = [] } = useQuery({
    queryKey: ['coupons-active'],
    queryFn: couponApi.getActive,
    staleTime: 1000 * 60 * 10,
  });

  const { data: storeStats } = useQuery({
    queryKey: ["store-stats"],
    queryFn: () => api.get("/stats").then((r) => r.data.data as { totalOrders: number; totalCustomers: number; todayOrders: number }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: heroSettings } = useQuery({
    queryKey: ["homepage-hero-settings"],
    queryFn: storefrontSettingsApi.getHomepageHero,
    staleTime: 1000 * 60 * 10,
  });

  const slides = useMemo(() => {
    const remoteSlides = (heroSettings?.slides ?? [])
      .filter((slide) => slide.enabled && slide.title && slide.cta)
      .map((slide) => ({
        image: slide.imagePath ? getImageUrl(slide.imagePath) : (bannerUrl ?? heroBanner),
        tag: slide.tag,
        title: slide.title,
        subtitle: slide.subtitle,
        cta: slide.cta,
        link: slide.link || "/shop",
        gradient: slide.gradient || "from-primary/80 via-primary/40 to-transparent",
      }));

    if (remoteSlides.length > 0) return remoteSlides;

    // Use backend banner as first slide image if available
    return fallbackSlides.map((s, i) =>
      i === 0 && bannerUrl ? { ...s, image: bannerUrl } : s
    );
  }, [heroSettings, bannerUrl, storeName]);

  useEffect(() => {
    const autoplayMs = Math.max(2000, heroSettings?.autoplayMs ?? 6000);
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), autoplayMs);
    return () => clearInterval(timer);
  }, [heroSettings?.autoplayMs, slides.length]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  const copyCode = async (code: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      const input = document.createElement("input");
      input.value = code;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCouponPresentation = (coupon: (typeof activeCoupons)[number]) => {
    const campaign = coupon.campaign_name.toLowerCase();
    if (coupon.free_shipping) {
      return {
        accent: "text-emerald-400",
        border: "border-emerald-400/35",
        bg: "bg-emerald-500/10",
        pill: "border-emerald-400/70 text-emerald-300 bg-emerald-500/10",
        badge: "SHIP",
        badgeClass: "bg-emerald-500 text-white",
      };
    }
    if (campaign.includes("flash") || campaign.includes("hot") || campaign.includes("limited")) {
      return {
        accent: "text-red-400",
        border: "border-red-400/35",
        bg: "bg-red-500/10",
        pill: "border-red-400/70 text-red-300 bg-red-500/10",
        badge: "HOT",
        badgeClass: "bg-red-500 text-white",
      };
    }
    if (coupon.type === "percentage") {
      return {
        accent: "text-primary",
        border: "border-primary/35",
        bg: "bg-primary/10",
        pill: "border-primary/70 text-primary bg-primary/10",
        badge: "SAVE",
        badgeClass: "bg-primary text-primary-foreground",
      };
    }
    return {
      accent: "text-accent",
      border: "border-accent/35",
      bg: "bg-accent/10",
      pill: "border-accent/70 text-accent bg-accent/10",
      badge: "DEAL",
      badgeClass: "bg-accent text-accent-foreground",
    };
  };

  const renderCouponCard = (coupon: (typeof activeCoupons)[number], compact = false) => {
    const style = getCouponPresentation(coupon);
    const discountLabel = coupon.free_shipping
      ? "Free"
      : coupon.type === "fixed"
      ? `${formatCurrency(Number(coupon.discount ?? 0))} OFF`
      : `${coupon.discount}%`;
    const isUrgent = style.badge === "HOT";

    return (
      <div
        key={coupon.code}
        className={`group/coupon relative text-left rounded-xl border transition-colors ${style.border} ${style.bg} ${
          compact ? "flex h-[156px] w-full flex-col p-3" : "w-full p-3.5"
        }`}
      >
        <div className="mb-1.5 flex min-h-[34px] items-start justify-between gap-2">
          <span className={`${compact ? "text-[28px] leading-none" : "text-2xl"} font-display font-extrabold ${style.accent}`}>
            {discountLabel}
          </span>
          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none ${style.badgeClass}`}>
            {style.badge}
          </span>
        </div>
        <div className="mb-1.5 min-w-0">
          <p className="truncate text-xs font-semibold text-foreground leading-tight">{coupon.campaign_name}</p>
          {isUrgent && <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">Limited</p>}
        </div>
        <p className="mb-2 truncate text-[11px] leading-tight text-muted-foreground">
          {coupon.min_order_amount ? `Min. ${formatCurrency(Number(coupon.min_order_amount ?? 0))}` : "No minimum"}
        </p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            copyCode(coupon.code);
          }}
          className={`mt-auto flex h-9 w-full items-center justify-center gap-1 rounded-lg border border-dashed px-2 text-[11px] font-mono font-bold leading-none ${style.pill}`}
        >
          {copiedCode === coupon.code ? (
            <><Check className="h-3.5 w-3.5" /> Copied!</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> {coupon.code}</>
          )}
        </button>
        {!compact && (
          <span className="mt-2 block text-[10px] text-muted-foreground">
            Tap to copy
          </span>
        )}
      </div>
    );
  };

  return (
    <section className="hero-gradient">
      <div className="container py-5 md:py-8">
        <div className="grid w-full min-w-0 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-visible">
          {/* Slider */}
          <div className="relative isolate w-full min-w-0 rounded-2xl overflow-hidden min-h-[330px] sm:aspect-[16/9] sm:min-h-[340px] lg:aspect-[16/7] lg:min-h-[300px] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 overflow-hidden"
              >
                <img src={slides[current].image} alt="" className="w-full h-full object-cover object-center" />
                <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].gradient}`} />
                <div className="absolute inset-0 flex max-w-full flex-col justify-center p-5 sm:max-w-xl sm:p-8 md:p-14">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex max-w-[calc(100%-1rem)] items-center gap-1.5 bg-background/15 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full w-fit mb-4 border border-primary-foreground/10"
                  >
                    <Sparkles className="h-3 w-3" />
                    {slides[current].tag}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display max-w-[18rem] text-xl min-[390px]:max-w-[20rem] min-[390px]:text-2xl sm:max-w-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-[1.12] mb-3 sm:mb-4 break-words"
                  >
                    {slides[current].title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-primary-foreground/85 text-sm md:text-base mb-5 sm:mb-6 leading-relaxed max-w-[18rem] min-[390px]:max-w-[21rem] sm:max-w-md"
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
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 w-10 h-10 rounded-xl glass md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % slides.length)}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 w-10 h-10 rounded-xl glass md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
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

          {/* Mobile Coupons */}
          {activeCoupons.length > 0 && (
            <div className="min-w-0 overflow-hidden lg:hidden">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg gradient-accent flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-accent-foreground" />
                  </span>
                  Active Coupons
                </h3>
                <span className="text-[11px] text-muted-foreground">Tap code to copy</span>
              </div>
              <div className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto overscroll-x-contain px-4 pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:w-full sm:px-0">
                <div className="flex w-max gap-3">
                  {activeCoupons.map((coupon) => (
                    <div key={coupon.code} className="w-[156px] shrink-0 min-[420px]:w-[170px]">
                      {renderCouponCard(coupon, true)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Coupon Sidebar */}
          <div className="hidden lg:flex flex-col gap-3">
            <div className="rounded-2xl border border-border bg-card p-5 flex-1">
              <h3 className="font-display font-bold text-sm text-card-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg gradient-accent flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-accent-foreground" />
                </span>
                Active Coupons
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-0.5">
                {activeCoupons.map((coupon) => renderCouponCard(coupon))}
              </div>
            </div>

            {/* Quick stat */}
            <div className="rounded-2xl gradient-primary p-5 text-primary-foreground">
              <p className="text-xs opacity-80 mb-1">Today's orders</p>
              <p className="font-display font-bold text-2xl">
                {storeStats ? (storeStats.todayOrders > 0 ? `${storeStats.todayOrders}+` : "0") : "—"}
              </p>
              <p className="text-xs opacity-70 mt-1">
                {storeStats ? `${storeStats.totalCustomers}+ customers shopping` : "Happy customers shopping now"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
