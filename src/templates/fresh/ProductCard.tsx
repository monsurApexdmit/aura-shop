import { Link } from "react-router-dom";
import { Heart, Plus, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductCardProps } from "../types";
import { useProductCard } from "../shared/useProductCard";
import QtyStepper from "./QtyStepper";
import { tile } from "./helpers";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

/**
 * Compact grocery card: photo on a soft tile, round offer badge, and a round "+" that grows into
 * a [− qty +] stepper once the item is in the cart. Fills its column in grids; rails set its width.
 */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const card = useProductCard(product);
  const unit = product.subcategory || product.category;
  const inCart = card.quantity > 0;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-2 card-shadow transition-shadow duration-200 hover:card-shadow-hover">
      <div className={cn("relative aspect-square overflow-hidden rounded-xl", tile(index))}>
        <Link to={card.href} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
          {card.image ? (
            <img
              src={card.image}
              alt=""
              loading="lazy"
              onError={card.onImageError}
              className={cn(
                "h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-105",
                !card.inStock && "opacity-50 grayscale",
              )}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-ink/30">
              <ShoppingBasket className="h-12 w-12" strokeWidth={1.5} />
            </span>
          )}
        </Link>

        {card.discount > 0 ? (
          <span className="absolute left-1.5 top-1.5 flex size-11 -rotate-12 items-center justify-center rounded-full bg-highlight font-display text-[13px] font-extrabold leading-none text-highlight-foreground shadow-sm">
            -{card.discount}%
          </span>
        ) : card.badge ? (
          <span className="absolute left-1.5 top-1.5 max-w-[70%] truncate rounded-pill bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary-foreground">
            {card.badge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={card.toggleLike}
          aria-label={card.liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={card.liked}
          className={cn("absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition-transform active:scale-90", FOCUS)}
        >
          <Heart className={cn("h-4 w-4", card.liked && "fill-primary text-primary")} aria-hidden="true" />
        </button>

        {/* Quick add: round + that expands leftwards into the stepper */}
        <div className="absolute bottom-1.5 right-1.5 flex justify-end">
          {!card.inStock ? (
            <span className="flex h-8 items-center rounded-pill border border-border bg-card px-2.5 text-[11px] font-extrabold text-muted-foreground">
              Sold out
            </span>
          ) : card.hasVariants && !inCart ? (
            <Link
              to={card.href}
              aria-label={`Choose options for ${product.name}`}
              className={cn("flex h-9 items-center rounded-pill border-2 border-primary bg-card px-3 text-xs font-extrabold text-primary shadow-sm transition-transform active:scale-95", FOCUS)}
            >
              Options
            </Link>
          ) : (
            <div
              className={cn(
                "overflow-hidden rounded-pill shadow-md transition-[width] duration-300 ease-out",
                inCart ? "w-[6.5rem]" : "w-9",
              )}
            >
              {inCart ? (
                <QtyStepper
                  size="sm"
                  name={product.name}
                  quantity={card.quantity}
                  onIncrement={card.increment}
                  onDecrement={card.decrement}
                  max={product.stock}
                  className="w-[6.5rem]"
                />
              ) : (
                <button
                  type="button"
                  onClick={card.add}
                  aria-label={`Add ${product.name} to cart`}
                  className={cn("flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90", FOCUS)}
                >
                  <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-0.5 pt-2">
        <h3 className="text-[13px] font-bold leading-5 text-card-foreground sm:text-sm">
          <Link to={card.href} className={cn("line-clamp-2 min-h-10 rounded-sm hover:text-primary", FOCUS)}>
            {product.name}
          </Link>
        </h3>
        {unit && <p className="mt-0.5 truncate text-xs text-muted-foreground">{unit}</p>}
        <p className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-1.5">
          <span className="font-display text-[17px] font-extrabold leading-none text-primary">{card.price}</span>
          {card.originalPrice && (
            <s className="text-xs text-muted-foreground">
              <span className="sr-only">was </span>
              {card.originalPrice}
            </s>
          )}
        </p>
      </div>
    </article>
  );
}
