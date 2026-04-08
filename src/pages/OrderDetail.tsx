import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth, DemoOrder } from "@/contexts/AuthContext";
import { products } from "@/data/products";
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, MapPin, CreditCard, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const statusConfig = {
  processing: { label: "Processing", color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
  shipped: { label: "Shipped", color: "bg-blue-500/10 text-blue-600", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600", icon: XCircle },
};

const timelineSteps = (status: DemoOrder["status"]) => {
  const all = [
    { label: "Order Placed", icon: Package },
    { label: "Processing", icon: Clock },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 },
  ];
  const idx = { processing: 1, shipped: 2, delivered: 3, cancelled: 0 }[status];
  return all.map((s, i) => ({ ...s, done: status !== "cancelled" && i <= idx }));
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useAuth();
  const order = orders.find((o) => o.id === id);

  if (!order) {
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

  const cfg = statusConfig[order.status];
  const steps = timelineSteps(order.status);

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
              <span className="text-foreground font-medium">{order.id}</span>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground mb-1">{order.id}</h1>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                <cfg.icon className="h-3.5 w-3.5" />
                {cfg.label}
              </span>
            </div>

            {/* Timeline */}
            {order.status !== "cancelled" && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="font-display font-bold text-sm mb-5">Order Progress</h2>
                <div className="flex items-center justify-between">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          step.done ? "gradient-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                        }`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-[10px] font-semibold ${step.done ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${step.done && steps[i + 1]?.done ? "bg-primary" : "bg-border"}`} />
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
                  {order.items.map((item) => {
                    const product = products.find((p) => p.id === item.id);
                    const image = product?.image || item.image;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                        {image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                            <img src={image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-display font-bold text-sm text-foreground shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-4">
                {/* Price Summary */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display font-bold text-sm mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm border-b border-border pb-3 mb-3">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>${order.shipping.toFixed(2)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
                  </div>
                  <div className="flex justify-between font-display font-bold text-base">
                    <span>Total</span><span className="text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Shipping</h3>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                    <p className="pt-1 text-xs">{order.shippingMethod}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Payment</h3>
                  <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
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
