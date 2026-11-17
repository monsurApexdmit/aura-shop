import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingCart, ToyBrick } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductCard } from "@/templates/shared/useProductCard";
import type { ProductCardProps } from "@/templates/types";
import { Stars } from "./parts";
import { FOCUS, tone } from "./lib";

const CART_BUTTON = "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors";

/**
 * Kids card: white rounded card, photo on a pastel tile with a discount / badge pill and a heart,
 * two-line name, price with strike, stars and a round cart button (options lead to the product page).
 */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();
  const c = useProductCard(product);
  const tn = tone(index);
  const isNewBadge = !!c.badge && /new/i.test(c.badge);

  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-2 card-shadow transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:card-shadow-hover motion-reduce:hover:translate-y-0">
      <div className={cn("relative aspect-square overflow-hidden rounded-xl", tn.bg)}>
        {c.image ? (
          <img
            src={c.image}
            alt=""
            loading="lazy"
            onError={c.onImageError}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center" aria-hidden="true">
            <ToyBrick className={cn("h-10 w-10 opacity-60", tn.fg)} strokeWidth={1.6} />
          </span>
        )}
        <div className="absolute left-2 top-2 flex max-w-[70%] flex-col items-start gap-1">
          {c.discount > 0 && (
            <span className="rounded-pill bg-highlight px-2 py-0.5 text-[10px] font-extrabold leading-tight text-highlight-foreground sm:text-[11px]">-{c.discount}%</span>
          )}
          {c.badge && (
            <span className={cn("max-w-full truncate rounded-pill px-2 py-0.5 text-[10px] font-extrabold leading-tight sm:text-[11px]", isNewBadge ? "bg-[hsl(152_65%_29%)] text-white" : "bg-primary text-primary-foreground")}>
              {c.badge}
            </span>
          )}
        </div>
        {!c.inStock && (
          <span className="absolute inset-x-2 bottom-2 rounded-pill bg-foreground/75 py-1 text-center text-[11px] font-bold text-background">{t("tpl_single:card.soldOut")}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-2.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13px] font-bold leading-[1.25] text-foreground sm:text-sm">
          <Link to={c.href} className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
          {c.hasVariants && <span className="text-[11px] font-semibold text-muted-foreground">{t("tpl_single:card.from")}</span>}
          <span className="font-display text-base font-semibold text-foreground sm:text-[17px]">{c.price}</span>
          {c.originalPrice && (
            <span className="text-[11px] text-muted-foreground line-through">
              <span className="sr-only">{t("tpl_single:card.was")}</span>{c.originalPrice}
            </span>
          )}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {c.reviews > 0 ? (
            <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
              <Stars rating={c.rating} />
              <span aria-hidden="true">({c.reviews})</span>
              <span className="sr-only">{t("tpl_single:card.ratedFrom", { rating: c.rating.toFixed(1), count: c.reviews })}</span>
            </span>
          ) : (
            <span className="truncate text-[11px] text-muted-foreground">{product.category}</span>
          )}

          {c.hasVariants ? (
            <Link to={c.href} aria-label={t("tpl_single:card.chooseOptionsFor", { name: product.name })} className={cn(CART_BUTTON, "bg-accent text-primary hover:bg-primary hover:text-primary-foreground", FOCUS)}>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : !c.inStock ? (
            <span className={cn(CART_BUTTON, "bg-secondary text-muted-foreground/60")} aria-hidden="true">
              <ShoppingCart className="h-4 w-4" />
            </span>
          ) : (
            <button
              type="button"
              onClick={c.increment}
              aria-label={c.quantity > 0 ? t("tpl_single:card.addAnother", { name: product.name, count: c.quantity }) : t("tpl_single:card.addNamed", { name: product.name })}
              className={cn(CART_BUTTON, c.quantity > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-accent text-primary hover:bg-primary hover:text-primary-foreground", FOCUS)}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {c.quantity > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight px-1 text-[9px] font-extrabold leading-none text-highlight-foreground ring-2 ring-card" aria-hidden="true">
                  {c.quantity}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={c.toggleLike}
        aria-label={c.liked ? t("tpl_single:card.removeNamed", { name: product.name }) : t("tpl_single:card.saveNamed", { name: product.name })}
        aria-pressed={c.liked}
        className={cn("absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition-colors hover:text-highlight", FOCUS)}
      >
        <Heart className={cn("h-4 w-4", c.liked && "fill-highlight text-highlight")} aria-hidden="true" />
      </button>
    </article>
  );
}
