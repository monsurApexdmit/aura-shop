import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { FOCUS } from "./lib";

/** Section title with a small leading icon and a green "View all →" link. */
export function SectionHeading({ id, title, icon, href, linkLabel, extra, className }: {
  id: string;
  title: string;
  icon?: ReactNode;
  href?: string;
  linkLabel?: string;
  /** Shown before the link (e.g. a countdown pill) */
  extra?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 id={id} className="flex min-w-0 items-center gap-2 font-display text-xl font-bold leading-tight text-foreground md:text-[1.375rem]">
        {icon && <span className="flex shrink-0 items-center" aria-hidden="true">{icon}</span>}
        <span className="truncate">{title}</span>
      </h2>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {extra}
        {href && (
          <Link to={href} className={cn("flex items-center gap-1 rounded-sm text-[13px] font-semibold text-primary hover:underline", FOCUS)}>
            {linkLabel ?? t("common:actions.viewAll")}
            <span className="sr-only"> {title}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-2.5" aria-hidden="true">
      <div className="aspect-square animate-pulse rounded-lg bg-secondary" />
      <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-secondary" />
      <div className="mt-2 h-3.5 w-11/12 animate-pulse rounded bg-secondary" />
      <div className="mt-1.5 h-3.5 w-2/3 animate-pulse rounded bg-secondary" />
      <div className="mt-4 flex justify-between">
        <div className="h-5 w-1/3 animate-pulse rounded bg-secondary" />
        <div className="h-8 w-14 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}

const ITEM = "w-[46%] shrink-0 snap-start sm:w-[31%] md:w-auto";

/**
 * Product row: swipeable on phones, a grid of 3 (tablet) / 6 (desktop) from md up.
 * Renders nothing when loaded and empty.
 */
export function ProductRow({ products, isLoading, label, tileOffset = 0, skeletons = 6 }: {
  products: Product[];
  isLoading?: boolean;
  /** Accessible name for the list */
  label: string;
  tileOffset?: number;
  skeletons?: number;
}) {
  if (!isLoading && products.length === 0) return null;
  return (
    <ul
      aria-label={label}
      aria-busy={isLoading || undefined}
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-6"
    >
      {isLoading
        ? Array.from({ length: skeletons }, (_, i) => <li key={i} className={ITEM}><CardSkeleton /></li>)
        : products.map((p, i) => (
            <li key={p.id} className={ITEM}>
              <ProductCard product={p} index={i + tileOffset} />
            </li>
          ))}
    </ul>
  );
}
