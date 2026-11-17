import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { onProductImageError } from "@/templates/shared/useProductPage";
import { FOCUS, tone } from "./lib";

interface GalleryProps {
  images: string[];
  name: string;
  selected: number;
  onSelect: (i: number) => void;
  discount: number;
  badge?: string;
  liked: boolean;
  onLike: () => void;
  onShare: () => void;
}

const ROUND = cn("flex size-10 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-colors hover:text-highlight", FOCUS);

/** Big photo on a pastel tile (swipe or arrows to browse) with round thumbnails underneath. */
export default function ProductGallery({ images, name, selected, onSelect, discount, badge, liked, onLike, onShare }: GalleryProps) {
  const { t } = useTranslation();
  const touchX = useRef<number | null>(null);
  const total = images.length;
  const go = (i: number) => onSelect(((i % total) + total) % total);
  const current = images[selected] ?? images[0];

  return (
    <div className="min-w-0">
      <div
        className={cn("relative overflow-hidden rounded-[1.75rem]", tone(0).bg)}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start == null || total < 2) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 40) go(selected + (dx < 0 ? 1 : -1));
        }}
      >
        <img
          src={current}
          alt={total > 1 ? t("tpl_single:gallery.photoOf", { name, index: selected + 1, total }) : name}
          onError={onProductImageError}
          className="aspect-square w-full object-contain mix-blend-multiply dark:mix-blend-normal"
        />

        <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
          {discount > 0 && <span className="rounded-pill bg-highlight px-3 py-1 text-sm font-extrabold text-highlight-foreground">-{discount}%</span>}
          {badge && <span className="max-w-[60vw] truncate rounded-pill bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground">{badge}</span>}
        </div>

        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button type="button" onClick={onLike} aria-pressed={liked} aria-label={liked ? t("common:actions.removeFromWishlist") : t("common:actions.addToWishlist")} className={ROUND}>
            <Heart className={cn("h-[18px] w-[18px]", liked && "fill-highlight text-highlight")} aria-hidden="true" />
          </button>
          <button type="button" onClick={onShare} aria-label={t("common:actions.share")} className={ROUND}>
            <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>

        {total > 1 && (
          <>
            <button type="button" onClick={() => go(selected - 1)} aria-label={t("tpl_single:gallery.previous")} className={cn(ROUND, "absolute left-3 top-1/2 hidden -translate-y-1/2 sm:flex")}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(selected + 1)} aria-label={t("tpl_single:gallery.next")} className={cn(ROUND, "absolute right-3 top-1/2 hidden -translate-y-1/2 sm:flex")}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-pill bg-card/90 px-3 py-0.5 text-xs font-bold tabular-nums text-foreground sm:hidden" aria-hidden="true">
              {selected + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto p-1" aria-label={t("tpl_single:gallery.choosePhoto")}>
          {images.map((src, i) => (
            <li key={i} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={t("tpl_single:gallery.showPhoto", { index: i + 1 })}
                aria-current={i === selected}
                className={cn("block size-16 overflow-hidden rounded-2xl border-2 sm:size-[72px]", tone(i + 1).bg, i === selected ? "border-primary" : "border-transparent hover:border-border", FOCUS)}
              >
                <img src={src} alt="" loading="lazy" onError={onProductImageError} className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
