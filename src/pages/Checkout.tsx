import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, ClipboardCheck, CheckCircle2, ArrowLeft, ArrowRight, Truck, ShieldCheck, Banknote } from "lucide-react";
import { z } from "zod";

const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Phone is required").max(20),
  address: z.string().trim().min(5, "Address is required").max(300),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  zip: z.string().trim().min(3, "ZIP code is required").max(20),
  note: z.string().max(500).optional(),
});

type ShippingData = z.infer<typeof shippingSchema>;

const steps = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Review", icon: ClipboardCheck },
  { id: 3, label: "Complete", icon: CheckCircle2 },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId] = useState(() => `ORD-${Date.now().toString(36).toUpperCase()}`);

  const [form, setForm] = useState<ShippingData>({
    fullName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", note: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateShipping = () => {
    const result = shippingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateShipping()) return;
    if (step === 2) {
      clearCart();
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const shipping = 5.99;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + shipping + tax;

  if (items.length === 0 && step < 3) {
    return (
      <div className="min-h-screen bg-background pt-40 flex flex-col items-center gap-4 px-4">
        <Truck className="h-16 w-16 text-muted-foreground/30" />
        <p className="font-display font-bold text-xl text-foreground">Your cart is empty</p>
        <button onClick={() => navigate("/shop")} className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm">
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= s.id ? "gradient-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-semibold ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-300 ${step > s.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <motion.div key="shipping" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-background rounded-2xl border border-border p-6 sm:p-8">
                  <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Shipping Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: "fullName", label: "Full Name", placeholder: "John Doe", full: true },
                      { name: "email", label: "Email", placeholder: "john@example.com", type: "email" },
                      { name: "phone", label: "Phone", placeholder: "+1 234 567 890", type: "tel" },
                      { name: "address", label: "Address", placeholder: "123 Main Street", full: true },
                      { name: "city", label: "City", placeholder: "New York" },
                      { name: "state", label: "State", placeholder: "NY" },
                      { name: "zip", label: "ZIP Code", placeholder: "10001" },
                    ].map((field) => (
                      <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{field.label}</label>
                        <input
                          name={field.name}
                          type={field.type || "text"}
                          value={(form as any)[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className={`w-full px-4 py-3 rounded-xl border bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                            errors[field.name] ? "border-destructive" : "border-border"
                          }`}
                        />
                        {errors[field.name] && <p className="text-xs text-destructive mt-1">{errors[field.name]}</p>}
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Order Note (Optional)</label>
                      <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Special delivery instructions..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shipping} tax={tax} grandTotal={grandTotal} />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={nextStep} className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                  Review Order <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-5">
                  {/* Shipping Review */}
                  <div className="bg-background rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Delivery Address
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">{form.fullName}</p>
                      <p>{form.address}</p>
                      <p>{form.city}, {form.state} {form.zip}</p>
                      <p>{form.phone} · {form.email}</p>
                      {form.note && <p className="mt-2 italic text-xs">Note: {form.note}</p>}
                    </div>
                  </div>

                  {/* Items Review */}
                  <div className="bg-background rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-primary" /> Order Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-display font-bold text-sm text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shipping} tax={tax} grandTotal={grandTotal} />
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">Your order information is secure. We'll send a confirmation to your email.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Edit Shipping
                </button>
                <button onClick={nextStep} className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                  Place Order <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="max-w-lg mx-auto text-center bg-background rounded-2xl border border-border p-8 sm:p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, delay: 0.2 }}
                  className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-display font-bold text-2xl text-foreground mb-2">
                  Order Placed Successfully!
                </motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-sm mb-6">
                  Thank you for your order. We'll send you a confirmation email shortly.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="bg-muted/30 rounded-xl p-5 mb-6 border border-border/50 text-left space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono font-bold text-primary">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery To</span>
                    <span className="font-medium text-foreground">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <span className="font-medium text-foreground">3–5 Business Days</span>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => navigate("/")} className="flex-1 gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                    Continue Shopping
                  </button>
                  <button onClick={() => navigate("/shop")} className="flex-1 border border-border text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-colors">
                    Browse More
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrderSummary({ items, totalPrice, shipping, tax, grandTotal }: {
  items: { id: string; name: string; quantity: number; price: number }[];
  totalPrice: number; shipping: number; tax: number; grandTotal: number;
}) {
  return (
    <div className="bg-background rounded-2xl border border-border p-6 sticky top-36">
      <h3 className="font-display font-bold text-sm mb-4">Order Summary</h3>
      <div className="space-y-2 text-sm border-b border-border pb-4 mb-4">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex justify-between font-display font-bold text-lg">
        <span>Total</span>
        <span className="text-primary">${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
