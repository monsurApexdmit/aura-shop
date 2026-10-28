import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { Plus, Minus, Heart, Shirt } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { WithTooltip } from "@/components/common/WithTooltip"
import { pastel } from "@/lib/pastels";

const MAX_SWATCHES = 4;

// Colour attribute values are free text; only ones the browser can paint get a dot.
const isPaintable = (value: string) =>
  typeof CSS !== "undefined" && CSS.supports?.("color", value.trim().toLowerCase());

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatCurrency } = useCurrency();

  const [imageFailed, setImageFailed] = useState(false);
  // Missing or broken photos keep the pastel tile instead of a grey placeholder.
  const hasImage = !!product.image && !product.image.includes("placeholder") && !imageFailed;

  const liked = isInWishlist(product.id);
  const cartItem = items.find((i) => i.id === String(product.id));
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const badgeLabel = product.badge || (discount > 0 ? `−${discount}%` : undefined);

  // Variant products need a size/colour pick on the product page before adding.
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const colours = Array.from(new Set(
    (product.variants ?? []).flatMap((v) =>
      Object.entries(v.attributes).filter(([k]) => /colou?r/i.test(k)).map(([, val]) => String(val))
    )
  )).filter(isPaintable);

  const handleAdd = () => {
    addItem({
      id: String(product.id),
      productId: Number(product.id),
      variantId: null,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
      viewport={{ once: true }}
      className="group relative flex flex-col"
    >
      {/* Image Area */}
      <div className={cn("relative aspect-[4/5] overflow-hidden rounded-2xl", pastel(index))}>
        <Link to={`/product/${product.slug}`} className="block h-full w-full" tabIndex={-1} aria-hidden="true">
          {hasImage ? (
            <img
              src={product.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-neutral-950/25">
              <Shirt className="h-14 w-14" strokeWidth={1.25} />
            </span>
          )}
        </Link>

        {badgeLabel && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {badgeLabel}
          </span>
        )}

        <WithTooltip content={liked ? "Remove from wishlist" : "Add to wishlist"}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={liked}
            onClick={() => toggleWishlist(product.id)}
            className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-white text-neutral-950 shadow-sm hover:bg-white/90 hover:text-neutral-950"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-highlight text-highlight")} />
          </Button>
        </WithTooltip>

        {/* Bag action: always shown on touch screens, on hover/focus from md up */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 z-10 transition-all duration-200",
            !cartItem && "md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
          )}
        >
          {cartItem ? (
            <div className="flex h-10 items-center justify-between rounded-full bg-white px-1 text-neutral-950 shadow-md" role="group" aria-label="Quantity in bag">
              <WithTooltip content="Decrease quantity"><Button
                variant="ghost"
                size="icon"
                aria-label="Decrease quantity"
                className="h-8 w-8 rounded-full hover:bg-neutral-100 hover:text-neutral-950"
                onClick={() =>
                  cartItem.quantity <= 1
                    ? removeItem(String(product.id))
                    : updateQuantity(String(product.id), cartItem.quantity - 1)
                }
              >
                <Minus className="h-3.5 w-3.5" />
              </Button></WithTooltip>
              <span className="text-xs font-semibold tabular-nums">{cartItem.quantity} in bag</span>
              <WithTooltip content="Increase quantity"><Button
                variant="ghost"
                size="icon"
                aria-label="Increase quantity"
                className="h-8 w-8 rounded-full hover:bg-neutral-100 hover:text-neutral-950"
                onClick={() => updateQuantity(String(product.id), cartItem.quantity + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button></WithTooltip>
            </div>
          ) : hasVariants ? (
            <Button asChild className="h-10 w-full rounded-full bg-white text-xs font-semibold text-neutral-950 shadow-md hover:bg-white/90">
              <Link to={`/product/${product.slug}`}>Choose options</Link>
            </Button>
          ) : (
            <Button onClick={handleAdd} className="h-10 w-full rounded-full bg-white text-xs font-semibold text-neutral-950 shadow-md hover:bg-white/90">
              Add to bag
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/product/${product.slug}`} className="min-w-0">
            <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-foreground">
              {product.name}
            </h3>
          </Link>
          <span className="shrink-0 text-sm font-bold text-foreground">{formatCurrency(product.price)}</span>
        </div>
        <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
          <span className="truncate">{product.category}</span>
          {product.originalPrice && (
            <span className="shrink-0 line-through">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>
        {colours.length > 0 && (
          <ul aria-label="Colours" className="mt-1 flex items-center gap-1.5">
            {colours.slice(0, MAX_SWATCHES).map((c) => (
              <li key={c} title={c} className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/15" style={{ backgroundColor: c.trim().toLowerCase() }}>
                <span className="sr-only">{c}</span>
              </li>
            ))}
            {colours.length > MAX_SWATCHES && (
              <li className="text-[11px] font-medium">+{colours.length - MAX_SWATCHES}</li>
            )}
          </ul>
        )}
      </div>
    </motion.article>
  );
}
