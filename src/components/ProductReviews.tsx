import { useState } from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

const MOCK_REVIEWS: Review[] = [
  { id: "r1", author: "Sarah M.", rating: 5, date: "2026-02-15", comment: "Absolutely love this product! The quality exceeded my expectations. Fast shipping too.", helpful: 24 },
  { id: "r2", author: "James K.", rating: 4, date: "2026-02-10", comment: "Great value for the price. Would recommend to anyone looking for quality at a reasonable price.", helpful: 12 },
  { id: "r3", author: "Emily R.", rating: 5, date: "2026-01-28", comment: "This is my second purchase and I'm just as happy as the first time. Excellent craftsmanship!", helpful: 18 },
  { id: "r4", author: "Michael T.", rating: 3, date: "2026-01-20", comment: "Decent product overall. Delivery was a bit slow but the product itself is good quality.", helpful: 5 },
];

interface ProductReviewsProps {
  productRating: number;
  reviewCount: number;
}

export default function ProductReviews({ productRating, reviewCount }: ProductReviewsProps) {
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  const ratingDistribution = [
    { stars: 5, percent: 68 },
    { stars: 4, percent: 20 },
    { stars: 3, percent: 8 },
    { stars: 2, percent: 3 },
    { stars: 1, percent: 1 },
  ];

  const toggleHelpful = (id: string) => {
    setHelpfulClicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="text-center sm:text-left">
          <div className="text-5xl font-display font-bold text-foreground">{productRating}</div>
          <div className="flex items-center gap-0.5 justify-center sm:justify-start mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(productRating) ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Based on {reviewCount} reviews</p>
        </div>
        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ stars, percent }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-8">{stars}★</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${percent}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 * (5 - stars) }} className="h-full rounded-full gradient-accent" />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">{percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {MOCK_REVIEWS.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl border border-border bg-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.author}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(review.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{review.comment}</p>
            <button
              onClick={() => toggleHelpful(review.id)}
              className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${helpfulClicked.has(review.id) ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Helpful ({review.helpful + (helpfulClicked.has(review.id) ? 1 : 0)})
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
