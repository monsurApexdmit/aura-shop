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
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onWishlist();
        }}
        className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-md ${
          liked
            ? "bg-accent text-accent-foreground"
            : "bg-card/80 text-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
        title={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      </button>

      {/* View Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onView();
        }}
        className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-md text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md"
        title="View product details"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* Add to Cart Button (if not hidden) */}
      {!hideAddCart && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddCart();
          }}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all duration-300 shadow-md"
          title="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
