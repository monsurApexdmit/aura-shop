import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePlaceOrder } from "@/hooks/useOrders";
import { addressApi, type ApiAddress } from "@/services/addressApi";
import { couponApi, type CouponResult } from "@/services/couponApi";
import { useNavigate } from "react-router-dom";
import { getAttributionPayload } from "@/lib/attribution";
import { keepKeyAfterError, newIdempotencyKey, orderErrorMessage } from "@/lib/orderErrors";
import { trackInitiateCheckout, trackPurchase } from "@/lib/pixels";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, ClipboardCheck, CheckCircle2, ArrowLeft, ArrowRight, Truck, ShieldCheck, Banknote, Landmark, Globe, Wallet, QrCode, Smartphone, UserCheck, Info, Tag, X, Store, Package, Zap, Box } from "lucide-react";
import { useShippingMethods, usePickupPoints } from "@/hooks/useShippingMethods";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { z } from "zod";
import FormField from "@/components/forms/FormField";
import StepIndicator from "@/components/features/checkout/StepIndicator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ChoiceCard, ChoiceCardGroup } from "@/components/common/ChoiceCard";
import { SectionCard } from "@/components/common/SectionCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { InfoList, InfoRow } from "@/components/common/InfoList";
import { EmptyState } from "@/components/common/EmptyState";
import { WithTooltip } from "@/components/common/WithTooltip"
import { Trans, useTranslation } from "react-i18next";

const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "checkout:validation.nameRequired").max(100),
  email: z.string().trim().email("checkout:validation.invalidEmail").max(255).optional().or(z.literal("")),
  phone: z.string().trim().min(7, "checkout:validation.phoneRequired").max(20),
  address: z.string().trim().min(5, "checkout:validation.addressRequired").max(300),
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
  store:   Store,
};

const PAYMENT_ICON_MAP: Record<string, LucideIcon> = {
  banknote:      Banknote,
  landmark:      Landmark,
  "credit-card": CreditCard,
  wallet:        Wallet,
  "qr-code":     QrCode,
  smartphone:    Smartphone,
};

const STEPS = [
  { id: 1, labelKey: "checkout:steps.shipping", icon: MapPin },
  { id: 2, labelKey: "checkout:steps.payment", icon: CreditCard },
  { id: 3, labelKey: "checkout:steps.review", icon: ClipboardCheck },
  { id: 4, labelKey: "checkout:steps.complete", icon: CheckCircle2 },
];

/** Redirecting gateways and the brand name shown in "You'll be redirected to …" (not translated) */
const GATEWAY_NAMES: Record<string, string> = {
  portwallet: "PortWallet",
  stripe: "Stripe Checkout",
  paypal: "PayPal",
  bkash: "bKash",
  nagad: "Nagad",
};

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { formatCurrency, currencySymbol, settings } = useCurrency();
  const placeOrder = usePlaceOrder();
  const orderAttemptKey = useRef<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const steps = STEPS.map(({ labelKey, ...s }) => ({ ...s, label: t(labelKey) }));
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const { data: shippingMethods = [], isLoading: methodsLoading } = useShippingMethods();
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [pickupPointId, setPickupPointId] = useState<number | null>(null);
  const { data: paymentData, isLoading: paymentMethodsLoading } = usePaymentMethods();
  const paymentMethods = useMemo(() => paymentData?.methods ?? [], [paymentData]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | string | null>(null);
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
      } catch {
        /* corrupt saved state: start fresh */
      }
    }
  }, []);

  useEffect(() => {
    if (paymentMethods.length > 0 && (paymentMethodId === null || !paymentMethods.some((m) => m.id === paymentMethodId))) {
      const preferred = paymentMethods.find((m) => m.slug && m.slug === paymentData?.default);
      setPaymentMethodId((preferred ?? paymentMethods[0]).id);
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
    if (isPickup && !pickupPoint) {
      setErrors({ pickup: t("checkout:validation.choosePickup") });
      return false;
    }
    if (!selectedShipping) {
      setErrors({ delivery: t("checkout:validation.chooseDelivery") });
      return false;
    }
    const result = (isPickup ? shippingSchema.extend({ address: z.string().optional() }) : shippingSchema).safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = t(e.message); });
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
      toast.success(t("checkout:coupon.applied"), { description: result.campaign_name });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? t("checkout:coupon.invalid"));
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
      // Same key for retries of this attempt, so a timeout + retry can never create a second order
      orderAttemptKey.current ??= newIdempotencyKey();
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
            address: isPickup && pickupPoint ? `Pickup: ${pickupPoint.name}${pickupPoint.address ? `, ${pickupPoint.address}` : ""}` : form.address,
            city: isPickup && pickupPoint ? (pickupPoint.district ?? "") : form.city,
            state: isPickup ? undefined : form.state,
            zip: form.zip,
            phone: form.phone,
            email: form.email,
          },
          payment_method: selectedPayment?.slug ?? selectedPayment?.name ?? "cod",
          coupon_code: couponResult ? couponResult.code : undefined,
          discount: discount > 0 ? discount : undefined,
          // informational only: the server charges the chosen method's price
          shipping_cost: shippingCost,
          shipping_method: selectedShipping?.name,
          shipping_method_id: selectedShipping?.id,
          pickup_location_id: isPickup && pickupPoint ? pickupPoint.id : undefined,
          guest: isLoggedIn ? undefined : { name: form.fullName, phone: form.phone, email: form.email || undefined },
          attribution: getAttributionPayload(),
          idempotency_key: orderAttemptKey.current,
        });
        orderAttemptKey.current = null;
        trackPurchase({
          value: order.amount || grandTotal,
          currency: settings?.currency || "BDT",
          orderId: order.invoice_no,
          contentIds: items.map((i) => i.productId),
        });
        clearCart();
        if (payment_url) {
          window.location.href = payment_url;
          return;
        }
        setPlacedOrderId(order.invoice_no ?? String(order.id));
        setStep(4);
      } catch (err: unknown) {
        const response = (err as { response?: { status?: number; data?: { message?: string; errors?: unknown } } })?.response;
        const status = response?.status;
        // The order was refused (e.g. stock ran out): the next try is a new attempt with a new key
        if (!keepKeyAfterError(status)) orderAttemptKey.current = null;
        toast.error(orderErrorMessage(response?.data, t("checkout:review.placeFailed")));
      }
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  // Customer picks one of the store's delivery options (fixed charge each); pickup only if the store offers it
  const deliveryMethods = shippingMethods.filter((m) => m.type !== "pickup");
  const pickupMethods = shippingMethods.filter((m) => m.type === "pickup");
  const shippingOptions = [...deliveryMethods, ...pickupMethods];
  const selectedShipping = shippingOptions.find((m) => m.id === shippingMethodId) ?? null;
  const isPickup = selectedShipping?.type === "pickup";
  useEffect(() => {
    // preselect the first delivery option (or keep a still-valid choice)
    if (shippingOptions.length > 0 && !selectedShipping) setShippingMethodId(shippingOptions[0].id);
  }, [shippingMethods]);
  const { data: pickupPoints = [] } = usePickupPoints(isPickup);
  const pickupPoint = pickupPoints.find((p) => p.id === pickupPointId) ?? null;
  const selectedPayment = paymentMethods.find((m) => m.id === paymentMethodId) ?? null;
  const shippingCost = couponResult?.free_shipping || isPickup ? 0 : (selectedShipping?.price ?? 0);
  const shippingLabel = selectedShipping?.name ?? "—";
  const shippingTime = selectedShipping?.estimated_days ?? null;
  const discount = calcDiscount(totalPrice);
  // No tax on storefront orders (the server doesn't charge any either).
  const grandTotal = totalPrice - discount + shippingCost;

  // Ad pixels (no-op unless the store configured one): one InitiateCheckout per visit with a non-empty cart
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current || items.length === 0) return;
    checkoutTracked.current = true;
    trackInitiateCheckout({ value: totalPrice, currency: settings?.currency || "BDT", numItems: items.reduce((n, i) => n + i.quantity, 0) });
  }, [items, totalPrice, settings?.currency]);


  if (items.length === 0 && step < 4) {
    return (
      <div className="min-h-screen bg-background pt-40 px-4">
        <EmptyState
          icon={Truck}
          title={t("checkout:empty.title")}
          action={
            <Button onClick={() => navigate("/shop")}>
              {t("checkout:empty.goShopping")}
            </Button>
          }
        />
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
                <Card className="lg:col-span-3 p-6 sm:p-8">
                  <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> {t("checkout:shipping.title")}
                  </h2>

                  {isLoggedIn && user && (
                    <div className="mb-6">
                      <SectionTitle as="p" className="mb-3">{t("checkout:shipping.shipTo")}</SectionTitle>
                      <ChoiceCardGroup
                        value={addressMode}
                        onValueChange={(v) => switchAddressMode(v as "saved" | "new")}
                        className="grid-cols-1 sm:grid-cols-2 gap-3"
                        aria-label={t("checkout:shipping.shipTo")}
                      >
                        <ChoiceCard
                          value="saved"
                          icon={<UserCheck />}
                          title={t("checkout:shipping.accountAddress")}
                          description={<span className="block truncate">{defaultAddress ? [defaultAddress.address_line1, defaultAddress.city].filter(Boolean).join(", ") : user.name}</span>}
                          className="min-w-0"
                        />
                        <ChoiceCard
                          value="new"
                          icon={<MapPin />}
                          title={t("checkout:shipping.newAddress")}
                          description={t("checkout:shipping.newAddressHint")}
                        />
                      </ChoiceCardGroup>
                      {addressMode === "saved" && !defaultAddress && (
                        <Alert className="mt-3">
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {t("checkout:shipping.noSavedAddress")}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label={t("common:form.fullName")} error={errors.fullName} required className="sm:col-span-2">
                      <Input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder={t("checkout:shipping.namePlaceholder")}
                      />
                    </FormField>

                    <FormField label={t("common:form.email")} error={errors.email} required={isLoggedIn}>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                    </FormField>

                    <FormField label={t("common:form.phone")} error={errors.phone} required>
                      <Input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder={t("checkout:shipping.phonePlaceholder")}
                      />
                    </FormField>

                    {!isPickup && (
                      <>
                        <FormField label={t("common:form.address")} error={errors.address} required className="sm:col-span-2">
                          <Input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder={t("checkout:shipping.addressPlaceholder")}
                          />
                        </FormField>
                      </>
                    )}

                    <FormField label={t("checkout:shipping.orderNote")} helperText={t("checkout:shipping.noteHint")} className="sm:col-span-2">
                      <Textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={3}
                        placeholder={t("checkout:shipping.noteHint")}
                      />
                    </FormField>
                  </div>

                  {/* Delivery option: one of the store's active shipping methods */}
                  <Separator className="mt-6" />
                  <div className="pt-6">
                    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" /> {t("checkout:labels.delivery")}
                    </h3>
                    {methodsLoading ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Skeleton className="h-[84px]" />
                        <Skeleton className="h-[84px]" />
                      </div>
                    ) : shippingOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">{t("checkout:shipping.noDeliveryOptions")}</p>
                    ) : (
                      <ChoiceCardGroup
                        value={shippingMethodId != null ? String(shippingMethodId) : undefined}
                        onValueChange={(v) => { setShippingMethodId(Number(v)); setErrors({}); }}
                        className="grid-cols-1 sm:grid-cols-2 gap-3"
                        aria-label={t("checkout:labels.deliveryOption")}
                      >
                        {shippingOptions.map((m) => {
                          const pickup = m.type === "pickup";
                          const Icon = SHIPPING_ICON_MAP[m.icon ?? ""] ?? (pickup ? Store : Truck);
                          return (
                            <ChoiceCard
                              key={m.id}
                              value={String(m.id)}
                              icon={<Icon />}
                              title={
                                <span className="flex flex-1 items-center justify-between gap-3">
                                  <span>{m.name}</span>
                                  <span className="font-semibold tabular-nums">{pickup || !m.price ? t("common:money.free") : formatCurrency(m.price)}</span>
                                </span>
                              }
                              description={[pickup ? (m.description || t("checkout:shipping.pickupDefault")) : m.description, m.estimated_days].filter(Boolean).join(" · ") || undefined}
                              className="[&>span:first-child]:w-full"
                            />
                          );
                        })}
                      </ChoiceCardGroup>
                    )}
                    {errors.delivery && <p className="text-xs text-destructive mt-2">{errors.delivery}</p>}
                    {isPickup && (
                      <div className="mt-4">
                        <SectionTitle as="p" className="mb-3">{t("checkout:shipping.pickupPoint")}</SectionTitle>
                        {pickupPoints.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t("checkout:shipping.noPickupPoints")}</p>
                        ) : (
                          <ChoiceCardGroup
                            value={pickupPointId != null ? String(pickupPointId) : undefined}
                            onValueChange={(v) => setPickupPointId(Number(v))}
                            aria-label={t("checkout:shipping.pickupPoint")}
                          >
                            {pickupPoints.map((p) => (
                              <ChoiceCard
                                key={p.id}
                                value={String(p.id)}
                                title={p.name}
                                description={`${[p.address, p.district].filter(Boolean).join(", ")}${p.phone ? ` · ${p.phone}` : ""}`}
                              />
                            ))}
                          </ChoiceCardGroup>
                        )}
                        {errors.pickup && <p className="text-xs text-destructive mt-2">{errors.pickup}</p>}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shippingCost} discount={discount} grandTotal={grandTotal} couponResult={couponResult} couponCode={couponCode} onCouponCodeChange={setCouponCode} onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} couponApplying={couponApplying} />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4" /> {t("common:actions.back")}
                </Button>
                <Button onClick={nextStep}>
                  {t("checkout:shipping.reviewOrder")} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="grid lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3 p-6 sm:p-8">
                  <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> {t("checkout:payment.title")}
                  </h2>
                  <div className="space-y-3">
                    {paymentMethodsLoading ? (
                      <>
                        <Skeleton className="h-[72px]" />
                        <Skeleton className="h-[72px]" />
                        <Skeleton className="h-[72px]" />
                      </>
                    ) : paymentMethods.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">{t("checkout:payment.none")}</p>
                    ) : (
                      <ChoiceCardGroup
                        value={paymentMethodId != null ? String(paymentMethodId) : undefined}
                        onValueChange={(v) => {
                          const m = paymentMethods.find((pm) => String(pm.id) === v);
                          if (m) setPaymentMethodId(m.id);
                        }}
                        className="gap-3"
                        aria-label={t("checkout:labels.paymentMethod")}
                      >
                      {paymentMethods.map((method) => {
                        const Icon = PAYMENT_ICON_MAP[method.icon ?? ""] ?? CreditCard;
                        const isSelected = paymentMethodId === method.id;
                        return (
                          <ChoiceCard
                            key={method.id}
                            value={String(method.id)}
                            icon={<Icon />}
                            title={method.name}
                            description={method.description || undefined}
                          >
                              {isSelected && method.gateway_type === "sslcommerz" && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> {t("checkout:labels.redirectSecure")}
                                </p>
                              )}
                              {isSelected && GATEWAY_NAMES[method.gateway_type ?? ""] && (
                                <p className="text-[11px] text-primary mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" /> {t("checkout:payment.redirectTo", { gateway: GATEWAY_NAMES[method.gateway_type ?? ""] })}
                                </p>
                              )}
                              {isSelected && method.gateway_type === "manual" && (method.account || method.bank_name) && (
                                <Card className="mt-2 w-full p-3 text-xs font-normal space-y-0.5">
                                  <p className="text-muted-foreground">{t("checkout:payment.sendTo")}</p>
                                  {method.bank_name && <p><Trans i18nKey="checkout:payment.bank" values={{ name: method.bank_name }} components={{ b: <span className="font-medium" /> }} /></p>}
                                  {method.account_name && <p><Trans i18nKey="checkout:payment.accountName" values={{ name: method.account_name }} components={{ b: <span className="font-medium" /> }} /></p>}
                                  {method.account && <p><Trans i18nKey="checkout:payment.accountNumber" values={{ number: method.account }} components={{ b: <span className="font-medium" /> }} /></p>}
                                </Card>
                              )}
                              {method.gateway_type === "cod" && method.cod_deposit_required && (
                                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {method.cod_deposit_amount
                                    ? t("checkout:payment.codDeposit", { amount: `${currencySymbol}${method.cod_deposit_amount}` })
                                    : t("checkout:payment.codUpfront")}
                                </p>
                              )}
                          </ChoiceCard>
                        );
                      })}
                      </ChoiceCardGroup>
                    )}
                  </div>
                </Card>
                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shippingCost} discount={discount} grandTotal={grandTotal} couponResult={couponResult} couponCode={couponCode} onCouponCodeChange={setCouponCode} onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} couponApplying={couponApplying} />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> {t("checkout:payment.backToShipping")}
                </Button>
                <Button onClick={nextStep}>
                  {t("checkout:shipping.reviewOrder")} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-5">
                  <SectionCard title={<span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {isPickup ? t("checkout:review.pickupPoint") : t("checkout:review.deliveryAddress")}</span>}>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">{form.fullName}</p>
                      <p>{isPickup && pickupPoint ? `${pickupPoint.name}${pickupPoint.address ? `, ${pickupPoint.address}` : ""}${pickupPoint.district ? `, ${pickupPoint.district}` : ""}` : form.address}</p>
                      {!isPickup && (form.city || form.state || form.zip) && (
                        <p>{[form.city, form.state, form.zip].filter(Boolean).join(", ")}</p>
                      )}
                      <p>{form.phone}{form.email ? ` · ${form.email}` : ""}</p>
                      {form.note && <p className="mt-2 italic text-xs">{t("checkout:review.note", { note: form.note })}</p>}
                    </div>
                  </SectionCard>

                  <SectionCard title={<span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {t("checkout:labels.delivery")}</span>}>
                    <div className="flex items-center gap-3">
                      {isPickup ? <Store className="h-5 w-5 text-primary" /> : <Truck className="h-5 w-5 text-primary" />}
                      <div>
                        <span className="text-sm font-medium text-foreground">{shippingLabel}</span>
                        <p className="text-xs text-muted-foreground">{[shippingTime, shippingCost > 0 ? formatCurrency(shippingCost) : t("common:money.free")].filter(Boolean).join(" · ")}</p>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title={<span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> {t("checkout:payment.title")}</span>}>
                    {selectedPayment && (() => {
                      const Icon = PAYMENT_ICON_MAP[selectedPayment.icon ?? ""] ?? CreditCard;
                      return (
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium text-foreground">{selectedPayment.name}</span>
                        </div>
                      );
                    })()}
                  </SectionCard>

                  <SectionCard title={<span className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-primary" /> {t("checkout:review.items", { count: items.length })}</span>}>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <Item key={item.id} variant="outline" size="sm">
                          <ItemMedia variant="image" className="size-14 bg-muted">

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
                            <span className={cn("text-[10px] text-muted-foreground text-center leading-tight px-1", item.image ? "hidden" : "")}>{t("checkout:labels.noImage")}</span>
                          </ItemMedia>
                          <ItemContent className="min-w-0">
                            <ItemTitle className="w-full truncate">{item.name}</ItemTitle>
                            <ItemDescription className="text-xs">{t("checkout:review.qty", { qty: item.quantity })}</ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <p className="font-semibold text-sm text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                          </ItemActions>
                        </Item>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                <div className="lg:col-span-2">
                  <OrderSummary items={items} totalPrice={totalPrice} shipping={shippingCost} discount={discount} grandTotal={grandTotal} couponResult={couponResult} couponCode={couponCode} onCouponCodeChange={setCouponCode} onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} couponApplying={couponApplying} />
                  <Alert className="mt-4">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription className="text-xs text-muted-foreground">{t("checkout:review.secure")}</AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" /> {t("checkout:review.editPayment")}
                </Button>
                <Button onClick={nextStep} disabled={placeOrder.isPending}>
                  {placeOrder.isPending ? t("checkout:review.placing") : <><span>{t("checkout:review.placeOrder")}</span><CheckCircle2 className="h-4 w-4" /></>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Card className="max-w-lg mx-auto text-center p-8 sm:p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, delay: 0.2 }}
                  className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-semibold text-2xl text-foreground mb-2">
                  {t("checkout:complete.title")}
                </motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-sm mb-6">
                  {t("checkout:complete.text")}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-6">
                  <Card className="p-5 text-left">
                    <InfoList>
                      <InfoRow label={t("checkout:complete.orderId")} value={<span className="font-mono font-bold text-primary">{placedOrderId ?? "—"}</span>} />
                      <InfoRow label={t("checkout:labels.payment")} value={selectedPayment?.name ?? "—"} />
                      <InfoRow label={t("checkout:complete.deliveryTo")} value={form.fullName} />
                      <InfoRow label={t("common:money.shipping")} value={shippingLabel} />
                      <InfoRow label={t("checkout:complete.estimatedDelivery")} value={shippingTime ?? "—"} />
                    </InfoList>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => navigate("/")} className="flex-1">
                    {t("common:actions.continueShopping")}
                  </Button>
                  {!isLoggedIn && placedOrderId ? (
                    <Button variant="outline" onClick={() => navigate(`/track-order?invoice=${encodeURIComponent(placedOrderId)}`)} className="flex-1">
                      {t("common:nav.trackOrder")}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => navigate("/shop")} className="flex-1">
                      {t("checkout:complete.browseMore")}
                    </Button>
                  )}
                </motion.div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrderSummary({ items, totalPrice, shipping, discount, grandTotal, couponResult, couponCode, onCouponCodeChange, onApplyCoupon, onRemoveCoupon, couponApplying }: {
  items: { id: string; name: string; quantity: number; price: number }[];
  totalPrice: number;
  shipping: number;
  discount: number;
  grandTotal: number;
  couponResult: CouponResult | null;
  couponCode: string;
  onCouponCodeChange: (v: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  couponApplying: boolean;
}) {
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  return (
    <Card className="p-4 sm:p-6 lg:sticky lg:top-36">
      <h3 className="font-semibold text-sm mb-4">{t("checkout:summary.title")}</h3>
      <InfoList className="pb-4">
        <InfoRow label={t("checkout:summary.subtotal", { count: items.reduce((s, i) => s + i.quantity, 0) })} value={formatCurrency(totalPrice)} />
        <InfoRow label={t("common:money.shipping")} value={couponResult?.free_shipping ? <span className="text-green-600 uppercase">{t("common:money.free")}</span> : formatCurrency(shipping)} />
        {discount > 0 && (
          <InfoRow
            label={<span className="text-green-600 font-medium">{couponResult ? t("checkout:summary.discountCode", { code: couponResult.code }) : t("common:money.discount")}</span>}
            value={<span className="text-green-600">-{formatCurrency(discount)}</span>}
          />
        )}
      </InfoList>
      <Separator className="mb-4" />

      {/* Coupon input */}
      <div className="mb-4">
        {couponResult ? (
          <Item variant="outline" size="sm" className="py-1.5">
            <ItemMedia>
              <Tag className="h-3.5 w-3.5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-xs">{couponResult.code} — {couponResult.campaign_name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <WithTooltip content={t("checkout:coupon.remove")}><Button variant="ghost" size="icon" onClick={onRemoveCoupon} aria-label={t("checkout:coupon.remove")}>
                <X className="h-3.5 w-3.5" />
              </Button></WithTooltip>
            </ItemActions>
          </Item>
        ) : (
          <div className="flex flex-col gap-2 min-[420px]:flex-row">
            <Input
              placeholder={t("checkout:coupon.placeholder")}
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onApplyCoupon(); } }}
            />
            <Button
              size="sm"
              onClick={onApplyCoupon}
              disabled={couponApplying || !couponCode.trim()}
              className="shrink-0"
            >
              {couponApplying ? <Spinner /> : t("common:actions.apply")}
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between font-semibold text-lg">
        <span>{t("common:money.total")}</span>
        <span className="text-primary">{formatCurrency(grandTotal)}</span>
      </div>
    </Card>
  );
}
