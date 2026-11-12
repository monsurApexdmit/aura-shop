import { useEffect, useRef } from "react";
import { Heart, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { onProductImageError } from "../shared/useProductPage";

interface GalleryProps {
  images: string[];
  name: string;
  selected: number;
  onSelect: (i: number) => void;
  discount: number;
  liked: boolean;
  onToggleLike: () => void;
  onShare: () => void;
}

const ROUND = "flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Swipeable photos on a soft mint tile; dots on phones, thumbnails from md up. */
export default function Gallery({ images, name, selected, onSelect, discount, liked, onToggleLike, onShare }: GalleryProps) {
  const { t } = useTranslation();
  const scroller = useRef<HTMLUListElement>(null);
  // Set when a swipe changed the selection, so the strip isn't scrolled again mid-swipe
  const fromSwipe = useRef(false);
  const photos = images.filter(Boolean);
  const list = photos.length > 0 ? photos : ["/placeholder.svg"];

  // Thumbnails (or a variant change) move the strip; swiping updates the selection.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (fromSwipe.current) {
      fromSwipe.current = false;
      return;
    }
    const target = selected * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 2) el.scrollTo({ left: target, behavior: "smooth" });
  }, [selected]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== selected && i >= 0 && i < list.length) {
      fromSwipe.current = true;
      onSelect(i);
    }
  };

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-tile-2">
        <ul
          ref={scroller}
          onScroll={onScroll}
          aria-label={t("tpl_fresh:gallery.photos", { name })}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
        >
          {list.map((src, i) => (
            <li key={`${src}-${i}`} className="h-full w-full shrink-0 snap-center">
              <img
                src={src}
                alt={list.length > 1 ? t("tpl_fresh:gallery.photoOf", { name, n: i + 1, count: list.length }) : name}
                loading={i === 0 ? "eager" : "lazy"}
                onError={onProductImageError}
                className="h-full w-full object-contain p-6 mix-blend-multiply md:p-10"
                draggable={false}
              />
            </li>
          ))}
        </ul>

        {discount > 0 && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-lg bg-highlight px-2.5 py-1 font-display text-base font-bold text-highlight-foreground">
            -{discount}%
          </span>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button type="button" onClick={onToggleLike} aria-pressed={liked} aria-label={liked ? t("common:actions.removeFromWishlist") : t("common:actions.addToWishlist")} className={ROUND}>
            <Heart className={cn("h-5 w-5", liked && "fill-highlight text-highlight")} aria-hidden="true" />
          </button>
          <button type="button" onClick={onShare} aria-label={t("tpl_fresh:gallery.share")} className={ROUND}>
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {list.length > 1 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
            {list.map((_, i) => (
              <span key={i} className={cn("h-2 rounded-pill transition-all", i === selected ? "w-5 bg-ink" : "w-2 bg-ink/25")} />
            ))}
          </div>
        )}
      </div>

      {list.length > 1 && (
        <ul className="no-scrollbar mt-3 hidden gap-2 overflow-x-auto p-0.5 md:flex" aria-label={t("tpl_fresh:gallery.choosePhoto")}>
          {list.map((src, i) => (
            <li key={`${src}-t-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={t("tpl_fresh:gallery.showPhoto", { n: i + 1 })}
                aria-current={i === selected}
                className={cn(
                  "size-20 overflow-hidden rounded-xl border-2 bg-tile-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  i === selected ? "border-primary" : "border-transparent hover:border-border",
                )}
              >
                <img src={src} alt="" onError={onProductImageError} className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
