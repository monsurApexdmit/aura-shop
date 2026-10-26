import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { mapFulfillmentStatus } from "@/services/orderApi";
import { Package, MapPin, User, LogOut, ChevronRight, ShoppingBag, Clock, Truck, CheckCircle2, XCircle, Headphones, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatTile } from "@/components/common/StatTile";
import { StatusBadge, type StatusVariant } from "@/components/common/StatusBadge";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";

const statusIcons = { yellow: Clock, blue: Truck, green: CheckCircle2, red: XCircle, gray: Package };
const statusVariants: Record<string, StatusVariant> = {
  yellow: "secondary",
  blue:   "secondary",
  green:  "default",
  red:    "destructive",
  gray:   "outline",
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
            <PageHeader
              title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}!`}
              description="Manage your account, orders, and addresses."
            />
          </motion.div>

          {/* Stats */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Orders", value: isLoading ? "..." : String(orders.length), icon: Package, link: "/account/orders" },
              { label: "Total Spent", value: isLoading ? "..." : formatCurrency(totalSpent), icon: ShoppingBag, link: "/account/orders" },
              { label: "Addresses", value: "Manage", icon: MapPin, link: "/account/addresses" },
              { label: "Profile", value: "Edit", icon: User, link: "/account/profile" },
            ].map((stat) => (
              <Link key={stat.label} to={stat.link} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <StatTile
                  label={stat.label}
                  value={stat.value}
                  icon={<stat.icon />}
                  className="h-full transition-colors hover:bg-accent/50"
                />
              </Link>
            ))}
          </motion.div>

          {/* Quick Links + Recent Orders */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Links */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-1 space-y-3">
              {[
                { label: "My Orders", desc: "View order history & status", icon: Package, to: "/account/orders" },
                { label: "My Returns", desc: "Track return requests & refunds", icon: RotateCcw, to: "/account/returns" },
                { label: "Addresses", desc: "Manage shipping addresses", icon: MapPin, to: "/account/addresses" },
                { label: "Support", desc: "Get help with your orders", icon: Headphones, to: "/support" },
                { label: "Profile Settings", desc: "Edit your personal info", icon: User, to: "/account/profile" },
              ].map((link) => (
                <Item key={link.to} asChild variant="outline" className="bg-card">
                  <Link to={link.to}>
                    <ItemMedia variant="icon">
                      <link.icon />
                    </ItemMedia>
                    <ItemContent className="min-w-0">
                      <ItemTitle>{link.label}</ItemTitle>
                      <ItemDescription>{link.desc}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </ItemActions>
                  </Link>
                </Item>
              ))}

              <Button variant="outline" onClick={logout} className="h-auto w-full justify-start gap-4 p-4 whitespace-normal text-left">
                <ItemMedia variant="icon" className="text-destructive">
                  <LogOut />
                </ItemMedia>
                <span>
                  <span className="block font-medium text-sm text-destructive">Log Out</span>
                  <span className="block text-sm font-normal text-muted-foreground">Sign out of your account</span>
                </span>
              </Button>
            </motion.div>

            {/* Recent Orders */}
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <SectionCard
                title="Recent Orders"
                actions={
                  <Button asChild variant="link" size="sm" className="h-auto p-0">
                    <Link to="/account/orders">View All</Link>
                  </Button>
                }
              >

                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
                  </div>
                ) : isError ? (
                  <EmptyState className="py-10" icon={Package} title="We could not load your orders right now." />
                ) : recentOrders.length === 0 ? (
                  <EmptyState
                    className="py-10"
                    icon={Package}
                    title="No orders yet"
                    action={
                      <Button asChild variant="link">
                        <Link to="/shop">Start Shopping</Link>
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const { label, color } = mapFulfillmentStatus(order.fulfillment_status);
                      const Icon = statusIcons[color as keyof typeof statusIcons] ?? Package;
                      const statusVariant = statusVariants[color] ?? statusVariants.gray;
                      const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                      const orderDate = order.order_time ? new Date(order.order_time) : null;
                      const orderDateLabel = orderDate && !Number.isNaN(orderDate.getTime())
                        ? orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "Date unavailable";
                      return (
                        <Item key={order.id} asChild variant="outline" className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                          <Link to={`/account/orders/${order.id}`}>
                            <ItemMedia variant="icon">
                              <Icon />
                            </ItemMedia>
                            <ItemContent className="min-w-0">
                              <ItemTitle className="font-mono">{order.invoice_no || `Order #${order.id}`}</ItemTitle>
                              <ItemDescription>
                                {orderDateLabel} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                              </ItemDescription>
                            </ItemContent>
                            <ItemActions className="flex-col items-start gap-1 sm:items-end">
                              <StatusBadge status={label} variant={statusVariant} />
                              <p className="font-semibold text-sm tabular-nums">{formatCurrency(order.amount)}</p>
                            </ItemActions>
                          </Link>
                        </Item>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
