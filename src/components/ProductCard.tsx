import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WithTooltip } from "@/components/common/WithTooltip"

const MotionCard = motion.create(Card);

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
    <MotionCard
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden flex flex-col"
    >
      {/* Image Area */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted/40">
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
          <Badge variant="destructive" className="absolute top-3 right-3 z-20">
            {discount}% Off
          </Badge>
        )}
        {!discount && product.badge && (
          <Badge className="absolute top-3 right-3 z-20">
            {product.badge}
          </Badge>
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
            >
              <ButtonGroup orientation="vertical" aria-label="Quantity in cart">
              <WithTooltip content="Decrease quantity"><Button
                size="icon"
                aria-label="Decrease quantity"
                onClick={() =>
                  cartItem.quantity <= 1
                    ? removeItem(String(product.id))
                    : updateQuantity(String(product.id), cartItem.quantity - 1)
                }
              >
                <Minus className="h-3.5 w-3.5" />
              </Button></WithTooltip>
              <ButtonGroupText className="justify-center px-0 py-0.5 tabular-nums">
                {cartItem.quantity}
              </ButtonGroupText>
              <WithTooltip content="Increase quantity"><Button
                size="icon"
                aria-label="Increase quantity"
                onClick={() => updateQuantity(String(product.id), cartItem.quantity + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button></WithTooltip>
              </ButtonGroup>
            </motion.div>
          ) : (
            <WithTooltip content="Add to cart"><Button size="icon" asChild>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleAdd}
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </motion.button>
            </Button></WithTooltip>
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
                className={cn("h-2.5 w-2.5", s <= Math.round(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200")}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {product.rating.toFixed(1)}({product.reviews} reviews)
          </span>
        </div>

        {/* Prices */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="font-bold text-base text-foreground leading-none">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through leading-none">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock progress bar — only shown when sold data exists */}
        {sold > 0 && stockMax > 0 && (
          <div className="mt-1.5">
            <Progress value={stockPct} className="h-1.5" aria-label="Sold" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-muted-foreground font-medium">{sold} Sold</span>
              <span className="text-[10px] text-muted-foreground font-medium">{stock}/{stockMax}</span>
            </div>
          </div>
        )}
      </div>
    </MotionCard>
  );
}
