import { Star, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/data/products";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            {product.badge}
          </span>
        )}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
        </button>
        <button
          onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-display font-semibold text-sm text-card-foreground leading-tight mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">{product.rating}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-foreground">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
