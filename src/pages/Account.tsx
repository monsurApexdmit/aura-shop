import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { mapFulfillmentStatus } from "@/services/orderApi";
import { Package, MapPin, User, LogOut, ChevronRight, ShoppingBag, Clock, Truck, CheckCircle2, XCircle, Headphones } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const statusIcons = { yellow: Clock, blue: Truck, green: CheckCircle2, red: XCircle, gray: Package };
const statusColors: Record<string, string> = {
  yellow: "bg-yellow-500/10 text-yellow-600",
  blue:   "bg-blue-500/10 text-blue-600",
  green:  "bg-green-500/10 text-green-600",
  red:    "bg-red-500/10 text-red-600",
  gray:   "bg-gray-500/10 text-gray-600",
};

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Account() {
  const { user, isLoggedIn, logout } = useAuth();
  const { data, isLoading, isError } = useOrders(isLoggedIn);
  const { formatCurrency } = useCurrency();

  const orders = data?.data ?? [];
  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((s, o) => s + Number(o.amount ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-5xl">
          {/* Welcome */}
          <motion.div {...fadeUp} className="mb-8">
            <h1 className="font-display font-bold text-3xl text-foreground mb-1">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground text-sm">Manage your account, orders, and addresses.</p>
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Orders", value: isLoading ? "..." : String(orders.length), icon: Package, link: "/account/orders" },
              { label: "Total Spent", value: isLoading ? "..." : formatCurrency(totalSpent), icon: ShoppingBag, link: "/account/orders" },
              { label: "Addresses", value: "Manage", icon: MapPin, link: "/account/addresses" },
              { label: "Profile", value: "Edit", icon: User, link: "/account/profile" },
            ].map((stat) => (
              <Link key={stat.label} to={stat.link} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-display font-bold text-lg text-foreground">{stat.value}</p>
              </Link>
            ))}
          </motion.div>

          {/* Quick Links + Recent Orders */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Links */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-1 space-y-3">
              {[
                { label: "My Orders", desc: "View order history & status", icon: Package, to: "/account/orders" },
                { label: "Addresses", desc: "Manage shipping addresses", icon: MapPin, to: "/account/addresses" },
                { label: "Support", desc: "Get help with your orders", icon: Headphones, to: "/support" },
                { label: "Profile Settings", desc: "Edit your personal info", icon: User, to: "/account/profile" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}

              <button onClick={logout} className="w-full flex items-center gap-4 p-4 bg-card border border-destructive/20 rounded-xl hover:bg-destructive/5 transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-destructive">Log Out</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account</p>
                </div>
              </button>
            </motion.div>

            {/* Recent Orders */}
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-base text-foreground">Recent Orders</h2>
                  <Link to="/account/orders" className="text-xs text-primary font-semibold hover:underline">View All</Link>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                  </div>
                ) : isError ? (
                  <div className="text-center py-10">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">We could not load your orders right now.</p>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No orders yet</p>
                    <Link to="/shop" className="text-sm text-primary font-semibold hover:underline mt-2 inline-block">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const { label, color } = mapFulfillmentStatus(order.fulfillment_status);
                      const Icon = statusIcons[color as keyof typeof statusIcons] ?? Package;
                      const colorClass = statusColors[color] ?? statusColors.gray;
                      const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                      const orderDate = order.order_time ? new Date(order.order_time) : null;
                      const orderDateLabel = orderDate && !Number.isNaN(orderDate.getTime())
                        ? orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Date unavailable";
                      return (
                        <Link key={order.id} to={`/account/orders/${order.id}`} className="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors sm:flex-row sm:items-center sm:gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono font-bold text-sm text-foreground">{order.invoice_no || `Order #${order.id}`}</p>
                            <p className="text-xs text-muted-foreground">
                              {orderDateLabel} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="shrink-0 sm:text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
                              {label}
                            </span>
                            <p className="font-display font-bold text-sm text-foreground mt-1">{formatCurrency(order.amount)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
