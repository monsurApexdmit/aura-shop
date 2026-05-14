import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronRight, RotateCcw, Package, Minus, Plus, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
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

            <h1 className="font-display font-bold text-2xl text-foreground mb-2">New Return Request</h1>
            <p className="text-sm text-muted-foreground mb-8">Select the order and items you'd like to return.</p>

            {/* Step 1: Select order */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-5">
              <h2 className="font-display font-bold text-sm mb-4">Step 1 — Select Order</h2>
              {isLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : deliveredOrders.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No delivered orders eligible for return.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deliveredOrders.map(order => (
                    <button
                      key={order.id}
                      onClick={() => { setSelectedOrder(order); setSelectedItems([]) }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
                        selectedOrder?.id === order.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <p className="font-mono font-bold text-sm text-foreground">{order.invoice_no}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.order_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${
                        selectedOrder?.id === order.id ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Select items */}
            {selectedOrder && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-5">
                <h2 className="font-display font-bold text-sm mb-4">Step 2 — Select Items to Return</h2>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => {
                    const sel = selectedItems.find(s => s.product_id === item.product_id && s.variant_id === ((item as any).variant_id ?? null))
                    return (
                      <div key={item.id} className={`border rounded-xl p-4 transition-colors ${sel ? "border-primary bg-primary/5" : "border-border"}`}>
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleItem(item)}
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              sel ? "bg-primary border-primary" : "border-muted-foreground/40"
                            }`}
                          >
                            {sel && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
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
                                <button onClick={() => updateQty(selectedItems.indexOf(sel), -1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">{sel.quantity}</span>
                                <button onClick={() => updateQty(selectedItems.indexOf(sel), 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                                  <Plus className="h-3 w-3" />
                                </button>
                                <span className="text-xs text-muted-foreground">/ {sel.max_qty}</span>
                              </div>
                            </div>
                            {/* Reason */}
                            <div className="flex items-start gap-3">
                              <span className="text-xs text-muted-foreground w-16 mt-2">Reason</span>
                              <select
                                value={sel.reason}
                                onChange={e => updateReason(selectedItems.indexOf(sel), e.target.value)}
                                className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                              >
                                {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Refund method + notes */}
            {selectedItems.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-5">
                <h2 className="font-display font-bold text-sm mb-4">Step 3 — Refund Preference</h2>

                <div className="space-y-2 mb-5">
                  {[
                    { value: "original_payment", label: "Original Payment Method", desc: "Refund to how you originally paid" },
                    { value: "store_credit",     label: "Store Credit",            desc: "Get credit to use on future orders" },
                    { value: "cash",             label: "Cash Refund",             desc: "Cash refund via bank transfer" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setRefundMethod(opt.value)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
                        refundMethod === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                        refundMethod === opt.value ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`} />
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Additional Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional information about your return..."
                  className="w-full text-sm bg-background border border-border rounded-xl px-4 py-3 text-foreground resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl mb-5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4">
              <Link to="/account/returns" className="px-5 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isPending || !selectedOrder || selectedItems.length === 0}
                className="flex-1 gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                ) : (
                  <><RotateCcw className="h-4 w-4" />Submit Return Request</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
