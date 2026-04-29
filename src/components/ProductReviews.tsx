import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageSquareText, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReviewCard, { Review } from "@/components/features/product/ReviewCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProductReviews, useSubmitProductReview } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProductReviewsProps {
  productSlug: string;
  productRating: number;
  reviewCount: number;
}

export default function ProductReviews({ productSlug, productRating, reviewCount }: ProductReviewsProps) {
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState("");
  const { user, isLoggedIn } = useAuth();

  const reviewQuery = useProductReviews(productSlug || null);
  const submitReview = useSubmitProductReview(productSlug || null);

  const reviews = useMemo<Review[]>(() => {
    return (reviewQuery.data?.reviews ?? []).map((review) => ({
      id: String(review.id),
      author: { name: review.customer_name },
      rating: review.rating,
      date: review.created_at,
      comment: review.comment,
      helpful: helpfulClicked.has(String(review.id)) ? 1 : 0,
      notHelpful: 0,
      verified: review.verified_purchase,
      reply: review.reply ? {
        body: review.reply.body,
        authorName: review.reply.author_name,
        repliedAt: review.reply.replied_at,
      } : null,
    }));
  }, [helpfulClicked, reviewQuery.data]);

  const currentUserReview = useMemo(() => {
    if (!user) return null;
    return reviewQuery.data?.reviews?.find((review) => review.customer_id === user.id) ?? null;
  }, [reviewQuery.data, user]);

  useEffect(() => {
    if (currentUserReview) {
      setSelectedRating(currentUserReview.rating);
      setComment(currentUserReview.comment);
    }
  }, [currentUserReview]);

  const summary = reviewQuery.data?.summary;
  const ratingDistribution = summary?.distribution ?? [
    { stars: 5, count: 0, percent: 0 },
    { stars: 4, count: 0, percent: 0 },
    { stars: 3, count: 0, percent: 0 },
    { stars: 2, count: 0, percent: 0 },
    { stars: 1, count: 0, percent: 0 },
  ];
  const displayRating = summary?.average_rating ?? productRating;
  const displayReviewCount = summary?.review_count ?? reviewCount;

  const toggleHelpful = (id: string) => {
    setHelpfulClicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to write a review.");
      return;
    }

    if (comment.trim().length < 5) {
      toast.error("Please write at least 5 characters.");
      return;
    }

    try {
      await submitReview.mutateAsync({
        rating: selectedRating,
        comment: comment.trim(),
      });
      toast.success(currentUserReview ? "Review updated." : "Review submitted.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save review.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="text-center sm:text-left">
          <div className="text-5xl font-display font-bold text-foreground">{displayRating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 justify-center sm:justify-start mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(displayRating) ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Based on {displayReviewCount} reviews</p>
        </div>
        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ stars, percent, count }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-8">{stars}★</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 * (5 - stars) }}
                  className="h-full rounded-full gradient-accent"
                />
              </div>
              <span className="text-sm text-muted-foreground w-20 text-right">{count} ({percent}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{currentUserReview ? "Update your review" : "Write a review"}</h3>
          <p className="text-sm text-muted-foreground">
            {isLoggedIn ? "Share your experience with this product." : "Sign in to submit a review for this product."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedRating(value)}
                className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                disabled={!isLoggedIn || submitReview.isPending}
              >
                <Star className={`h-6 w-6 ${value <= selectedRating ? "fill-accent text-accent" : "text-border"}`} />
              </button>
            );
          })}
        </div>

        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell other shoppers what you liked or didn’t like."
          className="min-h-28"
          disabled={!isLoggedIn || submitReview.isPending}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {!isLoggedIn ? (
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Sign in to write a review
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Your review appears immediately on this product.</span>
          )}

          <Button onClick={handleSubmit} disabled={!isLoggedIn || submitReview.isPending}>
            {submitReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentUserReview ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {reviewQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
            <MessageSquareText className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share your experience with this product.</p>
            </div>
          </div>
        ) : reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <ReviewCard
              review={review}
              onHelpful={() => toggleHelpful(review.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
