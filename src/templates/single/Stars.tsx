import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Five stars filled to the rating (halves round to the nearest). */
export default function Stars({ rating, className, starClassName }: { rating: number; className?: string; starClassName?: string }) {
  const filled = Math.round(Math.max(0, Math.min(5, rating)));
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn("size-4", i < filled ? "fill-current text-highlight" : "text-muted-foreground/40", starClassName)}
        />
      ))}
    </span>
  );
}
