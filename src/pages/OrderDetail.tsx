import { cn } from "@/lib/utils"
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrder } from "@/hooks/useOrders";
import { mapFulfillmentStatus } from "@/services/orderApi";
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, MapPin, CreditCard, ArrowLeft, Banknote, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/EmptyState";
import { InfoList, InfoRow } from "@/components/common/InfoList";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { StatusBadge } from "@/components/common/StatusBadge";
import Footer from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import { localeTag } from "@/i18n";

const STATUS_ICON: Record<string, React.ElementType> = {
  Processing: Clock,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
};


const TIMELINE = [
  { labelKey: "account:orderDetail.placed", icon: Package },
  { labelKey: "account:orderStatus.processing", icon: Clock },
  { labelKey: "account:orderStatus.shipped", icon: Truck },
  { labelKey: "account:orderStatus.delivered", icon: CheckCircle2 },
];

const TIMELINE_IDX: Record<string, number> = {
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const numericId = id ? Number(id) : null;
  const { data: order, isLoading, isError } = useOrder(numericId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-40 flex flex-col items-center gap-4">
        <div className="container max-w-4xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background pt-40">
        <EmptyState
          icon={Package}
          title={t("account:orderDetail.notFound")}
          action={
            <Button onClick={() => navigate("/account/orders")}>
              {t("account:orderDetail.back")}
            </Button>
          }
        />
      </div>
    );
  }

  const { label: statusLabel } = mapFulfillmentStatus(order.fulfillment_status);
  const StatusIcon = STATUS_ICON[statusLabel] ?? Clock;
  const timelineIdx = TIMELINE_IDX[statusLabel] ?? 0;
  const isCancelled = statusLabel === "Cancelled";
  const statusText = t(`account:orderStatus.${order.fulfillment_status}`, { defaultValue: statusLabel });
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((s, i) => s + Number(i.total_price ?? 0), 0);
  const tax = Number(order.amount ?? 0) - subtotal - Number(order.shipping_cost ?? 0);
  const orderDate = order.order_time ? new Date(order.order_time) : null;
  const orderDateLabel = orderDate && !Number.isNaN(orderDate.getTime())
    ? orderDate.toLocaleDateString(localeTag(), { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : t("account:dateUnavailable");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">{t("common:nav.myAccount")}</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/account/orders" className="hover:text-primary">{t("account:breadcrumb.orders")}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{order.invoice_no}</span>
            </div>

            {/* Header */}
            <PageHeader
              className="mb-8 items-start"
              title={order.invoice_no}
              description={t("account:orderDetail.placedOn", { date: orderDateLabel })}
              actions={
                <StatusBadge
                  status={statusLabel}
                  className="gap-1.5"
                  label={<><StatusIcon className="h-3.5 w-3.5" />{statusText}</>}
                />
              }
            />

            {/* Timeline */}
            {!isCancelled && (
              <SectionCard title={t("account:orderDetail.progress")} className="mb-6">
                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-[560px] items-center justify-between">
                  {TIMELINE.map((step, i) => (
                    <div key={step.labelKey} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", i <= timelineIdx ? "gradient-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground")}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className={cn("text-[10px] font-semibold", i <= timelineIdx ? "text-primary" : "text-muted-foreground")}>{t(step.labelKey)}</span>
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={cn("flex-1 h-0.5 mx-2 mb-5 rounded-full", i < timelineIdx ? "bg-primary" : "bg-border")} />
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              </SectionCard>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items */}
              <SectionCard className="lg:col-span-2" title={t("account:orderDetail.items", { count: items.length })}>
                <div className="space-y-3">
                  {items.map((item) => (
                    <Item key={item.id} variant="outline" className="flex-col items-start gap-3 p-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-4">
                      <ItemMedia className="size-16 overflow-hidden rounded-md bg-muted">
                        <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">{t("account:orderDetail.noImage")}</span>
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0">
                        <ItemTitle className="block truncate">{item.product_name}</ItemTitle>
                        {item.variant_name && <ItemDescription className="text-xs">{item.variant_name}</ItemDescription>}
                        <ItemDescription className="text-xs">{t("account:orderDetail.qtyPrice", { qty: item.quantity, price: formatCurrency(item.unit_price) })}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <p className="font-semibold text-sm tabular-nums min-[420px]:text-right">{formatCurrency(item.total_price)}</p>
                      </ItemActions>
                    </Item>
                  ))}
                </div>
              </SectionCard>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Price Summary */}
                <SectionCard title={t("account:orderDetail.summary")}>
                  <InfoList>
                    <InfoRow label={t("common:money.subtotal")} value={formatCurrency(subtotal)} />
                    <InfoRow label={t("common:money.shipping")} value={formatCurrency(order.shipping_cost)} />
                    {tax > 0 && <InfoRow label={t("common:money.tax")} value={formatCurrency(tax)} />}
                    {order.discount > 0 && <InfoRow label={t("common:money.discount")} value={<span className="text-green-600">-{formatCurrency(order.discount)}</span>} />}
                  </InfoList>
                  <Separator className="my-3" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>{t("common:money.total")}</span><span className="text-primary tabular-nums">{formatCurrency(order.amount)}</span>
                  </div>
                </SectionCard>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <SectionCard title={<span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{t("account:orderDetail.shipping")}</span>}>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p className="font-medium text-foreground">{order.shipping_address.name}</p>
                      {order.shipping_address.address && <p>{order.shipping_address.address}</p>}
                      {(order.shipping_address.city || order.shipping_address.state) && (
                        <p>{[order.shipping_address.city, order.shipping_address.state, order.shipping_address.zip].filter(Boolean).join(", ")}</p>
                      )}
                      {order.shipping_address.phone && <p className="pt-1 text-xs">{order.shipping_address.phone}</p>}
                      {order.tracking_number && (
                        <p className="pt-1 text-xs">{t("account:orderDetail.tracking")} <span className="font-mono text-primary">{order.tracking_number}</span></p>
                      )}
                    </div>
                  </SectionCard>
                )}

                {/* Payment */}
                <SectionCard
                  title={<span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />{t("account:orderDetail.payment")}</span>}
                  contentClassName="space-y-3"
                >

                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">{order.method}</p>

                    {/* Overall payment status */}
                    {(() => {
                      const ps = order.payment_status
                      const isPaid = ps === "paid"
                      const isDeposit = ps === "shipping_deposit_paid"
                      const isFailed = ps === "failed"
                      const isCancelled = ps === "cancelled"
                      const label = isPaid ? t("account:orderDetail.paid")
                        : isDeposit ? t("account:orderDetail.depositPaid")
                        : isFailed ? t("account:orderDetail.paymentFailed")
                        : isCancelled ? t("account:orderDetail.cancelled")
                        : t("account:orderDetail.awaitingPayment")
                      return (
                        <StatusBadge
                          status={ps ?? ""}
                          label={label}
                          variant={isPaid ? "default" : isFailed || isCancelled ? "destructive" : "secondary"}
                        />
                      )
                    })()}

                    {/* Full payment transaction */}
                    {order.payment_transaction_id && (
                      <div className="pt-1">
                        <SectionTitle as="p" className="text-[10px]">{t("account:orderDetail.transactionId")}</SectionTitle>
                        <p className="text-xs font-mono text-foreground break-all">{order.payment_transaction_id}</p>
                      </div>
                    )}
                  </div>

                  {/* Shipping deposit section — only when > 0 */}
                  {order.shipping_deposit_amount != null && order.shipping_deposit_amount > 0 && (
                    <>
                    <Separator />
                    <div className="space-y-1.5">
                      <SectionTitle as="p" className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" /> {t("account:orderDetail.shippingDeposit")}
                      </SectionTitle>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("account:orderDetail.amountPaid")}</span>
                        <span className="font-bold text-amber-600">{formatCurrency(order.shipping_deposit_amount)}</span>
                      </div>
                      {order.shipping_deposit_transaction_id && (
                        <div>
                          <SectionTitle as="p" className="text-[10px]">{t("account:orderDetail.depositTxnId")}</SectionTitle>
                          <p className="text-xs font-mono text-foreground break-all">{order.shipping_deposit_transaction_id}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {t("account:orderDetail.depositNote", { amount: formatCurrency(Number(order.amount) - order.shipping_deposit_amount) })}
                      </p>
                    </div>
                    </>
                  )}
                </SectionCard>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/account/orders")}>
                <ArrowLeft className="h-4 w-4" /> {t("account:orderDetail.back")}
              </Button>
              {statusLabel === "Delivered" && (
                <Button asChild variant="outline">
                  <Link to={`/account/returns/new?order_id=${order.id}`}>
                    <RotateCcw className="h-4 w-4 text-primary" />
                    {t("account:orderDetail.returnItems")}
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
