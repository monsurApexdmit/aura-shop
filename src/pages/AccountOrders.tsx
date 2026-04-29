import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { mapFulfillmentStatus } from "@/services/orderApi";
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const statusIcons = { yellow: Clock, blue: Truck, green: CheckCircle2, red: XCircle, gray: Package };

type StatusFilter = "all" | "processing" | "shipped" | "delivered" | "cancelled";

const statusColorMap: Record<string, string> = {
  yellow: "bg-yellow-500/10 text-yellow-600",
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-green-500/10 text-green-600",
  red: "bg-red-500/10 text-red-600",
  gray: "bg-gray-500/10 text-gray-600",
};

export default function AccountOrders() {
  const { isLoggedIn } = useAuth();
  const { data, isLoading, isError } = useOrders(isLoggedIn);
  const { formatCurrency } = useCurrency();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const orders = data?.data ?? [];

  const filtered = useMemo(() => orders.filter((o) => {
    const { label } = mapFulfillmentStatus(o.fulfillment_status);
    const labelKey = label.toLowerCase() as StatusFilter;
    if (filter !== "all" && labelKey !== filter) return false;
    if (search && !(o.invoice_no ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [orders, filter, search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">My Account</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Orders</span>
            </div>

            <h1 className="font-display font-bold text-2xl text-foreground mb-6">My Orders</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "processing", "shipped", "delivered", "cancelled"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors capitalize ${
                      filter === s ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
              </div>
            ) : isError ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Package className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">We could not load your orders</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Package className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((order, i) => {
                  const { label, color } = mapFulfillmentStatus(order.fulfillment_status);
                  const Icon = statusIcons[color as keyof typeof statusIcons] ?? Package;
                  const colorClass = statusColorMap[color] ?? statusColorMap.gray;
                  const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                  const orderDate = order.order_time ? new Date(order.order_time) : null;
                  const orderDateLabel = orderDate && !Number.isNaN(orderDate.getTime())
                    ? orderDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "Date unavailable";
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/account/orders/${order.id}`} className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors group">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-mono font-bold text-sm text-foreground">{order.invoice_no || `Order #${order.id}`}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${colorClass}`}>{label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {orderDateLabel} · {itemCount} item{itemCount !== 1 ? "s" : ""} · {order.method || "Standard"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-foreground">{formatCurrency(order.amount)}</p>
                          <p className="text-xs text-muted-foreground">{order.payment_status}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
