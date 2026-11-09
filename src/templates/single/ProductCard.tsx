import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductCard } from "../shared/useProductCard";
import type { ProductCardProps } from "../types";
import Stars from "./Stars";
import { tileClass } from "./tiles";

/** Chunky rounded card with a pastel photo tile, big price and a full-width "Order now" button. */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const card = useProductCard(product);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.05, ease: "easeOut" }}
      className="group flex h-full min-w-0 flex-col rounded-[1.5rem] bg-card p-2 text-card-foreground card-shadow transition-shadow hover:card-shadow-hover"
    >
      <Link
        to={card.href}
        tabIndex={-1}
        aria-hidden="true"
        className={cn("relative block aspect-square overflow-hidden rounded-[1.1rem]", tileClass(index))}
      >
        {card.image ? (
          <img
            src={card.image}
            alt=""
            loading="lazy"
            onError={card.onImageError}
            className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-ink/30">
            <Package className="size-10" />
          </span>
        )}
        {card.discount > 0 && (
          <span className="absolute left-0 top-3 rounded-r-pill bg-highlight py-1 pl-2.5 pr-3 font-display text-xs font-bold text-highlight-foreground shadow-sm">
            -{card.discount}%
          </span>
        )}
        {card.badge && (
          <span className="absolute right-2 top-2 max-w-[60%] truncate rounded-pill bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-foreground">
            {card.badge}
          </span>
        )}
        {!card.inStock && (
          <span className="absolute inset-x-2 bottom-2 rounded-pill bg-ink/85 py-1 text-center text-xs font-bold text-ink-foreground">Sold out</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
          <Link to={card.href} className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {product.name}
          </Link>
        </h3>
        {card.reviews > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Stars rating={card.rating} starClassName="size-3" />
            <span>({card.reviews})</span>
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-2">
          <span className="font-display text-base font-extrabold tracking-tight text-foreground sm:text-xl">{card.price}</span>
          {card.originalPrice && <span className="text-xs text-muted-foreground line-through">{card.originalPrice}</span>}
        </div>
        <Link
          to={card.href}
          aria-label={`Order ${product.name}`}
          className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-pill bg-highlight px-3 text-sm font-bold text-highlight-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          Order now
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
