import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, Box, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiOrder } from "@/services/orderApi";
import { mapFulfillmentStatus } from "@/services/orderApi";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

function buildTimeline(order: ApiOrder) {
  const { label } = mapFulfillmentStatus(order.fulfillment_status);
  const steps = [
    { label: "Order Placed", icon: Package, key: "placed" },
    { label: "Processing", icon: Clock, key: "processing" },
    { label: "Shipped", icon: Truck, key: "shipped" },
    { label: "Out for Delivery", icon: MapPin, key: "out_for_delivery" },
    { label: "Delivered", icon: CheckCircle2, key: "delivered" },
  ];

  const doneUntil: Record<string, number> = {
    unfulfilled: 1,
    processing: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
    cancelled: 0,
  };
  const doneCount = doneUntil[order.fulfillment_status] ?? 1;

  return steps.map((step, i) => ({
    ...step,
    done: i < doneCount,
    isCurrent: i === doneCount - 1,
    date: i === 0 ? new Date(order.order_time).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "",
  }));
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed || trimmed.length < 3) {
      setError("Please enter a valid order ID or invoice number");
      setOrder(null);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/orders/track", { params: { invoice: trimmed } });
      setOrder(res.data.data);
    } catch {
      setError("Order not found. Please check your order ID and try again.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const timeline = order ? buildTimeline(order) : [];
  const { label: statusLabel } = order ? mapFulfillmentStatus(order.fulfillment_status) : { label: "" };

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
        <motion.form {...fadeUp} transition={{ delay: 0.3 }} onSubmit={handleTrack} className="relative">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value); setError(""); }}
                placeholder="Enter invoice number (e.g. INV-00123)"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                  error ? "border-destructive" : "border-border"
                }`}
              />
            </div>
            <button type="submit" disabled={loading} className="gradient-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shrink-0 disabled:opacity-70">
              {loading ? "Tracking..." : <><span>Track</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
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
            className="container max-w-2xl mx-auto"
          >
            {/* Order Info Card */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
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
                  <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>{order.carrier ?? order.method ?? "Standard Shipping"}</span>
                </div>
                {order.shipping_address?.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{[order.shipping_address.city, order.shipping_address.state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {order.tracking_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4 text-primary" />
                    <span>Tracking: {order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>

            {order.fulfillment_status === "cancelled" ? (
              <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 text-destructive">
                <XCircle className="h-8 w-8 shrink-0" />
                <div>
                  <p className="font-semibold">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground">This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              /* Timeline */
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-bold text-sm mb-6 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Shipment Progress
                </h2>
                <div className="space-y-0">
                  {timeline.map((step, i) => {
                    const isLast = i === timeline.length - 1;
                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
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
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
