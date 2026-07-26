import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePlaceOrder } from "@/hooks/useOrders";
import { addressApi, type ApiAddress } from "@/services/addressApi";
import { couponApi, type CouponResult } from "@/services/couponApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, ClipboardCheck, CheckCircle2, ArrowLeft, ArrowRight, Truck, ShieldCheck, Banknote, Landmark, Package, Zap, Box, Globe, Wallet, QrCode, Smartphone, UserCheck, Info, Tag, X, Loader2 } from "lucide-react";
import { useShippingMethods } from "@/hooks/useShippingMethods";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import FormField from "@/components/forms/FormField";
import ShippingOption from "@/components/features/checkout/ShippingOption";
import StepIndicator from "@/components/features/checkout/StepIndicator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().min(7, "Phone is required").max(20),
  address: z.string().trim().min(5, "Address is required").max(300),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  zip: z.string().trim().max(20).optional().or(z.literal("")),
  note: z.string().max(500).optional(),
});

type ShippingData = z.infer<typeof shippingSchema>;

const SHIPPING_ICON_MAP: Record<string, LucideIcon> = {
  package: Package,
  truck:   Truck,
  zap:     Zap,
  box:     Box,
  globe:   Globe,
};

const PAYMENT_ICON_MAP: Record<string, LucideIcon> = {
  banknote:      Banknote,
  landmark:      Landmark,
  "credit-card": CreditCard,
  wallet:        Wallet,
  "qr-code":     QrCode,
  smartphone:    Smartphone,
};

const steps = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: ClipboardCheck },
  { id: 4, label: "Complete", icon: CheckCircle2 },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { formatCurrency, currencySymbol } = useCurrency();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const { data: shippingMethods = [], isLoading: methodsLoading } = useShippingMethods();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [addressMode, setAddressMode] = useState<"saved" | "new">(isLoggedIn ? "saved" : "new");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [form, setForm] = useState<ShippingData>({
    fullName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", note: "",
  });

  const CHECKOUT_STORAGE_KEY = "checkout_saved_state";
  const [restoredFromSession, setRestoredFromSession] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(parsed.form);
        if (parsed.step && parsed.step < 4) setStep(parsed.step);
        if (parsed.paymentMethodId) setPaymentMethodId(parsed.paymentMethodId);
        if (parsed.shippingMethodId) setShippingMethodId(parsed.shippingMethodId);
        if (parsed.couponCode) setCouponCode(parsed.couponCode);
        setRestoredFromSession(true);
        sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (shippingMethods.length > 0 && shippingMethodId === null) {
      setShippingMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods]);

  useEffect(() => {
    if (paymentMethods.length > 0 && paymentMethodId === null) {
      setPaymentMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods]);

  const { data: savedAddresses = [] } = useQuery<ApiAddress[]>({
    queryKey: ["addresses"],
    queryFn: addressApi.list,
    enabled: isLoggedIn,
  });

  const defaultAddress = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0] ?? null;

  const fillFromAddress = (addr: ApiAddress | null) => {
    if (!addr) return;
    setForm((f) => ({
      ...f,
      fullName: addr.full_name || user?.name || "",
      email: addr.email || user?.email || "",
      phone: addr.phone || user?.phone || "",
      address: [addr.address_line1, addr.address_line2].filter(Boolean).join(", "),
      city: addr.city ?? "",
      state: addr.state ?? "",
      zip: addr.postal_code ?? "",
    }));
  };

  useEffect(() => {
    if (!restoredFromSession && addressMode === "saved" && defaultAddress) {
      fillFromAddress(defaultAddress);
    }
  }, [defaultAddress]);

  const switchAddressMode = (mode: "saved" | "new") => {
    setAddressMode(mode);
    setErrors({});
    if (mode === "saved" && defaultAddress) {
      fillFromAddress(defaultAddress);
    } else {
      setForm({ fullName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", note: "" });
    }
  };

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

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponApplying(true);
    try {
      const result = await couponApi.validate(couponCode.trim());
      setCouponResult(result);
      toast.success("Coupon applied!", { description: result.campaign_name });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid or expired coupon");
      setCouponResult(null);
    } finally {
      setCouponApplying(false);
    }
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponCode("");
  };

  const calcDiscount = (subtotal: number): number => {
    if (!couponResult) return 0;
    if (couponResult.free_shipping) return 0;
    if (couponResult.type === "fixed") return Math.min(couponResult.discount, subtotal);
    return Math.round((subtotal * couponResult.discount) / 100 * 100) / 100;
  };

  const nextStep = async () => {
    if (step === 1 && !validateShipping()) return;
    if (step === 3) {
      try {
        const orderItems = items.map((i) => ({
          product_id: i.productId,
          variant_id: i.variantId ?? undefined,
          quantity: i.quantity,
        }));
        const { order, payment_url } = await placeOrder.mutateAsync({
          items: orderItems,
          shipping_address: {
            name: form.fullName,
            address: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
            phone: form.phone,
            email: form.email,
          },
          payment_method: selectedPayment?.name ?? "cod",
          coupon_code: couponResult ? couponResult.code : undefined,
          discount: discount > 0 ? discount : undefined,
          shipping_cost: shippingCost,
          shipping_method: selectedShipping?.name,
          guest: isLoggedIn ? undefined : { name: form.fullName, phone: form.phone, email: form.email || undefined },
        });
        clearCart();
        if (payment_url) {
          window.location.href = payment_url;
          return;
        }
        setPlacedOrderId(order.invoice_no ?? String(order.id));
        setStep(4);
      } catch {
        toast.error("Failed to place order. Please try again.");
      }
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethodId) ?? null;
  const selectedPayment = paymentMethods.find((m) => m.id === paymentMethodId) ?? null;
  const shippingCost = couponResult?.free_shipping ? 0 : (selectedShipping?.price ?? 0);
  const discount = calcDiscount(totalPrice);
  const tax = (totalPrice - discount) * 0.08;
  const grandTotal = totalPrice - discount + shippingCost + tax;


  if (items.length === 0 && step < 4) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Stepper */}
        <div className="mb-10">
          <StepIndicator steps={steps} currentStep={step} />
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

                  {isLoggedIn && user && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Ship to</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => switchAddressMode("saved")}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            addressMode === "saved" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            addressMode === "saved" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-foreground">My Account Address</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {defaultAddress ? [defaultAddress.address_line1, defaultAddress.city].filter(Boolean).join(", ") : user.name}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            addressMode === "saved" ? "border-primary" : "border-muted-foreground/30"
                          }`}>
                            {addressMode === "saved" && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => switchAddressMode("new")}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            addressMode === "new" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            addressMode === "new" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-foreground">New Address</p>
                            <p className="text-[11px] text-muted-foreground">Enter a different address</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            addressMode === "new" ? "border-primary" : "border-muted-foreground/30"
                          }`}>
                            {addressMode === "new" && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                        </button>
                      </div>
                      {addressMode === "saved" && !defaultAddress && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Your account has no saved address yet. Please fill in the fields below.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Full Name" error={errors.fullName} required className="sm:col-span-2">
                      <Input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                    </FormField>

                    <FormField label="Email" error={errors.email} required={isLoggedIn}>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                    </FormField>

                    <FormField label="Phone" error={errors.phone} required>
                      <Input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 890"
                      />
                    </FormField>

                    <FormField label="Address" error={errors.address} required className="sm:col-span-2">
                      <Input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                      />
                    </FormField>

                    <FormField label="Order Note" helperText="Special delivery instructions..." className="sm:col-span-2">
                      <Textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Special delivery instructions..."
                      />
                    </FormField>
                  </div>

                  {/* Shipping Method Selection */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" /> Shipping Method
                    </h3>
                    <div className="space-y-3">
                      {methodsLoading ? (
                        <>
                          <Skeleton className="h-[72px] rounded-xl" />
                          <Skeleton className="h-[72px] rounded-xl" />
                          <Skeleton className="h-[72px] rounded-xl" />
                        </>
                      ) : shippingMethods.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No shipping options available.</p>
                      ) : (
                        shippingMethods.map((method) => (
                          <ShippingOption
                            key={method.id}
                            option={{
                              id: String(method.id),
                              label: method.name,
                              price: method.price,
                              days: method.estimated_days ?? "",
                              icon: SHIPPING_ICON_MAP[method.icon ?? ""] ?? Package,
                              description: method.description ?? "",
                            }}
                            selected={shippingMethodId === method.id}
                            onChange={(idStr) => setShippingMethodId(Number(idStr))}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shippingCost} discount={discount} tax={tax} grandTotal={grandTotal} couponResult={couponResult} couponCode={couponCode} onCouponCodeChange={setCouponCode} onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} couponApplying={couponApplying} />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={nextStep} className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                  Review Order <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-background rounded-2xl border border-border p-6 sm:p-8">
                  <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                  </h2>
                  <div className="space-y-3">
                    {paymentMethodsLoading ? (
                      <>
                        <Skeleton className="h-[72px] rounded-xl" />
                        <Skeleton className="h-[72px] rounded-xl" />
                        <Skeleton className="h-[72px] rounded-xl" />
                      </>
                    ) : paymentMethods.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No payment options available.</p>
                    ) : (
                      paymentMethods.map((method) => {
                        const Icon = PAYMENT_ICON_MAP[method.icon ?? ""] ?? CreditCard;
                        const isSelected = paymentMethodId === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethodId(method.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isSelected ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-semibold text-sm text-foreground">{method.name}</p>
                              {method.description && <p className="text-xs text-muted-foreground">{method.description}</p>}
                              {isSelected && method.gateway_type === "sslcommerz" && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> You'll be redirected to pay securely
                                </p>
                              )}
                              {isSelected && method.gateway_type === "portwallet" && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> You'll be redirected to PortWallet
                                </p>
                              )}
                              {isSelected && method.gateway_type === "stripe" && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> You'll be redirected to Stripe Checkout
                                </p>
                              )}
                              {isSelected && method.gateway_type === "paypal" && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> You'll be redirected to PayPal
                                </p>
                              )}
                              {isSelected && method.gateway_type === "bkash" && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> You'll be redirected to bKash
                                </p>
                              )}
                              {isSelected && method.gateway_type === "nagad" && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> You'll be redirected to Nagad
                                </p>
                              )}
                              {method.gateway_type === "cod" && method.cod_deposit_required && (
                                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {method.cod_deposit_amount
                                    ? `Shipping deposit of ${currencySymbol}${method.cod_deposit_amount} required before delivery`
                                    : "Shipping charge must be paid upfront via bKash/Nagad/Card"}
                                </p>
                              )}
                            </div>
                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-primary" : "border-muted-foreground/30"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shippingCost} discount={discount} tax={tax} grandTotal={grandTotal} couponResult={couponResult} couponCode={couponCode} onCouponCodeChange={setCouponCode} onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} couponApplying={couponApplying} />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Back to Shipping
                </button>
                <button onClick={nextStep} className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                  Review Order <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-5">
                  <div className="bg-background rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Delivery Address
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">{form.fullName}</p>
                      <p>{form.address}</p>
                      {(form.city || form.state || form.zip) && (
                        <p>{[form.city, form.state, form.zip].filter(Boolean).join(", ")}</p>
                      )}
                      <p>{form.phone}{form.email ? ` · ${form.email}` : ""}</p>
                      {form.note && <p className="mt-2 italic text-xs">Note: {form.note}</p>}
                    </div>
                  </div>

                  <div className="bg-background rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" /> Shipping Method
                    </h3>
                    {selectedShipping && (() => {
                      const Icon = SHIPPING_ICON_MAP[selectedShipping.icon ?? ""] ?? Package;
                      return (
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <span className="text-sm font-medium text-foreground">{selectedShipping.name}</span>
                            <p className="text-xs text-muted-foreground">{selectedShipping.estimated_days} · {formatCurrency(selectedShipping.price)}</p>
                          </div>
                        </div>
                      );
                    })()}</div>

                  <div className="bg-background rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment Method
                    </h3>
                    {selectedPayment && (() => {
                      const Icon = PAYMENT_ICON_MAP[selectedPayment.icon ?? ""] ?? CreditCard;
                      return (
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium text-foreground">{selectedPayment.name}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="bg-background rounded-2xl border border-border p-6">
                    <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-primary" /> Order Items ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                }}
                              />
                            ) : null}
                            <span className={`text-[10px] text-muted-foreground text-center leading-tight px-1 ${item.image ? "hidden" : ""}`}>No Image</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-display font-bold text-sm text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shippingCost} discount={discount} tax={tax} grandTotal={grandTotal} couponResult={couponResult} couponCode={couponCode} onCouponCodeChange={setCouponCode} onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} couponApplying={couponApplying} />
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">Your order information is secure. We'll send a confirmation to your email.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Edit Payment
                </button>
                <button onClick={nextStep} disabled={placeOrder.isPending} className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-70">
                  {placeOrder.isPending ? "Placing Order..." : <><span>Place Order</span><CheckCircle2 className="h-4 w-4" /></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
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
                  Thank you for your order. We'll send a confirmation to your email once it's on the way.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="bg-muted/30 rounded-xl p-5 mb-6 border border-border/50 text-left space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono font-bold text-primary">{placedOrderId ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium text-foreground">{selectedPayment?.name ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery To</span>
                    <span className="font-medium text-foreground">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-foreground">{selectedShipping?.name ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <span className="font-medium text-foreground">{selectedShipping?.estimated_days ?? "—"}</span>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => navigate("/")} className="flex-1 gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                    Continue Shopping
                  </button>
                  {!isLoggedIn && placedOrderId ? (
                    <button onClick={() => navigate(`/track-order?invoice=${encodeURIComponent(placedOrderId)}`)} className="flex-1 border border-border text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-colors">
                      Track Order
                    </button>
                  ) : (
                    <button onClick={() => navigate("/shop")} className="flex-1 border border-border text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-colors">
                      Browse More
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrderSummary({ items, totalPrice, shipping, discount, tax, grandTotal, couponResult, couponCode, onCouponCodeChange, onApplyCoupon, onRemoveCoupon, couponApplying }: {
  items: { id: string; name: string; quantity: number; price: number }[];
  totalPrice: number;
  shipping: number;
  discount: number;
  tax: number;
  grandTotal: number;
  couponResult: CouponResult | null;
  couponCode: string;
  onCouponCodeChange: (v: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  couponApplying: boolean;
}) {
  const { formatCurrency } = useCurrency();
  return (
    <div className="bg-background rounded-2xl border border-border p-4 sm:p-6 lg:sticky lg:top-36">
      <h3 className="font-display font-bold text-sm mb-4">Order Summary</h3>
      <div className="space-y-2 text-sm border-b border-border pb-4 mb-4">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{couponResult?.free_shipping ? <span className="text-green-600 font-medium">FREE</span> : formatCurrency(shipping)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount {couponResult && `(${couponResult.code})`}</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      </div>

      {/* Coupon input */}
      <div className="mb-4">
        {couponResult ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-xs font-medium">
              <Tag className="h-3.5 w-3.5" />
              <span>{couponResult.code} — {couponResult.campaign_name}</span>
            </div>
            <button onClick={onRemoveCoupon} className="text-green-600 hover:text-green-800 dark:hover:text-green-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 min-[420px]:flex-row">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onApplyCoupon(); } }}
              className="h-9 text-sm"
            />
            <button
              onClick={onApplyCoupon}
              disabled={couponApplying || !couponCode.trim()}
              className="shrink-0 px-3 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {couponApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between font-display font-bold text-lg">
        <span>Total</span>
        <span className="text-primary">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
}
