import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductCard } from "@/templates/shared/useProductCard";
import type { ProductCardProps } from "@/templates/types";
import { FOCUS } from "./lib";

const MAX_DOTS = 5;

interface LuxeCardProps extends ProductCardProps {
  /** Editorial lead tile: the photo stretches to fill a taller grid cell from md up */
  featured?: boolean;
}

/** Frameless fashion card: photo first, name in spaced capitals, price beneath. */
export function LuxeCard({ product, index = 0, featured = false }: LuxeCardProps) {
  const c = useProductCard(product);
  const label = !c.inStock ? "Sold out" : c.discount > 0 ? `−${c.discount}%` : c.badge;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: "easeOut" }}
      className="group relative flex h-full min-w-0 flex-col"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-secondary",
          featured ? "aspect-[3/4] md:aspect-auto md:min-h-[420px] md:flex-1" : "aspect-[3/4]",
        )}
      >
        <Link to={c.href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
          {c.image ? (
            <>
              <img
                src={c.image}
                alt=""
                loading="lazy"
                onError={c.onImageError}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] [transition-duration:1200ms] ease-out group-hover:scale-[1.03]",
                  c.hoverImage && "md:group-hover:opacity-0",
                )}
              />
              {c.hoverImage && (
                <img
                  src={c.hoverImage}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out md:block md:group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-5xl italic text-muted-foreground/40">
              {product.name.charAt(0)}
            </span>
          )}
        </Link>

        {label && (
          <span className="pointer-events-none absolute left-0 top-0 bg-background px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground sm:left-2 sm:top-2">
            {label}
          </span>
        )}

        <button
          type="button"
          aria-label={c.liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={c.liked}
          onClick={c.toggleLike}
          className={cn(
            "absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-foreground transition-opacity duration-300 sm:right-1 sm:top-1",
            !c.liked && "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
            FOCUS,
          )}
        >
          <Heart className={cn("h-[18px] w-[18px]", c.liked && "fill-current")} strokeWidth={1.25} />
        </button>

        {/* Bag action */}
        {c.quantity > 0 ? (
          <div
            role="group"
            aria-label="Quantity in bag"
            className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between bg-background/95 text-foreground"
          >
            <button type="button" aria-label="Decrease quantity" onClick={c.decrement} className={cn("flex h-10 w-10 items-center justify-center", FOCUS)}>
              <Minus className="h-3.5 w-3.5" strokeWidth={1.25} />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] tabular-nums">{c.quantity} in bag</span>
            <button type="button" aria-label="Increase quantity" onClick={c.increment} className={cn("flex h-10 w-10 items-center justify-center", FOCUS)}>
              <Plus className="h-3.5 w-3.5" strokeWidth={1.25} />
            </button>
          </div>
        ) : c.inStock ? (
          <>
            {/* Desktop: a bar that slides up on hover or keyboard focus */}
            <div className="absolute inset-x-0 bottom-0 hidden translate-y-full transition-transform duration-500 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0 md:block">
              {c.hasVariants ? (
                <Link
                  to={c.href}
                  className={cn("flex h-11 w-full items-center justify-center bg-background/95 text-[11px] uppercase tracking-[0.2em] text-foreground hover:bg-background", FOCUS)}
                >
                  Select options
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={c.add}
                  className={cn("flex h-11 w-full items-center justify-center bg-background/95 text-[11px] uppercase tracking-[0.2em] text-foreground hover:bg-background", FOCUS)}
                >
                  Quick add
                </button>
              )}
            </div>
            {/* Touch: a small square add button (variant products open the page instead) */}
            {!c.hasVariants && (
              <button
                type="button"
                onClick={c.add}
                aria-label={`Add ${product.name} to bag`}
                className={cn("absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center bg-background/90 text-foreground md:hidden", FOCUS)}
              >
                <Plus className="h-4 w-4" strokeWidth={1.25} />
              </button>
            )}
          </>
        ) : null}
      </div>

      <div className={cn("flex flex-col gap-1.5 pt-3 md:pt-4", featured && "md:pt-5")}>
        <Link to={c.href} className={cn("min-w-0", FOCUS)}>
          <h3
            className={cn(
              "line-clamp-2 text-xs font-normal uppercase leading-relaxed tracking-[0.12em] text-foreground underline-offset-4 group-hover:underline",
              featured && "md:text-sm",
            )}
          >
            {product.name}
          </h3>
        </Link>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm tabular-nums">
          {c.originalPrice ? (
            <>
              <span className="sr-only">Sale price</span>
              <span className="text-highlight">{c.price}</span>
              <span className="sr-only">Original price</span>
              <span className="text-xs text-muted-foreground line-through">{c.originalPrice}</span>
            </>
          ) : (
            <span className="text-foreground">{c.price}</span>
          )}
        </p>
        {c.colours.length > 0 && (
          <ul aria-label="Colours" className="flex items-center gap-1.5 pt-0.5">
            {c.colours.slice(0, MAX_DOTS).map((col) => (
              <li
                key={col}
                title={col}
                className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-foreground/20"
                style={{ backgroundColor: col.trim().toLowerCase() }}
              >
                <span className="sr-only">{col}</span>
              </li>
            ))}
            {c.colours.length > MAX_DOTS && (
              <li className="text-[10px] tracking-wider text-muted-foreground">+{c.colours.length - MAX_DOTS}</li>
            )}
          </ul>
        )}
      </div>
    </motion.article>
  );
}

export default function ProductCard(props: ProductCardProps) {
  return <LuxeCard {...props} />;
}
