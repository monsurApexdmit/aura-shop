import { Link } from "react-router-dom";
import { Heart, Plus, ShoppingBasket, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { ProductCardProps } from "../types";
import { useProductCard } from "../shared/useProductCard";
import QtyStepper from "./QtyStepper";
import { FOCUS, tile } from "./lib";

/** "500 g · 1 kg" from the first variant attribute, else the sub-category. */
function unitLine(product: Product, t: TFunction): string {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    const key = Object.keys(variants[0].attributes)[0];
    const values = key ? Array.from(new Set(variants.map((v) => v.attributes[key]).filter(Boolean))) : [];
    if (values.length > 0) return values.slice(0, 3).join(" · ") + (values.length > 3 ? ` +${values.length - 3}` : "");
    return t("tpl_fresh:card.optionCount", { count: variants.length });
  }
  return product.subcategory || "";
}

export function Stars({ rating, reviews, className }: { rating: number; reviews: number; className?: string }) {
  const { t } = useTranslation();
  if (!reviews) return null;
  const rounded = Math.round(rating);
  return (
    <span className={cn("flex items-center gap-1", className)}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={cn("h-3 w-3", n <= rounded ? "fill-amber-400 text-amber-400" : "fill-border text-border")} />
        ))}
      </span>
      <span className="text-[11px] text-muted-foreground">
        <span className="sr-only">
          {t("common:product.ratedOutOf", { rating: rating.toFixed(1) })}, {t("common:product.reviews", { count: reviews })}
        </span>
        <span aria-hidden="true">({reviews})</span>
      </span>
    </span>
  );
}

/**
 * Supermarket card: photo with a discount / "New" tag, unit line, name, stars, orange sale price
 * over the struck-out one, and an outlined "+ Add" that turns into a green stepper once in the cart.
 */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();
  const card = useProductCard(product);
  const inCart = card.quantity > 0;
  const unit = unitLine(product, t);

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-2.5 transition-shadow duration-200 hover:card-shadow-hover">
      <div className={cn("relative aspect-square overflow-hidden rounded-lg", tile(index))}>
        <Link to={card.href} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
          {card.image ? (
            <img
              src={card.image}
              alt=""
              loading="lazy"
              onError={card.onImageError}
              className={cn("h-full w-full object-cover transition-transform duration-300 group-hover:scale-105", !card.inStock && "opacity-50 grayscale")}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-ink/30">
              <ShoppingBasket className="h-12 w-12" strokeWidth={1.5} />
            </span>
          )}
        </Link>

        {card.discount > 0 ? (
          <span className="absolute left-2 top-2 rounded-md bg-highlight px-1.5 py-0.5 text-[11px] font-bold leading-4 text-highlight-foreground">
            -{card.discount}%
          </span>
        ) : card.badge ? (
          <span className="absolute left-2 top-2 max-w-[70%] truncate rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-4 text-primary-foreground">
            {card.badge}
          </span>
        ) : null}
        {!card.inStock && (
          <span className="absolute inset-x-2 bottom-2 rounded-md bg-card/90 py-1 text-center text-[11px] font-bold text-foreground">{t("tpl_fresh:card.soldOut")}</span>
        )}

        <button
          type="button"
          onClick={card.toggleLike}
          aria-label={card.liked ? t("tpl_fresh:card.removeFromWishlist", { name: product.name }) : t("tpl_fresh:card.saveToWishlist", { name: product.name })}
          aria-pressed={card.liked}
          className={cn(
            "absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition-opacity active:scale-90 md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100",
            card.liked && "md:opacity-100",
            FOCUS,
          )}
        >
          <Heart className={cn("h-4 w-4", card.liked && "fill-highlight text-highlight")} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-2.5">
        <p className="h-4 truncate text-[11px] leading-4 text-muted-foreground">{unit}</p>
        <h3 className="mt-0.5 text-[13px] font-semibold leading-5 text-card-foreground">
          <Link to={card.href} className={cn("line-clamp-2 min-h-10 rounded-sm hover:text-primary", FOCUS)}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 h-4">
          <Stars rating={card.rating} reviews={card.reviews} />
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1.5 pt-2.5">
          <p className="flex min-w-0 flex-col leading-none">
            {card.originalPrice && (
              <s className="mb-0.5 text-[11px] text-muted-foreground">
                <span className="sr-only">{t("tpl_fresh:card.was")} </span>
                {card.originalPrice}
              </s>
            )}
            <span className={cn("font-display text-base font-bold tabular-nums", card.discount > 0 ? "text-highlight" : "text-foreground")}>
              {card.discount > 0 && <span className="sr-only">{t("tpl_fresh:card.now")} </span>}
              {card.price}
            </span>
          </p>

          {!card.inStock ? null : inCart ? (
            <QtyStepper
              size="sm"
              name={product.name}
              quantity={card.quantity}
              onIncrement={card.increment}
              onDecrement={card.decrement}
              max={product.stock}
              className="w-[5.5rem]"
            />
          ) : card.hasVariants ? (
            <Link
              to={card.href}
              aria-label={t("tpl_fresh:card.chooseOptionsFor", { name: product.name })}
              className={cn("flex h-8 items-center rounded-pill border border-primary px-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground", FOCUS)}
            >
              {t("tpl_fresh:card.options")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={card.add}
              aria-label={t("tpl_fresh:card.addToCart", { name: product.name })}
              className={cn("flex h-8 items-center gap-1 rounded-pill border border-primary px-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95", FOCUS)}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              {t("tpl_fresh:card.add")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
