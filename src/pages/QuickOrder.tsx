import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Banknote, CheckCircle2, Minus, Package, Phone, Plus, ShoppingBag, Smartphone, Truck } from "lucide-react";
import { useQuickOrder, usePlaceQuickOrder } from "@/hooks/useQuickOrder";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { QuickOrderPaymentMethod, QuickOrderResult } from "@/services/quickOrderApi";
import { getAttributionPayload } from "@/lib/attribution";
import { keepKeyAfterError, newIdempotencyKey, shortageText, stockShortages } from "@/lib/orderErrors";
import { isValidBdPhone, normalizeBdPhone, whatsAppLink } from "@/lib/bdPhone";
import { trackInitiateCheckout, trackPurchase, trackViewContent } from "@/lib/pixels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ChoiceCard, ChoiceCardGroup } from "@/components/common/ChoiceCard";
import { FormField } from "@/components/common/FormField";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { EmptyState } from "@/components/common/EmptyState";
import { SlideDots } from "@/components/common/SlideDots";
import { WithTooltip } from "@/components/common/WithTooltip";
import { Trans, useTranslation } from "react-i18next";

type FieldKey = "name" | "phone" | "address" | "district" | "area" | "delivery" | "payment" | "transactionId" | "note" | "product";

/** Server (422) error keys → form fields; anything unknown goes to the general message. */
const SERVER_FIELD_MAP: Record<string, FieldKey> = {
  name: "name",
  customername: "name",
  phone: "phone",
  address: "address",
  district: "district",
  area: "area",
  shippingmethodid: "delivery",
  paymentmethod: "payment",
  transactionid: "transactionId",
  note: "note",
  quantity: "product",
  variantid: "product",
  productid: "product",
};

function mapServerErrors(errors: unknown): { fields: Partial<Record<FieldKey, string>>; rest: string[] } {
  const fields: Partial<Record<FieldKey, string>> = {};
  const rest: string[] = [];
  if (!errors || typeof errors !== "object") return { fields, rest };
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const msg = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
    if (!msg) continue;
    const norm = key.split(".")[0].replace(/[_-]/g, "").toLowerCase();
    const field = SERVER_FIELD_MAP[norm];
    if (field && !fields[field]) fields[field] = msg;
    else if (!field) rest.push(msg);
  }
  return { fields, rest };
}

/** Used when the store returns no payment methods; `name` is replaced by the translated label at render */
const COD_FALLBACK: QuickOrderPaymentMethod = {
  slug: "cod", name: "Cash on delivery", type: "cod", account: null, accountName: null, bankName: null, requiresTransactionId: false,
};

const MAX_QTY = 50; // server limit


export default function QuickOrder() {
  const { slug = "" } = useParams<{ slug: string }>();
  return <QuickOrderForm slug={slug} />;
}

/**
 * One-page order form for a product (the /order/:slug page). `embedded` drops the photo column and
 * turns the fixed confirm bar into an inline summary, for pages that show the product themselves
 * (the Single Product template's landing page).
 */
export function QuickOrderForm({ slug, embedded = false }: { slug: string; embedded?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const stockHint = (stock: number) => (stock <= 0 ? t("common:product.outOfStock") : stock <= 5 ? t("checkout:quick.stockLeft", { count: stock }) : null);
  const { formatCurrency, settings, storePhone, onlineStore, storeName } = useCurrency();
  const { data, isLoading, isError, error } = useQuickOrder(slug || null);
  const placeOrder = usePlaceQuickOrder();

  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "", district: "", area: "", transactionId: "", note: "", website: "" });
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [paymentSlug, setPaymentSlug] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [result, setResult] = useState<QuickOrderResult | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [slide, setSlide] = useState(0);
  const checkoutTracked = useRef(false);
  const orderAttemptKey = useRef<string | null>(null);

  const product = data?.product;
  const variants = useMemo(() => product?.variants ?? [], [product]);
  const deliveryOptions = useMemo(() => data?.deliveryOptions ?? [], [data]);
  const paymentMethods = useMemo(() => (data?.paymentMethods.length ? data.paymentMethods : [{ ...COD_FALLBACK, name: t("checkout:quick.codFallback") }]), [data, t]);
  const currency = data?.store.currency || settings?.currency || "BDT";

  // Defaults: first in-stock variant, first delivery option, COD
  useEffect(() => {
    if (!variants.length) { setVariantId(null); return; }
    setVariantId((cur) => (cur && variants.some((v) => v.id === cur) ? cur : (variants.find((v) => v.stock > 0) ?? variants[0]).id));
  }, [variants]);
  useEffect(() => {
    if (deliveryOptions.length && !deliveryOptions.some((d) => d.id === shippingMethodId)) setShippingMethodId(deliveryOptions[0].id);
  }, [deliveryOptions, shippingMethodId]);
  useEffect(() => {
    if (paymentMethods.some((m) => m.slug === paymentSlug)) return;
    const codMethod = paymentMethods.find((m) => m.type === "cod");
    const preferred = paymentMethods.find((m) => m.slug === data?.defaultPaymentMethod);
    setPaymentSlug((codMethod ?? preferred ?? paymentMethods[0]).slug);
  }, [paymentMethods, paymentSlug, data?.defaultPaymentMethod]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSlide(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const selectedVariant = variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = selectedVariant?.currentPrice ?? product?.currentPrice ?? 0;
  const originalPrice = selectedVariant?.price ?? product?.price ?? 0;
  const stock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;
  const outOfStock = !!product && stock <= 0;
  const selectedDelivery = deliveryOptions.find((d) => d.id === shippingMethodId) ?? null;
  const selectedPayment = paymentMethods.find((m) => m.slug === paymentSlug) ?? null;
  const needsTxn = !!selectedPayment && selectedPayment.type !== "cod" && selectedPayment.requiresTransactionId;
  const subtotal = unitPrice * quantity;
  const deliveryCharge = selectedDelivery?.price ?? 0;
  const cod = data?.cod;
  // COD is refused server-side at/over the limit (0 = no limit)
  const codBlocked = !!cod && cod.limit > 0 && subtotal >= cod.limit;
  const codFee = selectedPayment?.type === "cod" && cod ? cod.fee : 0;
  const total = subtotal + deliveryCharge + codFee;
  const maxQty = stock > 0 ? Math.min(stock, MAX_QTY) : MAX_QTY;

  useEffect(() => {
    if (quantity > maxQty) setQuantity(maxQty);
  }, [maxQty, quantity]);

  // Over the COD limit: move off COD to the first other method (if the store has one)
  useEffect(() => {
    if (!codBlocked || selectedPayment?.type !== "cod") return;
    const other = paymentMethods.find((m) => m.type !== "cod");
    if (other) setPaymentSlug(other.slug);
  }, [codBlocked, selectedPayment?.type, paymentMethods]);

  // once per product (not again when settings/currency arrive)
  useEffect(() => {
    if (product) trackViewContent({ id: product.id, name: product.name, value: product.currentPrice, currency });
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const contactPhone = data?.store.phone || storePhone || "";
  const contactWhatsApp = data?.store.whatsapp || onlineStore?.whatsappNumber || onlineStore?.social?.whatsapp || "";
  const shopName = data?.store.name || storeName;

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onFormFocus = () => {
    if (checkoutTracked.current || !product) return;
    checkoutTracked.current = true;
    trackInitiateCheckout({ value: total, currency, numItems: quantity });
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (form.name.trim().length < 2) next.name = t("checkout:quick.validation.name");
    if (!form.phone.trim()) next.phone = t("checkout:quick.validation.phone");
    else if (!isValidBdPhone(form.phone)) next.phone = t("checkout:quick.validation.phoneInvalid");
    if (form.address.trim().length < 5) next.address = t("checkout:quick.validation.address");
    if (deliveryOptions.length && !selectedDelivery) next.delivery = t("checkout:validation.chooseDelivery");
    if (!selectedPayment) next.payment = t("checkout:quick.validation.payment");
    else if (selectedPayment.type === "cod" && codBlocked && cod) next.payment = t("checkout:quick.validation.codLimit", { amount: formatCurrency(cod.limit) });
    if (needsTxn && form.transactionId.trim().length < 4) next.transactionId = t("checkout:quick.validation.transactionId");
    if (outOfStock) next.product = t("checkout:quick.validation.outOfStock");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!product || placeOrder.isPending) return;
    if (!validate()) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-invalid=true] input, [data-invalid=true] textarea, [data-invalid=true] [role=radio]")?.focus());
      return;
    }
    orderAttemptKey.current ??= newIdempotencyKey();
    try {
      const res = await placeOrder.mutateAsync({
        idempotencyKey: orderAttemptKey.current,
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        quantity,
        name: form.name.trim(),
        phone: normalizeBdPhone(form.phone) ?? form.phone.trim(),
        address: form.address.trim(),
        district: form.district.trim() || undefined,
        area: form.area.trim() || undefined,
        shippingMethodId: selectedDelivery?.id ?? 0,
        paymentMethod: selectedPayment?.slug ?? "cod",
        transactionId: needsTxn ? form.transactionId.trim() : undefined,
        note: form.note.trim() || undefined,
        website: form.website,
        attribution: getAttributionPayload(),
      });
      orderAttemptKey.current = null;
      trackPurchase({ value: res.total || total, currency, orderId: res.invoiceNo, contentIds: [product.id] });
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const resp = (err as { response?: { status?: number; data?: { message?: string; errors?: unknown } } })?.response;
      if (!keepKeyAfterError(resp?.status)) orderAttemptKey.current = null;
      const shortages = stockShortages(resp?.data?.errors);
      if (shortages.length) {
        // Stock ran out while ordering: say how many are left next to the quantity picker
        setErrors((cur) => ({ ...cur, product: shortageText(shortages[0]) }));
        setGeneralError(null);
      } else if (resp?.status === 422) {
        const { fields, rest } = mapServerErrors(resp.data?.errors);
        setErrors((cur) => ({ ...cur, ...fields }));
        setGeneralError(rest[0] ?? (Object.keys(fields).length ? null : resp.data?.message ?? t("checkout:quick.errors.checkDetails")));
      } else if (resp?.status === 429) {
        setGeneralError(resp.data?.message ?? t("checkout:quick.errors.tooMany"));
      } else {
        setGeneralError(resp?.data?.message ?? t("checkout:quick.errors.placeFailed"));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    const notFound = (error as { response?: { status?: number } } | null)?.response?.status === 404;
    return (
      <div className="container max-w-xl py-16">
        <EmptyState
          icon={Package}
          title={notFound ? t("checkout:quick.notAvailable") : t("checkout:quick.loadFailed")}
          description={notFound ? t("checkout:quick.notAvailableText") : t("checkout:quick.loadFailedText")}
          action={<Button onClick={() => navigate("/shop")}>{t("common:actions.continueShopping")}</Button>}
        />
      </div>
    );
  }

  if (result) {
    const waText = shopName
      ? t("checkout:quick.done.waMessage", { shop: shopName, invoice: result.invoiceNo })
      : t("checkout:quick.done.waMessageNoShop", { invoice: result.invoiceNo });
    const waHref = whatsAppLink(contactWhatsApp, waText);
    const trackHref = result.trackingUrl
      ? result.trackingUrl
      : `/track-order?invoice=${encodeURIComponent(result.invoiceNo)}`;
    const trackInternal = trackHref.startsWith("/");
    return (
      <div className="container max-w-md py-10">
        <Card className="flex flex-col items-center gap-4 p-6 text-center">
          <CheckCircle2 className="size-14 text-primary" aria-hidden="true" />
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold text-foreground">{t("checkout:quick.done.title")}</h1>
            <p className="text-muted-foreground">{t("checkout:quick.done.text")}</p>
          </div>
          <dl className="grid w-full grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4 text-left text-sm">
            <dt className="text-muted-foreground">{t("checkout:quick.done.orderNumber")}</dt>
            <dd className="text-right font-mono font-semibold text-foreground">{result.invoiceNo || "—"}</dd>
            <dt className="text-muted-foreground">{t("common:money.total")}</dt>
            <dd className="text-right font-semibold text-foreground">{formatCurrency(result.total || total)}</dd>
            {selectedPayment && (
              <>
                <dt className="text-muted-foreground">{t("checkout:labels.payment")}</dt>
                <dd className="text-right text-foreground">{selectedPayment.name}</dd>
              </>
            )}
          </dl>
          <div className="grid w-full gap-2 sm:grid-cols-2">
            {waHref && (
              <Button asChild variant="outline" className="gap-2">
                <a href={waHref} target="_blank" rel="noopener noreferrer"><Smartphone className="size-4" /> {t("checkout:quick.done.whatsapp")}</a>
              </Button>
            )}
            {contactPhone && (
              <Button asChild variant="outline" className="gap-2">
                <a href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}><Phone className="size-4" /> {t("checkout:quick.done.call")}</a>
              </Button>
            )}
          </div>
          <div className="grid w-full gap-2">
            <Button asChild size="lg"><Link to="/shop">{t("common:actions.continueShopping")}</Link></Button>
            {result.invoiceNo && (
              <Button asChild variant="ghost">
                {trackInternal ? <Link to={trackHref}>{t("checkout:quick.done.track")}</Link> : <a href={trackHref}>{t("checkout:quick.done.track")}</a>}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const images = product.images.length ? product.images : ["/placeholder.svg"];
  const hasDiscount = originalPrice > unitPrice;

  return (
    <form noValidate onSubmit={submit} onFocusCapture={onFormFocus} className={embedded ? "w-full" : "container max-w-5xl pb-44 pt-4 md:pt-8"}>
      <div className={embedded ? "grid gap-6" : "grid gap-6 md:grid-cols-2 md:gap-10"}>
        {/* Images */}
        <div className={cn("space-y-2 md:sticky md:top-24 md:self-start", embedded && "hidden")}>
          <Carousel setApi={setCarouselApi} opts={{ loop: images.length > 1 }} className="overflow-hidden rounded-2xl border bg-muted/30">
            <CarouselContent className="ml-0">
              {images.map((src, i) => (
                <CarouselItem key={`${src}-${i}`} className="pl-0">
                  <img
                    src={src}
                    alt={i === 0 ? product.name : t("checkout:quick.photoAlt", { name: product.name, n: i + 1 })}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="aspect-square w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {images.length > 1 && (
            <SlideDots count={images.length} current={slide} onSelect={(i) => carouselApi?.scrollTo(i)} label={t("checkout:quick.showPhoto")} className="justify-center" />
          )}
        </div>

        <div className="space-y-6">
          {/* Product (the embedding page already shows it) */}
          <div className={cn("space-y-2", embedded && "hidden")}>
            <h1 className="font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">{product.name}</h1>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-2xl font-bold text-foreground">{formatCurrency(unitPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
                  <Badge variant="secondary">{t("common:product.off", { value: `${Math.round(((originalPrice - unitPrice) / originalPrice) * 100)}%` })}</Badge>
                </>
              )}
            </div>
            {product.shortDescription && <p className="line-clamp-3 text-sm text-muted-foreground">{product.shortDescription}</p>}
          </div>

          {variants.length > 0 && (
            <FormField label={t("checkout:quick.chooseOption")} error={errors.product}>
              <SegmentedControl
                aria-label={t("checkout:quick.chooseOption")}
                size="default"
                value={variantId != null ? String(variantId) : ""}
                onValueChange={(v) => { setVariantId(Number(v)); setErrors((e) => ({ ...e, product: undefined })); }}
                options={variants.map((v) => ({
                  value: String(v.id),
                  disabled: v.stock <= 0,
                  "aria-label": v.stock <= 0 ? t("checkout:quick.variantOutOfStock", { name: v.name }) : v.name,
                  label: (
                    <span className="flex flex-col items-center leading-tight">
                      <span className={cn(v.stock <= 0 && "line-through")}>{v.name}</span>
                      {stockHint(v.stock) && <span className="text-[10px] font-normal text-muted-foreground">{stockHint(v.stock)}</span>}
                    </span>
                  ),
                }))}
                className="w-full"
              />
            </FormField>
          )}

          <FormField label={t("common:product.quantity")} error={variants.length ? undefined : errors.product}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border p-1">
                <WithTooltip content={t("common:actions.decrease")}>
                  <Button type="button" variant="ghost" size="icon" aria-label={t("common:actions.decrease")} disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    <Minus />
                  </Button>
                </WithTooltip>
                <span className="w-10 text-center text-lg font-semibold tabular-nums" aria-live="polite">{quantity}</span>
                <WithTooltip content={t("common:actions.increase")}>
                  <Button type="button" variant="ghost" size="icon" aria-label={t("common:actions.increase")} disabled={outOfStock || quantity >= maxQty} onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}>
                    <Plus />
                  </Button>
                </WithTooltip>
              </div>
              <span className={cn("text-sm", outOfStock ? "font-medium text-destructive" : "text-muted-foreground")}>
                {outOfStock ? t("common:product.outOfStock") : stock <= 5 ? t("common:product.lowStock", { count: stock }) : t("common:product.inStock")}
              </span>
            </div>
          </FormField>

          {/* Customer */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t("checkout:quick.yourDetails")}</h2>
            <FormField label={t("checkout:quick.yourName")} htmlFor="qo-name" error={errors.name} required>
              <Input id="qo-name" autoComplete="name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder={t("common:form.fullName")} aria-invalid={!!errors.name} />
            </FormField>
            <FormField label={t("checkout:quick.mobile")} htmlFor="qo-phone" error={errors.phone} description={errors.phone ? undefined : t("checkout:quick.phoneHint")} required>
              <Input id="qo-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="01XXXXXXXXX" aria-invalid={!!errors.phone} />
            </FormField>
            <FormField label={t("checkout:quick.fullAddress")} htmlFor="qo-address" error={errors.address} required>
              <Textarea id="qo-address" autoComplete="street-address" rows={2} value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder={t("checkout:quick.addressPlaceholder")} aria-invalid={!!errors.address} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("checkout:quick.district")} htmlFor="qo-district" error={errors.district}>
                <Input id="qo-district" autoComplete="address-level2" value={form.district} onChange={(e) => setField("district", e.target.value)} placeholder={t("common:status.optional")} />
              </FormField>
              <FormField label={t("checkout:quick.area")} htmlFor="qo-area" error={errors.area}>
                <Input id="qo-area" autoComplete="address-level3" value={form.area} onChange={(e) => setField("area", e.target.value)} placeholder={t("common:status.optional")} />
              </FormField>
            </div>
            {/* Honeypot: hidden from people and assistive tech; bots that fill every field get rejected server-side */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="qo-website">Website</label>
              <input id="qo-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setField("website", e.target.value)} />
            </div>
          </div>

          {/* Delivery */}
          {deliveryOptions.length > 0 && (
            <FormField label={t("checkout:labels.delivery")} error={errors.delivery}>
              <ChoiceCardGroup
                aria-label={t("checkout:labels.deliveryOption")}
                value={shippingMethodId != null ? String(shippingMethodId) : undefined}
                onValueChange={(v) => { setShippingMethodId(Number(v)); setErrors((e) => ({ ...e, delivery: undefined })); }}
                className="grid-cols-1 min-[400px]:grid-cols-2"
              >
                {deliveryOptions.map((d) => (
                  <ChoiceCard
                    key={d.id}
                    value={String(d.id)}
                    icon={<Truck />}
                    title={d.name}
                    description={[d.price > 0 ? formatCurrency(d.price) : t("common:money.free"), d.estimatedTime].filter(Boolean).join(" · ")}
                  />
                ))}
              </ChoiceCardGroup>
            </FormField>
          )}

          {/* Payment */}
          <FormField label={t("checkout:labels.payment")} error={errors.payment}>
            <ChoiceCardGroup
              aria-label={t("checkout:labels.paymentMethod")}
              value={paymentSlug || undefined}
              onValueChange={(v) => { setPaymentSlug(v); setErrors((e) => ({ ...e, payment: undefined, transactionId: undefined })); }}
            >
              {paymentMethods.map((m) => {
                const isCod = m.type === "cod";
                const description = isCod
                  ? codBlocked && cod
                    ? t("checkout:quick.codOnlyUnder", { amount: formatCurrency(cod.limit) })
                    : cod && cod.fee > 0
                      ? t("checkout:quick.codPayFee", { fee: formatCurrency(cod.fee) })
                      : t("checkout:quick.codPay")
                  : m.type === "manual"
                    ? m.account ? t("checkout:quick.sendMoneyTo", { account: m.account }) : undefined
                    : t("checkout:labels.redirectSecure");
                return (
                  <ChoiceCard
                    key={m.slug}
                    value={m.slug}
                    disabled={isCod && codBlocked}
                    icon={isCod ? <Banknote /> : <Smartphone />}
                    title={m.name}
                    description={description}
                  />
                );
              })}
            </ChoiceCardGroup>
          </FormField>

          {selectedPayment && selectedPayment.type === "manual" && (
            <Card className="space-y-3 p-4">
              <p className="text-sm text-foreground">
                {selectedPayment.account ? (
                  <Trans
                    i18nKey="checkout:quick.manualSend"
                    values={{
                      amount: formatCurrency(total),
                      account: selectedPayment.account,
                      details: [selectedPayment.name, selectedPayment.accountName, selectedPayment.bankName].filter(Boolean).join(", "),
                    }}
                    components={{ b: <span className="font-semibold" />, mono: <span className="font-mono font-semibold" /> }}
                  />
                ) : (
                  <Trans
                    i18nKey="checkout:quick.manualPay"
                    values={{ amount: formatCurrency(total), method: selectedPayment.name }}
                    components={{ b: <span className="font-semibold" /> }}
                  />
                )}
              </p>
              {needsTxn && (
                <FormField label={t("checkout:quick.transactionId")} htmlFor="qo-txn" error={errors.transactionId} required>
                  <Input id="qo-txn" autoComplete="off" value={form.transactionId} onChange={(e) => setField("transactionId", e.target.value)} placeholder={t("checkout:quick.txnPlaceholder")} className="font-mono uppercase" aria-invalid={!!errors.transactionId} />
                </FormField>
              )}
            </Card>
          )}

          <FormField label={t("common:form.note")} htmlFor="qo-note" error={errors.note}>
            <Textarea id="qo-note" rows={2} value={form.note} onChange={(e) => setField("note", e.target.value)} placeholder={t("checkout:quick.notePlaceholder")} />
          </FormField>

          {generalError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Summary + confirm: a fixed bar on the order page, inline when embedded */}
      <div className={embedded
        ? "mt-6 rounded-2xl border bg-card p-4"
        : "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur"}>
        <div className={embedded ? "space-y-2" : "container max-w-5xl space-y-2 py-3"}>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 text-sm">
            <dt className="text-muted-foreground">{t("checkout:quick.subtotalLine", { qty: quantity, price: formatCurrency(unitPrice) })}</dt>
            <dd className="text-right tabular-nums text-foreground">{formatCurrency(subtotal)}</dd>
            <dt className="text-muted-foreground">{selectedDelivery ? t("checkout:quick.deliveryLine", { method: selectedDelivery.name }) : t("checkout:labels.delivery")}</dt>
            <dd className="text-right tabular-nums text-foreground">{formatCurrency(deliveryCharge)}</dd>
            {codFee > 0 && (
              <>
                <dt className="text-muted-foreground">{t("checkout:quick.codFee")}</dt>
                <dd className="text-right tabular-nums text-foreground">{formatCurrency(codFee)}</dd>
              </>
            )}
            <dt className="font-semibold text-foreground">{t("common:money.total")}</dt>
            <dd className="text-right text-base font-bold tabular-nums text-foreground">{formatCurrency(total)}</dd>
          </dl>
          <Button type="submit" size="lg" className="h-12 w-full gap-2 text-base" disabled={placeOrder.isPending || outOfStock}>
            {placeOrder.isPending ? <Spinner /> : <ShoppingBag className="size-5" />}
            {outOfStock ? t("common:product.outOfStock") : placeOrder.isPending ? t("checkout:quick.placing") : t("checkout:quick.confirm")}
          </Button>
        </div>
      </div>
    </form>
  );
}
