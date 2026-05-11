import { Plus, Minus, ShoppingCart, Heart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatCurrency } = useCurrency();

  const liked = isInWishlist(product.id);
  const cartItem = items.find((i) => i.id === String(product.id));
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    addItem({ id: String(product.id), productId: Number(product.id), variantId: null, name: product.name, price: product.price, image: product.image });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/60 hover:border-primary/30 flex flex-col"
    >
      {/* Image Area */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-muted/60 to-muted/20">

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-primary/10 z-10 pointer-events-none" />

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 sm:p-6 group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => { const t = e.target as HTMLImageElement; if (!t.src.includes('placeholder.svg')) t.src = '/placeholder.svg' }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {discount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-lg shadow-rose-500/30"
            >
              -{discount}%
            </motion.span>
          )}
          {!discount && product.badge && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            >
              {product.badge}
            </motion.span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            liked
              ? "bg-rose-500 text-white scale-110 shadow-rose-500/40"
              : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:text-rose-500 hover:scale-110 hover:bg-white"
          }`}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </button>

        {/* Add to cart — slides up on hover (desktop), always visible on mobile */}
        {!cartItem && (
          <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-0 opacity-100 md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 ease-out">
            <button
              onClick={(e) => { e.preventDefault(); handleAdd(); }}
              className="w-full py-3.5 bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-bold tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 gap-2">

        {/* Category */}
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
          {product.category}
        </p>

        {/* Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-sm sm:text-[15px] leading-snug text-card-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating — always shown */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {product.rating.toFixed(1)} ({product.reviews})
          </span>
        </div>

        {/* Price + qty controls */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
            <span className="font-black text-base sm:text-lg text-foreground leading-none">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground/60 line-through font-medium">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {cartItem && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex shrink-0 items-center gap-1 bg-muted rounded-full p-0.5"
            >
              <button
                onClick={() => cartItem.quantity <= 1 ? removeItem(String(product.id)) : updateQuantity(String(product.id), cartItem.quantity - 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-background transition-colors text-foreground"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-sm font-black text-foreground">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(String(product.id), cartItem.quantity + 1)}
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
