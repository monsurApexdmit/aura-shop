import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductCardProps } from "@/templates/types";
import { useProductCard } from "@/templates/shared/useProductCard";
import { BadgePill } from "./parts";
import { FOCUS, listingLocation, listingSpecs, tile } from "./lib";

/** Listing card: photo with badge pills and price, teal type eyebrow, name, location, spec row. */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();
  const card = useProductCard(product);
  const specs = listingSpecs(product).slice(0, 3);
  const location = listingLocation(product);

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card card-shadow transition-shadow duration-300 hover:card-shadow-hover">
      <div className={cn("relative aspect-[4/3] overflow-hidden", card.image ? "bg-secondary" : tile(index))}>
        {card.image ? (
          <img
            src={card.image}
            alt={product.name}
            loading="lazy"
            onError={card.onImageError}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/30" aria-hidden="true">
            <Building2 className="h-12 w-12" strokeWidth={1.3} />
          </div>
        )}
        {/* Price sits on a soft navy fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />

        <div className="absolute left-2.5 right-12 top-2.5 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
          {card.badge && <BadgePill text={card.badge} />}
          {!card.inStock && <BadgePill text={t("tpl_luxe:card.unavailable")} className="bg-ink/85 text-ink-foreground" />}
        </div>

        <button
          type="button"
          onClick={card.toggleLike}
          aria-label={card.liked ? t("tpl_luxe:card.unsave", { name: product.name }) : t("tpl_luxe:card.save", { name: product.name })}
          aria-pressed={card.liked}
          className={cn("absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:text-primary sm:right-3 sm:top-3", FOCUS)}
        >
          <Heart className={cn("h-4 w-4", card.liked && "fill-highlight text-highlight")} aria-hidden="true" />
        </button>

        <p className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-baseline gap-x-2 text-white sm:bottom-3 sm:left-4">
          <span className="text-base font-bold tracking-tight drop-shadow sm:text-lg">{card.price}</span>
          {card.originalPrice && <span className="text-xs text-white/75 line-through">{card.originalPrice}</span>}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.category && <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{product.category}</p>}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
          <Link to={card.href} className={cn("rounded-sm after:absolute after:inset-0 after:content-[''] hover:text-primary", FOCUS)}>
            {product.name}
          </Link>
        </h3>
        {location && (
          <p className="mt-1.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-highlight" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        )}
        {specs.length > 0 && (
          <div className="mt-auto pt-3">
            <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-border pt-3 text-xs text-foreground/80">
              {specs.map(({ key, label, short, Icon }) => (
                <li key={key} className="flex min-w-0 items-center gap-1.5" title={label}>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="sr-only">{label}: </span>
                  <span className="truncate font-medium">{short}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
