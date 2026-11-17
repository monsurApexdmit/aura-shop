import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/common/WithTooltip";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const wishlistLabel = liked ? t("common:actions.removeFromWishlist") : t("common:actions.addToWishlist");
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Wishlist Button */}
      <WithTooltip content={wishlistLabel}>
      <Button
        variant={liked ? "default" : "outline"}
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onWishlist();
        }}
        aria-label={wishlistLabel}
      >
        <Heart className={cn("h-4 w-4", liked ? "fill-current" : "")} />
      </Button>
      </WithTooltip>

      {/* View Button */}
      <WithTooltip content={t("product:quickActions.viewDetails")}>
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          onView();
        }}
        aria-label={t("product:quickActions.viewDetails")}
      >
        <Eye className="h-4 w-4" />
      </Button>
      </WithTooltip>

      {/* Add to Cart Button (if not hidden) */}
      {!hideAddCart && (
        <WithTooltip content={t("common:actions.addToCart")}>
        <Button
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onAddCart();
          }}
          aria-label={t("common:actions.addToCart")}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
        </WithTooltip>
      )}
    </div>
  );
}
