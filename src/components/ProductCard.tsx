import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/data/products";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import QuickActionButtons from "@/components/common/QuickActionButtons";
import RatingDisplay from "@/components/common/RatingDisplay";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const liked = isInWishlist(product.id);
  const cartItem = items.find((i) => i.id === product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-500 hover:shadow-[var(--card-shadow-hover)] hover:border-primary/40"
    >
      {/* Image Container */}
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-[4/4.2] overflow-hidden bg-muted/20"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08),transparent_70%)]" />
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {discount > 0 && (
          <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent text-accent-foreground shadow-lg">
            {discount}% OFF
          </motion.span>
        )}
        {!discount && product.badge && (
          <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg">
            {product.badge}
          </motion.span>
        )}

        {/* Hover Action Buttons */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0">
          <QuickActionButtons
            liked={liked}
            onWishlist={() => toggleWishlist(product.id)}
            onView={() => {}}
            onAddCart={handleAdd}
            hideAddCart={!!cartItem}
          />
        </div>

        {/* Quick Add to Cart */}
        {!cartItem && (
          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0">
            <button
              onClick={(e) => { e.preventDefault(); handleAdd(); }}
              className="w-full py-3 bg-primary/95 backdrop-blur-sm text-primary-foreground flex items-center justify-center gap-2 text-sm font-semibold hover:bg-primary transition-colors"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <p className="text-[11px] text-primary font-bold uppercase tracking-[0.15em]">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-sm text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        <RatingDisplay rating={product.rating} reviewCount={product.reviews} size="sm" />
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          {cartItem && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1">
              <button
                onClick={() => cartItem.quantity <= 1 ? removeItem(product.id) : updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-foreground">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
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
