import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, Box } from "lucide-react";

const mockStatuses = [
  { label: "Order Placed", icon: Package, date: "Mar 5, 2026 — 10:32 AM", done: true },
  { label: "Processing", icon: Clock, date: "Mar 5, 2026 — 11:15 AM", done: true },
  { label: "Shipped", icon: Truck, date: "Mar 6, 2026 — 2:40 PM", done: true },
  { label: "Out for Delivery", icon: MapPin, date: "Mar 8, 2026 — 9:00 AM", done: false },
  { label: "Delivered", icon: CheckCircle2, date: "", done: false },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [tracked, setTracked] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed || trimmed.length < 4) {
      setError("Please enter a valid order ID");
      setTracked(false);
      return;
    }
    setError("");
    setTracked(true);
  };

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
          Enter your order ID to see the latest shipping status and delivery updates.
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
                placeholder="Enter order ID (e.g. ORD-K1L2M3)"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                  error ? "border-destructive" : "border-border"
                }`}
              />
            </div>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shrink-0">
              Track <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </motion.form>
      </section>

      {/* Results */}
      <AnimatePresence mode="wait">
        {tracked && (
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</p>
                  <p className="font-mono font-bold text-primary text-lg">{orderId.trim().toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Delivery</p>
                  <p className="font-display font-bold text-foreground">Mar 9, 2026</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Box className="h-4 w-4 text-primary" />
                  <span>2 items</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Express Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>New York, NY</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display font-bold text-sm mb-6 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Shipment Progress
              </h2>
              <div className="space-y-0">
                {mockStatuses.map((status, i) => {
                  const isLast = i === mockStatuses.length - 1;
                  const isCurrent = status.done && (i === mockStatuses.length - 1 || !mockStatuses[i + 1].done);
                  return (
                    <motion.div
                      key={status.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex gap-4"
                    >
                      {/* Dot + Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? "gradient-primary text-primary-foreground shadow-lg ring-4 ring-primary/20"
                            : status.done
                            ? "gradient-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <status.icon className="h-5 w-5" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-12 ${status.done ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pt-2 pb-4">
                        <p className={`font-semibold text-sm ${status.done ? "text-foreground" : "text-muted-foreground"}`}>
                          {status.label}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                              Current
                            </span>
                          )}
                        </p>
                        {status.date && <p className="text-xs text-muted-foreground mt-0.5">{status.date}</p>}
                        {!status.done && !status.date && <p className="text-xs text-muted-foreground mt-0.5">Pending</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
