import { ReactNode } from "react";

type GridColumns = 1 | 2 | 3 | 4;
type GapSize = "sm" | "md" | "lg" | "xl";

interface GridLayoutProps {
  /**
   * Number of columns (responsive, this is desktop count)
   */
  columns?: GridColumns;

  /**
   * Gap between items
   */
  gap?: GapSize;

  /**
   * Gap on mobile (defaults to smaller than desktop)
   */
  mobileGap?: GapSize;

  /**
   * Column count on tablet (default: columns - 1)
   */
  mdColumns?: GridColumns;

  /**
   * Column count on mobile (default: 1)
   */
  smColumns?: GridColumns;

  /**
   * Grid items
   */
  children: ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;
}

const gapClasses: Record<GapSize, string> = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const mdGapClasses: Record<GapSize, string> = {
  sm: "md:gap-3",
  md: "md:gap-4",
  lg: "md:gap-6",
  xl: "md:gap-8",
};

const colClasses: Record<GridColumns, Record<"sm" | "md" | "lg", string>> = {
  1: { sm: "grid-cols-1", md: "md:grid-cols-1", lg: "lg:grid-cols-1" },
  2: { sm: "grid-cols-1", md: "md:grid-cols-2", lg: "lg:grid-cols-2" },
  3: { sm: "grid-cols-1", md: "md:grid-cols-2", lg: "lg:grid-cols-3" },
  4: { sm: "grid-cols-1", md: "md:grid-cols-2", lg: "lg:grid-cols-4" },
};

/**
 * GridLayout Component
 *
 * Provides a responsive grid system for displaying items.
 * Used in Shop, Index, Deals, and Account pages.
 *
 * @example
 * ```tsx
 * <GridLayout columns={4} gap="md">
 *   {products.map(p => <ProductCard key={p.id} product={p} />)}
 * </GridLayout>
 *
 * <GridLayout columns={3} mdColumns={2} smColumns={1}>
 *   {items.map(item => <ItemCard key={item.id} item={item} />)}
 * </GridLayout>
 * ```
 */
export default function GridLayout({
  columns = 4,
  gap = "md",
  mobileGap,
  mdColumns,
  smColumns = 1,
  children,
  className = "",
}: GridLayoutProps) {
  const gapClass = mobileGap
    ? `${gapClasses[mobileGap]} ${mdGapClasses[gap]}`
    : gapClasses[gap];
  const actualMdColumns = mdColumns || (columns > 1 ? (columns - 1) as GridColumns : 1);

  // Build responsive column classes
  const colClass = `grid ${colClasses[smColumns].sm} ${colClasses[actualMdColumns].md} ${colClasses[columns].lg}`;

  return (
    <div className={`${colClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}
