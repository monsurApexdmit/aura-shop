import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { RAIL_ITEM } from "./helpers";

const ARROW =
  "flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SectionHeading({ id, title, subtitle, href, linkLabel = "See all", children }: {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="container mb-3 flex items-end justify-between gap-3 md:mb-4">
      <div className="min-w-0">
        <h2 id={id} className="font-display text-xl font-bold leading-tight text-foreground md:text-[1.7rem]">{title}</h2>
        {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {href && (
          <Link
            to={href}
            className="flex items-center gap-0.5 rounded-pill px-2 py-1 text-sm font-extrabold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {linkLabel}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-2" aria-hidden="true">
      <div className="aspect-square animate-pulse rounded-xl bg-secondary" />
      <div className="mt-2.5 h-3.5 w-11/12 animate-pulse rounded-pill bg-secondary" />
      <div className="mt-1.5 h-3.5 w-2/3 animate-pulse rounded-pill bg-secondary" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded-pill bg-secondary" />
    </div>
  );
}

interface RailProps {
  title: string;
  subtitle?: string;
  href: string;
  products: Product[];
  isLoading?: boolean;
  /** Offset for tile colours so neighbouring rails don't start on the same colour */
  tileOffset?: number;
}

/** A product rail: heading, "See all", and a horizontal snap row of cards (arrow buttons from md up). */
export default function Rail({ title, subtitle, href, products, isLoading, tileOffset = 0 }: RailProps) {
  const headingId = useId();
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, products.length, isLoading]);

  if (!isLoading && products.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-labelledby={headingId} className="py-4 md:py-6">
      <SectionHeading id={headingId} title={title} subtitle={subtitle} href={href}>
        <div className="hidden gap-1.5 md:flex">
          <button type="button" className={ARROW} onClick={() => scroll(-1)} disabled={edges.start} aria-label={`Scroll ${title} back`}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className={ARROW} onClick={() => scroll(1)} disabled={edges.end} aria-label={`Scroll ${title} forward`}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </SectionHeading>
      <ul
        ref={scroller}
        onScroll={measure}
        aria-busy={isLoading || undefined}
        className="container no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto pb-2 pt-0.5 md:scroll-px-6 md:gap-4 lg:scroll-px-8"
      >
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i} className={RAIL_ITEM}><CardSkeleton /></li>
            ))
          : products.map((p, i) => (
              <li key={p.id} className={RAIL_ITEM}>
                <ProductCard product={p} index={i + tileOffset} />
              </li>
            ))}
      </ul>
    </section>
  );
}
