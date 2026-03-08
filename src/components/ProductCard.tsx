import { Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/data/products";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();

  const cartItem = items.find((i) => i.id === product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted/30 p-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />

        {/* Badge */}
        {(discount > 0 || product.badge) && (
          <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
            discount > 0 
              ? "gradient-accent text-accent-foreground" 
              : "gradient-primary text-primary-foreground"
          }`}>
            {discount > 0 ? `${discount}% Off` : product.badge}
          </span>
        )}

        {/* Quick Add Overlay */}
        {!cartItem && (
          <button
            onClick={(e) => { e.preventDefault(); handleAdd(); }}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-3.5 pt-2">
        <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-sm text-card-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Price + Cart Controls */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-display font-bold text-base text-foreground">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-1.5">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {cartItem && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => cartItem.quantity <= 1 ? removeItem(product.id) : updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-foreground">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}