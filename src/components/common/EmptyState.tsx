import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /**
   * Icon component to display (from lucide-react)
   */
  icon: LucideIcon;

  /**
   * Title text displayed prominently
   */
  title: string;

  /**
   * Description text below the title
   */
  description: string;

  /**
   * Optional action button or element
   */
  action?: ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * EmptyState Component
 *
 * Displays a consistent empty state UI when there's no data to show.
 * Used across cart, wishlist, orders, addresses, and other list pages.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={ShoppingCart}
 *   title="Your cart is empty"
 *   description="Add products to get started"
 *   action={<Button>Continue Shopping</Button>}
 * />
 * ```
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <div className="mb-4 p-4 rounded-full bg-muted/50">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
        {description}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
