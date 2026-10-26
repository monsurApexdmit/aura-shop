import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { mapFulfillmentStatus } from "@/services/orderApi";
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, type StatusVariant } from "@/components/common/StatusBadge";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const statusIcons = { yellow: Clock, blue: Truck, green: CheckCircle2, red: XCircle, gray: Package };

type StatusFilter = "all" | "processing" | "shipped" | "delivered" | "cancelled";

const statusVariantMap: Record<string, StatusVariant> = {
  yellow: "secondary",
  blue: "secondary",
  green: "default",
  red: "destructive",
  gray: "outline",
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

            <PageHeader title="My Orders" className="mb-6" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID..."
                  className="w-full pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "processing", "shipped", "delivered", "cancelled"] as StatusFilter[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={filter === s ? "default" : "outline"}
                    aria-pressed={filter === s}
                    onClick={() => setFilter(s)}
                    className="capitalize"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : isError ? (
              <EmptyState bordered className="py-16" icon={Package} title="We could not load your orders" />
            ) : filtered.length === 0 ? (
              <EmptyState bordered className="py-16" icon={Package} title="No orders found" />
            ) : (
              <div className="space-y-3">
                {filtered.map((order, i) => {
                  const { label, color } = mapFulfillmentStatus(order.fulfillment_status);
                  const Icon = statusIcons[color as keyof typeof statusIcons] ?? Package;
                  const statusVariant = statusVariantMap[color] ?? statusVariantMap.gray;
                  const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                  const orderDate = order.order_time ? new Date(order.order_time) : null;
                  const orderDateLabel = orderDate && !Number.isNaN(orderDate.getTime())
                    ? orderDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "Date unavailable";
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Item asChild variant="outline" className="bg-card flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <Link to={`/account/orders/${order.id}`}>
                          <ItemMedia variant="icon">
                            <Icon />
                          </ItemMedia>
                          <ItemContent className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <ItemTitle className="font-mono">{order.invoice_no || `Order #${order.id}`}</ItemTitle>
                              <StatusBadge status={label} variant={statusVariant} />
                            </div>
                            <ItemDescription>
                              {orderDateLabel} · {itemCount} item{itemCount !== 1 ? "s" : ""} · {order.method || "Standard"}
                            </ItemDescription>
                          </ItemContent>
                          <ItemActions className="sm:flex-col sm:items-end sm:gap-0">
                            <p className="font-semibold tabular-nums">{formatCurrency(order.amount)}</p>
                            <p className="text-xs text-muted-foreground">{order.payment_status}</p>
                          </ItemActions>
                          <ChevronRight className="hidden h-4 w-4 text-muted-foreground shrink-0 sm:block" />
                        </Link>
                      </Item>
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
