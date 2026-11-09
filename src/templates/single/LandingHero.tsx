import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Flame, MessageCircle, Package, RotateCcw, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { onProductImageError, type ProductPageState } from "../shared/useProductPage";
import type { HeroSlide } from "../shared/useHomeContent";
import Stars from "./Stars";
import { anchorClick, excerpt, plainText } from "./scroll";
import { tileClass } from "./tiles";

const TRUST = [
  { icon: Banknote, label: "Cash on delivery" },
  { icon: Truck, label: "Fast delivery" },
  { icon: RotateCcw, label: "Easy returns" },
];

export const PRIMARY_CTA =
  "inline-flex h-14 items-center justify-center gap-2 rounded-pill bg-highlight px-6 text-highlight-foreground shadow-lg shadow-highlight/25 transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Above the fold: name, pitch, big price, order buttons and trust row beside a big photo panel. */
export default function LandingHero({ page, slide }: { page: ProductPageState; slide: HeroSlide | undefined }) {
  const { product, images, selectedImage, setSelectedImage, currentPrice, originalPrice, discount, currentStock, inStock, whatsAppHref, formatCurrency } = page;
  const pitch = slide?.subtitle?.trim() || excerpt(plainText(product.description));
  const sold = product.totalSold ?? 0;
  const image = images[selectedImage] || images[0];

  return (
    <section aria-labelledby="landing-title" className="relative overflow-hidden">
      {/* Soft highlight glow behind the photo */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 size-[28rem] rounded-full bg-highlight/10 blur-3xl" />

      <div className="container relative grid gap-6 pb-10 pt-4 md:grid-cols-2 md:items-center md:gap-10 md:pb-16 md:pt-10 lg:gap-16">
        {/* Photo panel: first on phones */}
        <div className="min-w-0 md:order-last">
          <div className="relative rounded-[2rem] bg-tile-1 p-4 sm:p-8">
            <div className="relative aspect-square overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {image ? (
                  <motion.img
                    key={`${image}-${selectedImage}`}
                    src={image}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    onError={onProductImageError}
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-ink/30"><Package className="size-20" /></span>
                )}
              </AnimatePresence>
            </div>

            {discount > 0 && (
              <span className="absolute -top-2 left-3 flex size-16 -rotate-12 flex-col items-center justify-center rounded-full bg-highlight font-display text-highlight-foreground shadow-lg sm:left-5 sm:size-20">
                <span className="text-base font-extrabold leading-none sm:text-xl">-{discount}%</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider sm:text-[10px]">off</span>
              </span>
            )}
            <span className="absolute bottom-4 right-4 inline-flex animate-float items-center gap-2 rounded-pill bg-card px-3 py-1.5 text-xs font-bold text-foreground card-shadow sm:bottom-6 sm:right-6 sm:text-sm">
              <span className={cn("size-2 rounded-full", !inStock ? "bg-muted-foreground" : currentStock <= 10 ? "animate-pulse bg-destructive" : "bg-highlight")} />
              {!inStock ? "Sold out" : currentStock <= 10 ? `Only ${currentStock} left` : "In stock"}
            </span>
          </div>

          {images.length > 1 && (
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0" role="group" aria-label="Product photos">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={i === selectedImage}
                  className={cn(
                    "size-16 shrink-0 overflow-hidden rounded-2xl border-2 p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-20",
                    tileClass(i),
                    i === selectedImage ? "border-highlight" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={src} alt="" loading="lazy" onError={onProductImageError} className="h-full w-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pitch */}
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-highlight/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-highlight">
            <Flame className="size-3.5" aria-hidden="true" />
            {slide?.tag?.trim() || "Best seller"}
          </span>

          <h1 id="landing-title" className="mt-4 text-balance break-words font-display text-[2rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {product.name}
          </h1>

          {pitch && <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">{pitch}</p>}

          {(product.reviews > 0 || sold > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {product.reviews > 0 && (
                <a href="#reviews" onClick={anchorClick("reviews")} className="inline-flex items-center gap-2 rounded-md font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Stars rating={product.rating} />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </a>
              )}
              {sold > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Zap className="size-4 text-highlight" aria-hidden="true" />
                  {sold.toLocaleString()}+ sold
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-2">
            <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight text-foreground sm:text-6xl">
              {formatCurrency(currentPrice)}
            </span>
            {originalPrice && (
              <div className="flex items-center gap-2 pb-1">
                <span className="text-lg text-muted-foreground line-through sm:text-xl">{formatCurrency(originalPrice)}</span>
                <span className="rounded-pill bg-highlight px-2.5 py-1 text-xs font-bold text-highlight-foreground sm:text-sm">Save {discount}%</span>
              </div>
            )}
          </div>
          {originalPrice && (
            <p className="mt-2 text-sm font-semibold text-highlight">You save {formatCurrency(originalPrice - currentPrice)} today</p>
          )}

          {/* Order buttons */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#order" onClick={anchorClick("order")} className={cn(PRIMARY_CTA, "w-full sm:w-auto sm:px-8")}>
              <span className="font-display text-base font-bold">Order now</span>
              <span className="text-sm font-semibold opacity-90 sm:text-base">— Cash on delivery</span>
            </a>
            {whatsAppHref && (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill border-2 border-foreground/15 bg-card px-6 text-sm font-bold text-foreground transition hover:border-highlight hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-14 sm:w-auto"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                Order on WhatsApp
              </a>
            )}
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-5">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-left">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-highlight">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
