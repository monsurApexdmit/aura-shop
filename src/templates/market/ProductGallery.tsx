import { useEffect, useRef } from "react";
import { Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { onProductImageError } from "@/templates/shared/useProductPage";
import { FOCUS } from "./lib";

interface GalleryProps {
  images: string[];
  name: string;
  selected: number;
  onSelect: (i: number) => void;
  discount: number;
  liked: boolean;
  onLike: () => void;
  onShare: () => void;
}

/** Phones: edge-to-edge swipe gallery with an "n / total" counter. Desktop: vertical thumbs beside the main photo. */
export default function ProductGallery({ images, name, selected, onSelect, discount, liked, onLike, onShare }: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  // Keep the phone track in step when a variant or thumbnail changes the selected photo
  useEffect(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const target = selected * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 4) el.scrollTo({ left: target, behavior: "smooth" });
  }, [selected]);

  const onScroll = (el: HTMLDivElement) => {
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== selected) onSelect(i);
  };

  const actions = (
    <div className="absolute right-3 top-3 flex flex-col gap-2">
      <button type="button" onClick={onLike} aria-pressed={liked} aria-label={liked ? "Remove from wishlist" : "Save to wishlist"} className={cn("flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm hover:text-highlight", FOCUS)}>
        <Heart className={cn("h-[18px] w-[18px]", liked && "fill-highlight text-highlight")} aria-hidden="true" />
      </button>
      <button type="button" onClick={onShare} aria-label="Share" className={cn("flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm hover:text-highlight md:hidden", FOCUS)}>
        <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <div>
      {/* Phone */}
      <div className="relative -mx-4 bg-card md:hidden">
        <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" onScroll={(e) => onScroll(e.currentTarget)} aria-label="Product photos">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={i === 0 ? name : `${name}, photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              onError={onProductImageError}
              className="aspect-square w-full shrink-0 snap-center bg-secondary object-contain"
            />
          ))}
        </div>
        {discount > 0 && (
          <span className="absolute left-0 top-3 rounded-r-md bg-highlight px-2 py-1 text-xs font-bold text-highlight-foreground">-{discount}%</span>
        )}
        {actions}
        {total > 1 && (
          <span className="absolute bottom-3 right-3 rounded-pill bg-black/55 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-white" aria-live="polite">
            {selected + 1} / {total}
          </span>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-3 md:flex">
        {total > 1 && (
          <ul className="no-scrollbar flex max-h-[520px] w-16 shrink-0 flex-col gap-2 overflow-y-auto lg:w-[72px]" aria-label="Choose photo">
            {images.map((src, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  onMouseEnter={() => onSelect(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === selected}
                  className={cn("block aspect-square w-full overflow-hidden rounded-md border-2 bg-secondary", i === selected ? "border-highlight" : "border-transparent hover:border-border", FOCUS)}
                >
                  <img src={src} alt="" loading="lazy" onError={onProductImageError} className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-secondary">
          <img src={images[selected] ?? images[0]} alt={name} onError={onProductImageError} className="aspect-square w-full object-contain" />
          {discount > 0 && (
            <span className="absolute left-0 top-4 rounded-r-md bg-highlight px-2.5 py-1 text-sm font-bold text-highlight-foreground">-{discount}%</span>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
