import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Package, Truck, CheckCircle2, Clock, MapPin,
  ArrowRight, Box, XCircle, Calendar, Info,
} from "lucide-react";
import { orderApi } from "@/services/orderApi";
import type { ApiOrder } from "@/services/orderApi";
import { mapFulfillmentStatus } from "@/services/orderApi";
import { useCurrency } from "@/contexts/CurrencyContext";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

const TIMELINE_STEPS = [
  { label: "Order Placed",    icon: Package,     key: "placed"           },
  { label: "Processing",      icon: Clock,       key: "processing"       },
  { label: "Shipped",         icon: Truck,       key: "shipped"          },
  { label: "Out for Delivery",icon: MapPin,      key: "out_for_delivery" },
  { label: "Delivered",       icon: CheckCircle2,key: "delivered"        },
];

const DONE_UNTIL: Record<string, number> = {
  unfulfilled:     1,
  processing:      2,
  shipped:         3,
  out_for_delivery:4,
  delivered:       5,
  cancelled:       0,
};

function buildTimeline(order: ApiOrder) {
  const doneCount = DONE_UNTIL[order.fulfillment_status] ?? 1;
  const orderDate = order.order_time ? new Date(order.order_time) : null;
  const orderDateLabel = orderDate && !Number.isNaN(orderDate.getTime())
    ? orderDate.toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : "";

  return TIMELINE_STEPS.map((step, i) => ({
    ...step,
    done: i < doneCount,
    isCurrent: i === doneCount - 1,
    date: i === 0 ? orderDateLabel : "",
  }));
}

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { formatCurrency } = useCurrency();
  const [searchParams] = useSearchParams();

  const runTrack = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.length < 3) {
      setError("Please enter a valid invoice number");
      setOrder(null);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await orderApi.trackByInvoice(trimmed);
      setOrder(data);
    } catch {
      setError("Order not found. Please check your invoice number and try again.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const inv = searchParams.get("invoice");
    if (inv) {
      setOrderId(inv);
      runTrack(inv);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed || trimmed.length < 3) {
      setError("Please enter a valid invoice number");
      setOrder(null);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await orderApi.trackByInvoice(trimmed);
      setOrder(data);
    } catch {
      setError("Order not found. Please check your invoice number and try again.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const timeline = order ? buildTimeline(order) : [];
  const { label: statusLabel } = order ? mapFulfillmentStatus(order.fulfillment_status) : { label: "" };
  const shipment = order?.shipment ?? null;
  const trackingHistory = shipment?.tracking_history ?? [];
  const itemCount = Array.isArray(order?.items) ? order.items.length : 0;

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      {/* Hero */}
      <section className="container text-center mb-12">
        <motion.div {...fadeUp} className="flex items-center justify-center gap-2 mb-3">
          <Truck className="h-5 w-5 text-primary" />
          <p className="text-primary font-semibold text-sm uppercase tracking-widest">Order Tracking</p>
        </motion.div>
        <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4">
          Track Your Order
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-md mx-auto">
          Enter your invoice number to see the latest shipping status and delivery updates.
        </motion.p>
      </section>

      {/* Search */}
      <section className="container max-w-xl mx-auto mb-12">
        <motion.form {...fadeUp} transition={{ delay: 0.3 }} onSubmit={handleTrack}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value); setError(""); }}
                placeholder="Enter invoice number (e.g. ORD-XXXX)"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                  error ? "border-destructive" : "border-border"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="gradient-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shrink-0 disabled:opacity-70"
            >
              {loading ? "Tracking…" : <><span>Track</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
          {error && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><Info className="h-3 w-3" />{error}</p>}
        </motion.form>
      </section>

      {/* Results */}
      <AnimatePresence mode="wait">
        {order && (
          <motion.section
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="container max-w-2xl mx-auto space-y-4"
          >
            {/* Order Info Card */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</p>
                  <p className="font-mono font-bold text-primary text-lg">{order.invoice_no}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                  <p className="font-display font-bold text-foreground">{statusLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Box className="h-4 w-4 text-primary" />
                  <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>{shipment?.carrier ?? order.carrier ?? order.method ?? "Standard Shipping"}</span>
                </div>
                {order.shipping_address?.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{[order.shipping_address.city, order.shipping_address.state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {shipment?.tracking_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-mono text-xs">{shipment.tracking_number}</span>
                  </div>
                )}
              </div>

              {/* Shipping timeline dates */}
              {shipment && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {shipment.shipped_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Shipped</p>
                        <p>{formatDate(shipment.shipped_at)}</p>
                      </div>
                    </div>
                  )}
                  {shipment.estimated_delivery && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Est. Delivery</p>
                        <p>{formatDate(shipment.estimated_delivery)}</p>
                      </div>
                    </div>
                  )}
                  {shipment.delivered_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-600">Delivered</p>
                        <p>{formatDate(shipment.delivered_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {order.fulfillment_status === "cancelled" ? (
              <div className="bg-card border border-destructive/30 rounded-2xl p-6 flex items-center gap-4 text-destructive">
                <XCircle className="h-8 w-8 shrink-0" />
                <div>
                  <p className="font-semibold">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground">This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Fulfillment Progress */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-display font-bold text-sm mb-6 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Order Progress
                  </h2>
                  <div className="space-y-0">
                    {timeline.map((step, i) => {
                      const isLast = i === timeline.length - 1;
                      return (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * i }}
                          className="flex gap-4"
                        >
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              step.isCurrent
                                ? "gradient-primary text-primary-foreground shadow-lg ring-4 ring-primary/20"
                                : step.done
                                ? "gradient-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              <step.icon className="h-5 w-5" />
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 h-12 ${step.done ? "bg-primary" : "bg-border"}`} />
                            )}
                          </div>
                          <div className="pt-2 pb-4">
                            <p className={`font-semibold text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                              {step.isCurrent && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                  Current
                                </span>
                              )}
                            </p>
                            {step.date
                              ? <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>
                              : !step.done && <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
                            }
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking History from shipment */}
                {trackingHistory.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="font-display font-bold text-sm mb-5 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" /> Tracking History
                    </h2>
                    <div className="space-y-0">
                      {trackingHistory.map((event, i) => {
                        const isLatest = i === 0;
                        const isDelivered = event.status === "delivered";
                        const isLast = i === trackingHistory.length - 1;
                        return (
                          <div key={i} className="relative flex gap-4">
                            {/* Vertical line */}
                            {!isLast && (
                              <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />
                            )}
                            {/* Dot */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                              isLatest
                                ? "bg-primary border-primary text-primary-foreground"
                                : isDelivered
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-muted border-border text-muted-foreground"
                            }`}>
                              {isDelivered
                                ? <CheckCircle2 className="h-4 w-4" />
                                : <Truck className="h-4 w-4" />
                              }
                            </div>
                            {/* Content */}
                            <div className="flex-1 pb-5">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-semibold text-sm capitalize ${isLatest ? "text-primary" : "text-foreground"}`}>
                                  {event.status.replace(/_/g, " ")}
                                  {isLatest && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                      Latest
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(event.event_time)}
                                </p>
                              </div>
                              {event.location && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                                  {event.location}
                                </p>
                              )}
                              {event.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" /> Items ({order.items.length})
                  </h2>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-foreground">{item.product_name}</p>
                          {item.variant_name && (
                            <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-muted-foreground text-xs">x{item.quantity}</p>
                          <p className="font-semibold text-foreground">{formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                    {order.shipping_cost > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>{formatCurrency(order.shipping_cost)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Discount</span>
                        <span className="text-emerald-600">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(order.amount)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
