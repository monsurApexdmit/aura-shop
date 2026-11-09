import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <span className={cn("absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground ring-2 ring-card", className)}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Section title row: bold title with a raspberry tick, optional extras and a "see all" link. */
export function SectionHeading({ id, title, icon, extra, to, linkLabel = "See all" }: { id?: string; title: ReactNode; icon?: ReactNode; extra?: ReactNode; to?: string; linkLabel?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 border-b border-border px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      {icon}
      <h2 id={id} className="min-w-0 truncate font-display text-base font-bold text-foreground sm:text-lg">{title}</h2>
      {extra}
      {to && (
        <Link to={to} className={cn("ml-auto inline-flex shrink-0 items-center gap-0.5 rounded-sm text-xs font-semibold text-highlight hover:underline sm:text-sm", FOCUS)}>
          {linkLabel} <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** White panel every home section sits in. */
export function Panel({ children, className, labelledBy }: { children: ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cn("overflow-hidden rounded-lg border border-border bg-card card-shadow", className)}>
      {children}
    </section>
  );
}
