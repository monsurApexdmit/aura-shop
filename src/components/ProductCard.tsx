import { Star, Eye, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/data/products";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);

  const cartItem = items.find((i) => i.id === product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-lg border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/50 p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[11px] font-bold">
            {discount}% Off
          </span>
        )}
        {product.badge && !discount && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold">
            {product.badge}
          </span>
        )}

        {/* Quick View */}
        <button
          onClick={() => setShowQuickView(true)}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-foreground/80 text-background text-xs font-medium opacity-0 group-hover:opacity-100 transition-all hover:bg-foreground flex items-center gap-1.5"
        >
          <Eye className="h-3 w-3" /> Quick View
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{product.category}</p>
        <h3 className="font-display font-semibold text-sm text-card-foreground leading-snug mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">({product.rating})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Add to Cart */}
          {cartItem ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => cartItem.quantity <= 1 ? removeItem(product.id) : updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-7 text-center text-sm font-bold text-foreground">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
