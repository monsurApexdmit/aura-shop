import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronRight, RotateCcw, Package, Minus, Plus, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ChoiceCard, ChoiceCardGroup } from "@/components/common/ChoiceCard"
import { EmptyState } from "@/components/common/EmptyState"
import { FormField } from "@/components/common/FormField"
import { PageHeader } from "@/components/common/PageHeader"
import { SectionCard } from "@/components/common/SectionCard"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { useOrders } from "@/hooks/useOrders"
import { useCreateReturn } from "@/hooks/useReturns"
import { RETURN_REASONS } from "@/services/returnApi"
import type { ApiOrder } from "@/services/orderApi"
import { useCurrency } from "@/contexts/CurrencyContext"
import { WithTooltip } from "@/components/common/WithTooltip"
import { useTranslation } from "react-i18next"
import { localeTag } from "@/i18n"

/** Error shape from the API client (axios) */
type ApiErr = { response?: { data?: { message?: string } } }

// RETURN_REASONS values are sent to the API in English; only the label is translated
const REASON_KEY: Record<string, string> = {
  "Defective / Damaged":   "account:returnReason.defective",
  "Wrong item received":   "account:returnReason.wrongItem",
  "Item not as described": "account:returnReason.notAsDescribed",
  "Size / fit issue":      "account:returnReason.sizeFit",
  "Changed my mind":       "account:returnReason.changedMind",
  "Other":                 "account:returnReason.other",
}

const REFUND_OPTIONS = [
  { value: "original_payment", labelKey: "account:refundMethod.original_payment", descKey: "account:newReturn.refundDesc.original_payment" },
  { value: "store_credit",     labelKey: "account:refundMethod.store_credit",     descKey: "account:newReturn.refundDesc.store_credit" },
  { value: "cash",             labelKey: "account:refundMethod.cash",             descKey: "account:newReturn.refundDesc.cash" },
]

type OrderItem = ApiOrder["items"][0] & { variant_id?: number | null }

interface SelectedItem {
  product_id: number
  variant_id: number | null
  product_name: string
  variant_name: string | null
  unit_price: number
  max_qty: number
  quantity: number
  reason: string
}

export default function NewReturnRequest() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoggedIn } = useAuth()
  const { formatCurrency } = useCurrency()
  const { data, isLoading } = useOrders(isLoggedIn)
  const { mutateAsync: createReturn, isPending } = useCreateReturn()

  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [refundMethod, setRefundMethod] = useState("original_payment")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const orders = data?.data ?? []
  const deliveredOrders = orders.filter(o => o.fulfillment_status === 'delivered')

  // Pre-select order from query param ?order_id=
  useEffect(() => {
    const orderId = searchParams.get('order_id')
    if (orderId && orders.length > 0) {
      const found = orders.find(o => String(o.id) === orderId)
      if (found) setSelectedOrder(found)
    }
  }, [searchParams, orders])

  const toggleItem = (item: OrderItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(s => s.product_id === item.product_id && s.variant_id === item.variant_id)
      if (exists) return prev.filter(s => s !== exists)
      return [...prev, {
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        product_name: item.product_name,
        variant_name: item.variant_name,
        unit_price: item.unit_price,
        max_qty: item.quantity,
        quantity: 1,
        reason: RETURN_REASONS[0],
      }]
    })
  }

  const updateQty = (idx: number, delta: number) => {
    setSelectedItems(prev => prev.map((s, i) => {
      if (i !== idx) return s
      const q = Math.min(s.max_qty, Math.max(1, s.quantity + delta))
      return { ...s, quantity: q }
    }))
  }

  const updateReason = (idx: number, reason: string) => {
    setSelectedItems(prev => prev.map((s, i) => i === idx ? { ...s, reason } : s))
  }

  const handleSubmit = async () => {
    setError("")
    if (!selectedOrder) { setError(t("account:newReturn.errSelectOrder")); return }
    if (selectedItems.length === 0) { setError(t("account:newReturn.errSelectItem")); return }
    if (selectedItems.some(s => !s.reason)) { setError(t("account:newReturn.errSelectReason")); return }

    try {
      await createReturn({
        sell_id: selectedOrder.id,
        order_number: selectedOrder.invoice_no,
        refund_method: refundMethod,
        notes: notes.trim() || undefined,
        items: selectedItems.map(s => ({
          product_id: s.product_id,
          variant_id: s.variant_id,
          quantity: s.quantity,
          reason: s.reason,
          price: s.unit_price,
        })),
      })
      navigate("/account/returns")
    } catch (e) {
      const err = e as ApiErr
      setError(err?.response?.data?.message ?? t("account:newReturn.errSubmit"))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">{t("common:nav.myAccount")}</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/account/returns" className="hover:text-primary">{t("common:nav.returns")}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{t("account:breadcrumb.newRequest")}</span>
            </div>

            <PageHeader
              className="mb-8"
              title={t("account:returns.newRequest")}
              description={t("account:newReturn.description")}
            />

            {/* Step 1: Select order */}
            <SectionCard title={t("account:newReturn.step1")} className="mb-5">
              {isLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
              ) : deliveredOrders.length === 0 ? (
                <EmptyState className="py-6" icon={Package} title={t("account:newReturn.noEligible")} />
              ) : (
                <ChoiceCardGroup
                  aria-label={t("account:newReturn.orderLabel")}
                  value={selectedOrder ? String(selectedOrder.id) : undefined}
                  onValueChange={(v) => {
                    const order = deliveredOrders.find(o => String(o.id) === v)
                    if (order) { setSelectedOrder(order); setSelectedItems([]) }
                  }}
                >
                  {deliveredOrders.map(order => (
                    <ChoiceCard
                      key={order.id}
                      value={String(order.id)}
                      title={<span className="font-mono">{order.invoice_no}</span>}
                      description={<>
                        {new Date(order.order_time).toLocaleDateString(localeTag(), { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{t("common:product.items", { count: order.items.length })}
                      </>}
                    />
                  ))}
                </ChoiceCardGroup>
              )}
            </SectionCard>

            {/* Step 2: Select items */}
            {selectedOrder && (
              <SectionCard title={t("account:newReturn.step2")} className="mb-5">
                <div className="space-y-3">
                  {selectedOrder.items.map((item: OrderItem) => {
                    const sel = selectedItems.find(s => s.product_id === item.product_id && s.variant_id === (item.variant_id ?? null))
                    return (
                      <Card key={item.id} className={cn("p-4 transition-colors", sel && "border-primary bg-primary/5")}>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={!!sel}
                            onCheckedChange={() => toggleItem(item)}
                            aria-label={t("account:newReturn.returnItem", { name: item.product_name })}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{item.product_name}</p>
                            {item.variant_name && <p className="text-xs text-muted-foreground">{item.variant_name}</p>}
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.unit_price)} × {item.quantity}</p>
                          </div>
                        </div>

                        {sel && (
                          <div className="mt-4 space-y-3 pl-8">
                            {/* Quantity */}
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-16">{t("account:newReturn.qty")}</span>
                              <div className="flex items-center gap-2">
                                <WithTooltip content={t("common:actions.decrease")}><Button variant="outline" size="icon" aria-label={t("common:actions.decrease")} onClick={() => updateQty(selectedItems.indexOf(sel), -1)}>
                                  <Minus className="h-3 w-3" />
                                </Button></WithTooltip>
                                <span className="w-8 text-center text-sm font-semibold">{sel.quantity}</span>
                                <WithTooltip content={t("common:actions.increase")}><Button variant="outline" size="icon" aria-label={t("common:actions.increase")} onClick={() => updateQty(selectedItems.indexOf(sel), 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button></WithTooltip>
                                <span className="text-xs text-muted-foreground">/ {sel.max_qty}</span>
                              </div>
                            </div>
                            {/* Reason */}
                            <div className="flex items-start gap-3">
                              <span className="text-xs text-muted-foreground w-16 mt-2">{t("account:newReturn.reason")}</span>
                              <Select
                                value={sel.reason}
                                onValueChange={v => updateReason(selectedItems.indexOf(sel), v)}
                              >
                                <SelectTrigger className="flex-1" aria-label={t("account:newReturn.reasonLabel")}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {RETURN_REASONS.map(r => <SelectItem key={r} value={r}>{REASON_KEY[r] ? t(REASON_KEY[r]) : r}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </SectionCard>
            )}

            {/* Step 3: Refund method + notes */}
            {selectedItems.length > 0 && (
              <SectionCard title={t("account:newReturn.step3")} className="mb-5">
                <ChoiceCardGroup aria-label={t("account:newReturn.refundLabel")} value={refundMethod} onValueChange={setRefundMethod} className="mb-5">
                  {REFUND_OPTIONS.map(opt => (
                    <ChoiceCard key={opt.value} value={opt.value} title={t(opt.labelKey)} description={t(opt.descKey)} />
                  ))}
                </ChoiceCardGroup>

                <FormField label={t("account:newReturn.notes")} htmlFor="return-notes">
                  <Textarea
                    id="return-notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder={t("account:newReturn.notesPlaceholder")}
                    className="w-full resize-none"
                  />
                </FormField>
              </SectionCard>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="mb-5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link to="/account/returns">{t("common:actions.cancel")}</Link>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !selectedOrder || selectedItems.length === 0}
                className="flex-1"
              >
                {isPending ? (
                  <><Spinner />{t("account:newReturn.submitting")}</>
                ) : (
                  <><RotateCcw className="h-4 w-4" />{t("account:newReturn.submit")}</>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
