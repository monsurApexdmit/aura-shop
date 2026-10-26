import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Package, ChevronRight, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { StatusBadge } from "@/components/common/StatusBadge";

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
  },
  shipped: {
    label: "Shipped",
  },
  delivered: {
    label: "Delivered",
  },
  cancelled: {
    label: "Cancelled",
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
    <Card className={cn("p-4 sm:p-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground text-sm">{order.id}</span>
          </div>
          <StatusBadge status={order.status} label={statusInfo.label} />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Items Summary */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {order.items.slice(0, 3).map((item) => (
            <Item key={item.id} variant="muted" size="sm" className="flex-nowrap gap-2 p-2">
              {item.image && (
                <ItemMedia className="size-8 overflow-hidden rounded-sm">
                  <img src={item.image} alt={item.name} className="size-full object-contain" />
                </ItemMedia>
              )}
              <ItemContent className="min-w-0 gap-0">
                <ItemTitle className="text-xs truncate">{item.name}</ItemTitle>
                <ItemDescription className="text-xs">x{item.quantity}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
          {order.items.length > 3 && (
            <Item variant="muted" size="sm" className="justify-center p-2">
              <p className="text-xs font-medium text-muted-foreground">
                +{order.items.length - 3} more
              </p>
            </Item>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Order Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Order Total</span>
        <span className="font-bold text-lg text-foreground">
          {formatCurrency(order.total)}
        </span>
      </div>

      <Separator className="my-4" />

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {onView && (
          <Button
            variant="outline"
            onClick={() => onView(order.id)}
            className="flex-1 sm:flex-none gap-1"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {onTrack && order.status !== "cancelled" && (
          <Button
            variant="outline"
            onClick={() => onTrack(order.id)}
            className="flex-1 sm:flex-none gap-1"
          >
            Track Order
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {onReorder && order.status === "delivered" && (
          <Button
            onClick={() => onReorder(order.id)}
            className="flex-1 sm:flex-none"
          >
            Reorder
          </Button>
        )}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
    </Card>
  );
}
