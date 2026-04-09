import { Star } from "lucide-react";

interface RatingDisplayProps {
  /**
   * The rating value (0-5)
   */
  rating: number;

  /**
   * Number of reviews
   */
  reviewCount: number;

  /**
   * Display size variant
   */
  size?: "sm" | "md" | "lg";

  /**
   * Show review count text
   */
  showCount?: boolean;

  /**
   * Show percentage if provided
   */
  percentage?: number;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * RatingDisplay Component
 *
 * Displays star rating with review count. Reusable across ProductCard,
 * ProductDetail, OrderCard, and other product/order displays.
 *
 * @example
 * ```tsx
 * <RatingDisplay rating={4.5} reviewCount={120} size="md" />
 * <RatingDisplay rating={5} reviewCount={50} percentage={98} size="lg" />
 * ```
 */
export default function RatingDisplay({
  rating,
  reviewCount,
  size = "md",
  showCount = true,
  percentage,
  className = "",
}: RatingDisplayProps) {
  const starSize = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  const ratingFloor = Math.floor(rating);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSize} transition-colors ${
              i < ratingFloor
                ? "fill-accent text-accent"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Rating Text and Count */}
      {showCount && (
        <div className={`flex items-center gap-1 ${textSize}`}>
          <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({reviewCount})</span>
          {percentage && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
              {percentage}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
