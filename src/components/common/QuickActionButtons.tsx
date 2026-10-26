import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/common/WithTooltip";
import { Heart, Eye, ShoppingCart } from "lucide-react";

interface QuickActionButtonsProps {
  /**
   * Whether the item is in wishlist
   */
  liked: boolean;

  /**
   * Called when wishlist button is clicked
   */
  onWishlist: () => void;

  /**
   * Called when view button is clicked
   */
  onView: () => void;

  /**
   * Called when add to cart button is clicked
   */
  onAddCart: () => void;

  /**
   * Hide add to cart button (e.g., if already in cart)
   */
  hideAddCart?: boolean;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * QuickActionButtons Component
 *
 * Displays quick action buttons for products (wishlist, view, add to cart).
 * Typically used in ProductCard hover state.
 *
 * @example
 * ```tsx
 * <QuickActionButtons
 *   liked={isInWishlist}
 *   onWishlist={toggleWishlist}
 *   onView={goToProductPage}
 *   onAddCart={addToCart}
 * />
 * ```
 */
export default function QuickActionButtons({
  liked,
  onWishlist,
  onView,
  onAddCart,
  hideAddCart = false,
  className = "",
}: QuickActionButtonsProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Wishlist Button */}
      <WithTooltip content={liked ? "Remove from wishlist" : "Add to wishlist"}>
      <Button
        variant={liked ? "default" : "outline"}
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onWishlist();
        }}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={cn("h-4 w-4", liked ? "fill-current" : "")} />
      </Button>
      </WithTooltip>

      {/* View Button */}
      <WithTooltip content="View product details">
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onView();
        }}
        aria-label="View product details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      </WithTooltip>

      {/* Add to Cart Button (if not hidden) */}
      {!hideAddCart && (
        <WithTooltip content="Add to cart">
        <Button
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onAddCart();
          }}
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
        </WithTooltip>
      )}
    </div>
  );
}
