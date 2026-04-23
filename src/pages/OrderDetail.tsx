import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrder } from "@/hooks/useOrders";
import { mapFulfillmentStatus } from "@/services/orderApi";
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, MapPin, CreditCard, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";

const STATUS_ICON: Record<string, React.ElementType> = {
  Processing: Clock,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
};

const STATUS_COLOR: Record<string, string> = {
  Processing: "bg-yellow-500/10 text-yellow-600",
  Shipped: "bg-blue-500/10 text-blue-600",
  Delivered: "bg-green-500/10 text-green-600",
  Cancelled: "bg-red-500/10 text-red-600",
};

const TIMELINE = [
  { label: "Order Placed", icon: Package },
  { label: "Processing", icon: Clock },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: CheckCircle2 },
];

const TIMELINE_IDX: Record<string, number> = {
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = id ? Number(id) : null;
  const { data: order, isLoading, isError } = useOrder(numericId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-40 flex flex-col items-center gap-4">
        <div className="container max-w-4xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background pt-40 flex flex-col items-center gap-4">
        <Package className="h-16 w-16 text-muted-foreground/30" />
        <p className="font-display font-bold text-xl text-foreground">Order not found</p>
        <button onClick={() => navigate("/account/orders")} className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm">
          Back to Orders
        </button>
      </div>
    );
  }

  const { label: statusLabel } = mapFulfillmentStatus(order.fulfillment_status);
  const StatusIcon = STATUS_ICON[statusLabel] ?? Clock;
  const statusColor = STATUS_COLOR[statusLabel] ?? "bg-muted text-muted-foreground";
  const timelineIdx = TIMELINE_IDX[statusLabel] ?? 0;
  const isCancelled = statusLabel === "Cancelled";
  const subtotal = order.items.reduce((s, i) => s + i.total_price, 0);
  const tax = order.amount - subtotal - order.shipping_cost;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">My Account</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/account/orders" className="hover:text-primary">Orders</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{order.invoice_no}</span>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground mb-1">{order.invoice_no}</h1>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.order_time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusLabel}
              </span>
            </div>

            {/* Timeline */}
            {!isCancelled && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="font-display font-bold text-sm mb-5">Order Progress</h2>
                <div className="flex items-center justify-between">
                  {TIMELINE.map((step, i) => (
                    <div key={step.label} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          i <= timelineIdx ? "gradient-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                        }`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-[10px] font-semibold ${i <= timelineIdx ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${i < timelineIdx ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-bold text-sm mb-4">Order Items ({order.items.length})</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">No Image</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{item.product_name}</p>
                        {item.variant_name && <p className="text-xs text-muted-foreground">{item.variant_name}</p>}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                      </div>
                      <p className="font-display font-bold text-sm text-foreground shrink-0">${item.total_price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Price Summary */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display font-bold text-sm mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm border-b border-border pb-3 mb-3">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>${order.shipping_cost.toFixed(2)}</span></div>
                    {tax > 0 && <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${tax.toFixed(2)}</span></div>}
                    {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>}
                  </div>
                  <div className="flex justify-between font-display font-bold text-base">
                    <span>Total</span><span className="text-primary">${order.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Shipping</h3>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p className="font-medium text-foreground">{order.shipping_address.name}</p>
                      {order.shipping_address.address && <p>{order.shipping_address.address}</p>}
                      {(order.shipping_address.city || order.shipping_address.state) && (
                        <p>{[order.shipping_address.city, order.shipping_address.state, order.shipping_address.zip].filter(Boolean).join(", ")}</p>
                      )}
                      {order.shipping_address.phone && <p className="pt-1 text-xs">{order.shipping_address.phone}</p>}
                      {order.tracking_number && (
                        <p className="pt-1 text-xs">Tracking: <span className="font-mono text-primary">{order.tracking_number}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Payment</h3>
                  <p className="text-sm text-muted-foreground capitalize">{order.method}</p>
                  <p className={`text-xs mt-1 font-medium ${order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {order.payment_status === "paid" ? "Paid" : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            <button onClick={() => navigate("/account/orders")} className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Orders
            </button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
