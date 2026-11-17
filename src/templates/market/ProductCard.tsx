import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ImageOff, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductCard } from "@/templates/shared/useProductCard";
import type { ProductCardProps } from "@/templates/types";
import { Stars } from "./parts";
import { FOCUS } from "./lib";

const ICON_BTN = "relative flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors";

/**
 * Tech Store card: square photo with a red discount pill (or the product's own badge), two-line name,
 * amber stars with the review count, price and strike price, and a small cart button. Products with
 * options open their page from that button instead of adding.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const c = useProductCard(product);

  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-xl border border-border bg-card p-2 card-shadow transition-[box-shadow,border-color] duration-200 hover:border-primary/30 hover:card-shadow-hover sm:p-2.5">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        {c.image ? (
          <img
            src={c.image}
            alt=""
            loading="lazy"
            onError={c.onImageError}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground/50" aria-hidden="true">
            <ImageOff className="h-8 w-8" />
          </span>
        )}
        <div className="absolute left-2 top-2 flex max-w-[70%] flex-col items-start gap-1">
          {c.discount > 0 && (
            <span className="rounded-pill bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-tight text-destructive-foreground sm:text-[11px]">
              -{c.discount}%
            </span>
          )}
          {c.badge && (
            <span className="max-w-full truncate rounded-pill bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold leading-tight text-white sm:text-[11px]">
              {c.badge}
            </span>
          )}
        </div>
        {!c.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-background">
            {t("tpl_market:card.soldOut")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-2.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13px] font-semibold leading-[1.25] text-foreground">
          <Link to={c.href} className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:text-primary focus-visible:after:ring-2 focus-visible:after:ring-ring">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 flex h-4 items-center gap-1 text-[11px] text-muted-foreground">
          {c.reviews > 0 ? (
            <>
              <Stars rating={c.rating} />
              <span className="font-semibold text-foreground">{c.rating.toFixed(1)}</span>
              <span>({c.reviews})</span>
              <span className="sr-only">{t("tpl_market:card.ratedFrom", { rating: c.rating.toFixed(1), count: c.reviews })}</span>
            </>
          ) : c.sold > 0 ? (
            <span>{t("tpl_market:card.sold", { count: c.sold })}</span>
          ) : null}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 tabular-nums">
            {c.hasVariants && <span className="text-[11px] text-muted-foreground">{t("tpl_market:card.from")}</span>}
            <span className="text-[15px] font-bold leading-tight text-foreground sm:text-base">{c.price}</span>
            {c.originalPrice && <span className="text-[11px] text-muted-foreground line-through">{c.originalPrice}</span>}
          </p>

          {/* Above the stretched name link */}
          <div className="relative z-10">
            {c.hasVariants ? (
              <Link
                to={c.href}
                aria-label={t("tpl_market:card.chooseOptionsFor", { name: product.name })}
                className={cn(ICON_BTN, "border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground", FOCUS)}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : !c.inStock ? (
              <button type="button" disabled aria-label={t("tpl_market:card.isSoldOut", { name: product.name })} className={cn(ICON_BTN, "border-border text-muted-foreground/50")}>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={c.increment}
                aria-label={c.quantity > 0 ? t("tpl_market:card.addAnother", { name: product.name, count: c.quantity }) : t("tpl_market:card.addNamed", { name: product.name })}
                className={cn(
                  ICON_BTN,
                  c.quantity > 0 ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : "border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground",
                  FOCUS,
                )}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {c.quantity > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground ring-2 ring-card" aria-hidden="true">
                    {c.quantity}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wishlist: shows on hover/focus on desktop, always on touch screens and once saved */}
      <button
        type="button"
        onClick={c.toggleLike}
        aria-label={c.liked ? t("tpl_market:card.removeNamed", { name: product.name }) : t("tpl_market:card.saveNamed", { name: product.name })}
        aria-pressed={c.liked}
        className={cn(
          "absolute right-3.5 top-3.5 z-10 flex size-8 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition-opacity hover:text-destructive sm:right-4 sm:top-4",
          !c.liked && "md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100",
          FOCUS,
        )}
      >
        <Heart className={cn("h-4 w-4", c.liked && "fill-destructive text-destructive")} aria-hidden="true" />
      </button>
    </article>
  );
}
