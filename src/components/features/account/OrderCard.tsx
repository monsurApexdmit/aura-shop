import { ReactNode } from "react";
import { Package, ChevronRight, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface Order {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  shippingMethod?: string;
  paymentMethod?: string;
}

interface OrderCardProps {
  /**
   * Order data
   */
  order: Order;

  /**
   * Called when view/details button is clicked
   */
  onView?: (orderId: string) => void;

  /**
   * Called when track button is clicked
   */
  onTrack?: (orderId: string) => void;

  /**
   * Called when reorder button is clicked
   */
  onReorder?: (orderId: string) => void;

  /**
   * Custom actions to render
   */
  actions?: ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;
}

const statusConfig = {
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  },
};

/**
 * OrderCard Component
 *
 * Displays order information in a card format.
 * Used in AccountOrders and order history lists.
 *
 * @example
 * ```tsx
 * <OrderCard
 *   order={order}
 *   onView={() => navigate(`/orders/${order.id}`)}
 *   onTrack={() => navigate(`/track/${order.id}`)}
 * />
 * ```
 */
export default function OrderCard({
  order,
  onView,
  onTrack,
  onReorder,
  actions,
  className = "",
}: OrderCardProps) {
  const statusInfo = statusConfig[order.status];
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const timeAgo = formatDistanceToNow(new Date(order.date), { addSuffix: true });
  const { formatCurrency } = useCurrency();

  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary/40 transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground text-sm">{order.id}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Items Summary */}
      <div className="mb-4 pb-4 border-b border-border/50">
        <p className="text-xs text-muted-foreground mb-3">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {order.items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 rounded bg-muted/30"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-8 h-8 object-contain rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="flex items-center justify-center p-2 rounded bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">
                +{order.items.length - 3} more
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Total */}
      <div className="mb-4 pb-4 border-b border-border/50 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Order Total</span>
        <span className="font-bold text-lg text-foreground">
          {formatCurrency(order.total)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {onView && (
          <button
            onClick={() => onView(order.id)}
            className="flex-1 sm:flex-none flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm font-medium text-foreground"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {onTrack && order.status !== "cancelled" && (
          <button
            onClick={() => onTrack(order.id)}
            className="flex-1 sm:flex-none flex items-center gap-1 px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm font-medium text-foreground"
          >
            Track Order
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {onReorder && order.status === "delivered" && (
          <button
            onClick={() => onReorder(order.id)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg gradient-primary text-primary-foreground transition-opacity text-sm font-medium hover:opacity-90"
          >
            Reorder
          </button>
        )}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
    </div>
  );
}
