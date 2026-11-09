import { Link } from "react-router-dom";
import { Heart, ImageOff, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductCard } from "@/templates/shared/useProductCard";
import type { ProductCardProps } from "@/templates/types";
import { FOCUS, compactNumber } from "./lib";

/**
 * Dense marketplace tile: square photo, discount flag, two-line name, raspberry price,
 * rating · sold, and a one-tap cart button that turns into a stepper. Fits two across a 360px phone.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const c = useProductCard(product);

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:border-transparent hover:card-shadow-hover">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {c.image ? (
          <img
            src={c.image}
            alt=""
            loading="lazy"
            onError={c.onImageError}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground/60" aria-hidden="true">
            <ImageOff className="h-8 w-8" />
          </span>
        )}
        {c.discount > 0 && (
          <span className="absolute left-0 top-2 rounded-r-sm bg-highlight px-1.5 py-0.5 text-[11px] font-bold leading-tight text-highlight-foreground">
            -{c.discount}%
          </span>
        )}
        {c.badge && (
          <span className={cn("absolute left-0 max-w-[70%] truncate rounded-r-sm bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-tight text-ink-foreground", c.discount > 0 ? "top-8" : "top-2")}>
            {c.badge}
          </span>
        )}
        {!c.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-foreground">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2 sm:p-2.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] leading-5 text-foreground sm:text-sm">
          <Link to={c.href} className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline">
            {product.name}
          </Link>
        </h3>

        {(c.rating > 0 || c.sold > 0) && (
          <p className="flex min-w-0 items-center gap-1 text-[11px] leading-none text-muted-foreground">
            {c.rating > 0 && (
              <>
                <Star className="h-3 w-3 shrink-0 fill-highlight text-highlight" aria-hidden="true" />
                <span className="font-medium text-foreground">{c.rating.toFixed(1)}</span>
                {c.reviews > 0 && <span>({compactNumber(c.reviews)})</span>}
              </>
            )}
            {c.rating > 0 && c.sold > 0 && <span aria-hidden="true">·</span>}
            {c.sold > 0 && <span className="truncate">{compactNumber(c.sold)} sold</span>}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-1 pt-1">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight tabular-nums text-highlight sm:text-base">{c.price}</p>
            {c.originalPrice ? (
              <p className="truncate text-xs leading-tight tabular-nums text-muted-foreground line-through">{c.originalPrice}</p>
            ) : (
              <p className="text-xs leading-tight" aria-hidden="true">&nbsp;</p>
            )}
          </div>
          <div className="relative z-10 shrink-0">
            {c.hasVariants ? (
              <Link to={c.href} className={cn("flex h-8 items-center rounded-md border border-border px-2 text-[11px] font-semibold text-foreground hover:border-highlight hover:text-highlight", FOCUS)}>
                Options
              </Link>
            ) : !c.inStock ? null : c.quantity > 0 ? (
              <div className="flex h-8 items-center rounded-md border border-highlight bg-card">
                <button type="button" onClick={c.decrement} aria-label={`Remove one ${product.name}`} className={cn("flex h-full w-6 items-center justify-center rounded-l-md text-highlight hover:bg-highlight/10", FOCUS)}>
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="min-w-[1.125rem] text-center text-xs font-bold tabular-nums text-foreground" aria-live="polite">{c.quantity}</span>
                <button type="button" onClick={c.increment} aria-label={`Add one more ${product.name}`} className={cn("flex h-full w-6 items-center justify-center rounded-r-md text-highlight hover:bg-highlight/10", FOCUS)}>
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={c.add} aria-label={`Add ${product.name} to cart`} className={cn("flex size-8 items-center justify-center rounded-md bg-ink text-ink-foreground transition-colors hover:bg-highlight hover:text-highlight-foreground", FOCUS)}>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={c.toggleLike}
        aria-label={c.liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={c.liked}
        className={cn(
          "absolute right-1.5 top-1.5 z-10 flex size-7 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition-opacity hover:text-highlight",
          !c.liked && "md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100",
          FOCUS,
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", c.liked && "fill-highlight text-highlight")} aria-hidden="true" />
      </button>
    </article>
  );
}
