import { cn } from "@/lib/utils"
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/api";
import { pastel } from "@/lib/pastels";
import type { ApiCollection } from "@/services/collectionApi";

export const productCountLabel = (n: number) => `${n} product${n === 1 ? "" : "s"}`;

interface CollectionCardProps {
  collection: Pick<ApiCollection, "name" | "slug" | "imageUrl" | "productCount" | "description">;
  index?: number;
  className?: string;
}

// Banner tile (pastel ground when there is no image) with the name and product count underneath.
export default function CollectionCard({ collection, index = 0, className }: CollectionCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = collection.imageUrl && !imageFailed ? getImageUrl(collection.imageUrl) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      viewport={{ once: true }}
      className={className}
    >
      <Link to={`/collections/${collection.slug}`} className="group block">
        <div className={cn("relative aspect-[4/3] overflow-hidden rounded-3xl", pastel(index))}>
          {image ? (
            <img
              src={image}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center font-display text-7xl font-extrabold text-neutral-950/20 transition-transform duration-500 group-hover:scale-105"
            >
              {collection.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold text-foreground md:text-xl">{collection.name}</h3>
            <p className="text-sm text-muted-foreground">{productCountLabel(collection.productCount)}</p>
          </div>
          <ArrowRight aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 text-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] rounded-3xl" />
      <Skeleton className="mt-3 h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}
