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

  const toggleItem = (item: ApiOrder['items'][0]) => {
    setSelectedItems(prev => {
      const exists = prev.find(s => s.product_id === item.product_id && s.variant_id === (item as any).variant_id)
      if (exists) return prev.filter(s => s !== exists)
      return [...prev, {
        product_id: item.product_id,
        variant_id: (item as any).variant_id ?? null,
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
    if (!selectedOrder) { setError("Select an order first"); return }
    if (selectedItems.length === 0) { setError("Select at least one item to return"); return }
    if (selectedItems.some(s => !s.reason)) { setError("Select a reason for each item"); return }

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
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to submit return request. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">My Account</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/account/returns" className="hover:text-primary">Returns</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">New Request</span>
            </div>

            <PageHeader
              className="mb-8"
              title="New Return Request"
              description="Select the order and items you'd like to return."
            />

            {/* Step 1: Select order */}
            <SectionCard title="Step 1 — Select Order" className="mb-5">
              {isLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
              ) : deliveredOrders.length === 0 ? (
                <EmptyState className="py-6" icon={Package} title="No delivered orders eligible for return." />
              ) : (
                <ChoiceCardGroup
                  aria-label="Order"
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
                        {new Date(order.order_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </>}
                    />
                  ))}
                </ChoiceCardGroup>
              )}
            </SectionCard>

            {/* Step 2: Select items */}
            {selectedOrder && (
              <SectionCard title="Step 2 — Select Items to Return" className="mb-5">
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => {
                    const sel = selectedItems.find(s => s.product_id === item.product_id && s.variant_id === ((item as any).variant_id ?? null))
                    return (
                      <Card key={item.id} className={cn("p-4 transition-colors", sel && "border-primary bg-primary/5")}>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={!!sel}
                            onCheckedChange={() => toggleItem(item)}
                            aria-label={`Return ${item.product_name}`}
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
                              <span className="text-xs text-muted-foreground w-16">Qty</span>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" aria-label="Decrease quantity" onClick={() => updateQty(selectedItems.indexOf(sel), -1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold">{sel.quantity}</span>
                                <Button variant="outline" size="icon" aria-label="Increase quantity" onClick={() => updateQty(selectedItems.indexOf(sel), 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <span className="text-xs text-muted-foreground">/ {sel.max_qty}</span>
                              </div>
                            </div>
                            {/* Reason */}
                            <div className="flex items-start gap-3">
                              <span className="text-xs text-muted-foreground w-16 mt-2">Reason</span>
                              <Select
                                value={sel.reason}
                                onValueChange={v => updateReason(selectedItems.indexOf(sel), v)}
                              >
                                <SelectTrigger className="flex-1" aria-label="Return reason">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {RETURN_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
              <SectionCard title="Step 3 — Refund Preference" className="mb-5">
                <ChoiceCardGroup aria-label="Refund method" value={refundMethod} onValueChange={setRefundMethod} className="mb-5">
                  {[
                    { value: "original_payment", label: "Original Payment Method", desc: "Refund to how you originally paid" },
                    { value: "store_credit",     label: "Store Credit",            desc: "Get credit to use on future orders" },
                    { value: "cash",             label: "Cash Refund",             desc: "Cash refund via bank transfer" },
                  ].map(opt => (
                    <ChoiceCard key={opt.value} value={opt.value} title={opt.label} description={opt.desc} />
                  ))}
                </ChoiceCardGroup>

                <FormField label="Additional Notes (optional)" htmlFor="return-notes">
                  <Textarea
                    id="return-notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any additional information about your return..."
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
                <Link to="/account/returns">Cancel</Link>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !selectedOrder || selectedItems.length === 0}
                className="flex-1"
              >
                {isPending ? (
                  <><Spinner />Submitting...</>
                ) : (
                  <><RotateCcw className="h-4 w-4" />Submit Return Request</>
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
