import { ReactNode } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import RatingDisplay from "@/components/common/RatingDisplay";

export interface Review {
  id: string;
  author: {
    name: string;
    image?: string;
  };
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  verified?: boolean;
}

interface ReviewCardProps {
  /**
   * Review data
   */
  review: Review;

  /**
   * Called when helpful button is clicked
   */
  onHelpful?: (reviewId: string) => void;

  /**
   * Called when not helpful button is clicked
   */
  onNotHelpful?: (reviewId: string) => void;

  /**
   * Custom actions to render
   */
  actions?: ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * ReviewCard Component
 *
 * Displays a product review with author, rating, comment, and helpful votes.
 * Used in ProductDetail and review sections.
 *
 * @example
 * ```tsx
 * <ReviewCard
 *   review={review}
 *   onHelpful={() => handleHelpful(review.id)}
 *   onNotHelpful={() => handleNotHelpful(review.id)}
 * />
 * ```
 */
export default function ReviewCard({
  review,
  onHelpful,
  onNotHelpful,
  actions,
  className = "",
}: ReviewCardProps) {
  // Format date - relative or absolute
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const daysAgo = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysAgo === 0) return "Today";
      if (daysAgo === 1) return "Yesterday";
      if (daysAgo < 7) return `${daysAgo} days ago`;
      if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
      if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`;
      return `${Math.floor(daysAgo / 365)} years ago`;
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`border border-border rounded-lg p-4 sm:p-6 space-y-4 ${className}`}
    >
      {/* Header: Author Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            {review.author.image && (
              <AvatarImage src={review.author.image} alt={review.author.name} />
            )}
            <AvatarFallback>
              {review.author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm text-foreground">
                {review.author.name}
              </p>
              {review.verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-medium">
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(review.date)}
            </p>
          </div>
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {/* Rating */}
      <RatingDisplay rating={review.rating} reviewCount={0} size="md" showCount={false} />

      {/* Comment */}
      <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>

      {/* Helpful Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">Helpful?</span>

        {onHelpful && (
          <button
            onClick={() => onHelpful(review.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-green-400/50 hover:bg-green-100/30 dark:hover:bg-green-900/20 transition-colors text-xs font-medium text-muted-foreground hover:text-green-700 dark:hover:text-green-400"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>Yes</span>
            {review.helpful > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({review.helpful})
              </span>
            )}
          </button>
        )}

        {onNotHelpful && (
          <button
            onClick={() => onNotHelpful(review.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-red-400/50 hover:bg-red-100/30 dark:hover:bg-red-900/20 transition-colors text-xs font-medium text-muted-foreground hover:text-red-700 dark:hover:text-red-400"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>No</span>
            {review.notHelpful > 0 && (
              <span className="text-[10px] text-muted-foreground">
                ({review.notHelpful})
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
