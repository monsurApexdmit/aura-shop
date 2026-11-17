import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiCategory } from "@/services/categoryApi";
import { FOCUS, categoryImage, tile } from "./lib";

/** Category photo, or its first letter on a tile colour when there is none (or it fails). */
export function CategoryThumb({ category, index, className, letterClassName }: { category: Pick<ApiCategory, "name" | "image">; index: number; className?: string; letterClassName?: string }) {
  const [failed, setFailed] = useState(false);
  const src = categoryImage(category);
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden", !src || failed ? tile(index) : "bg-secondary", className)} aria-hidden="true">
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <span className={cn("font-display font-bold uppercase text-ink/60", letterClassName)}>{category.name.charAt(0)}</span>
      )}
    </span>
  );
}

/** Count bubble on header and tab-bar icons. */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span className={cn("absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-card", className)}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Five amber stars (decorative; pair with a text rating). */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-px" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("h-3 w-3", i < filled ? "fill-amber-400 text-amber-400" : "fill-border text-border", className)} />
      ))}
    </span>
  );
}

/** "View all →" link beside a section title. */
export function ViewAll({ to, label, className }: { to: string; label?: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <Link to={to} className={cn("inline-flex shrink-0 items-center gap-1 rounded-sm text-[13px] font-semibold text-primary hover:underline", FOCUS, className)}>
      {label ?? t("common:actions.viewAll")} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

/** Section heading row: bold title, optional middle slot (tabs), "View all" on the right. */
export function SectionHeader({ id, title, to, linkLabel, children, className }: { id: string; title: string; to?: string; linkLabel?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-5", className)}>
      <div className="flex min-w-0 flex-wrap items-end gap-x-6 gap-y-2">
        <h2 id={id} className="min-w-0 font-display text-lg font-bold tracking-tight text-foreground sm:text-[22px]">{title}</h2>
        {children}
      </div>
      {to && <ViewAll to={to} label={linkLabel} />}
    </div>
  );
}

/** Placeholder product cards while a list loads. */
export function CardSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-2.5" aria-hidden="true">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-2 pt-3">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-2/5" />
          </div>
        </div>
      ))}
    </>
  );
}

/** 2 → 3 → 4 → 5 columns. */
export const PRODUCT_GRID = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
