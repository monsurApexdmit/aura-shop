import { Plus, Minus, ShoppingCart, Star } from "lucide-react";
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

  const stock = product.stock ?? 0;
  const sold = product.totalSold ?? 0;
  const stockMax = stock + sold;
  const stockPct = stockMax > 0 ? Math.min(Math.round((sold / stockMax) * 100), 100) : 0;

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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col"
    >
      {/* Image Area */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-400 ease-out"
          loading="lazy"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            if (!t.src.includes("placeholder.svg")) t.src = "/placeholder.svg";
          }}
        />

        {/* Discount badge — top right */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-400 text-white shadow">
            {discount}% Off
          </span>
        )}
        {!discount && product.badge && (
          <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary text-primary-foreground shadow">
            {product.badge}
          </span>
        )}

        {/* Cart controls — bottom right, vertical pill */}
        <div
          className="absolute bottom-3 right-3 z-20"
          onClick={(e) => e.preventDefault()}
        >
          {cartItem ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center bg-primary rounded-full shadow-lg py-1 px-1 gap-0.5"
            >
              <button
                onClick={() =>
                  cartItem.quantity <= 1
                    ? removeItem(String(product.id))
                    : updateQuantity(String(product.id), cartItem.quantity - 1)
                }
                className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-bold text-white min-w-[1.25rem] text-center leading-none py-0.5">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(String(product.id), cartItem.quantity + 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleAdd}
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/80 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3.5 gap-1.5">
        {/* Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-sm leading-snug text-primary line-clamp-2 group-hover:text-primary/80 transition-colors duration-200 min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-2.5 w-2.5 ${
                  s <= Math.round(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">
            {product.rating.toFixed(1)}({product.reviews} reviews)
          </span>
        </div>

        {/* Prices */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="font-bold text-base text-gray-900 leading-none">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through leading-none">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock progress bar — only shown when sold data exists */}
        {sold > 0 && stockMax > 0 && (
          <div className="mt-1.5">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${stockPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400 font-medium">{sold} Sold</span>
              <span className="text-[10px] text-gray-400 font-medium">{stock}/{stockMax}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
