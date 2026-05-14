import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronRight, RotateCcw, Package, AlertCircle, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Footer from "@/components/Footer"
import { useReturn, useCancelReturn } from "@/hooks/useReturns"
import { STATUS_LABEL, STATUS_COLOR } from "@/services/returnApi"
import type { ReturnStatus } from "@/services/returnApi"
import { useCurrency } from "@/contexts/CurrencyContext"

const STATUS_ICON: Record<ReturnStatus, React.ElementType> = {
  pending:   Clock,
  approved:  CheckCircle2,
  rejected:  XCircle,
  completed: CheckCircle2,
}

const REFUND_METHOD_LABEL: Record<string, string> = {
  original_payment: "Original Payment Method",
  store_credit:     "Store Credit",
  cash:             "Cash Refund",
}

export default function ReturnDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { formatCurrency } = useCurrency()
  const numericId = id ? Number(id) : null
  const { data: ret, isLoading, isError } = useReturn(numericId)
  const { mutateAsync: cancelReturn, isPending: cancelling } = useCancelReturn()

  const handleCancel = async () => {
    if (!numericId) return
    if (!window.confirm("Cancel this return request?")) return
    try {
      await cancelReturn(numericId)
      navigate("/account/returns")
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to cancel return")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-40">
        <div className="container max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !ret) {
    return (
      <div className="min-h-screen bg-background pt-40 flex flex-col items-center gap-4">
        <RotateCcw className="h-16 w-16 text-muted-foreground/30" />
        <p className="font-display font-bold text-xl text-foreground">Return not found</p>
        <Link to="/account/returns" className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm">
          Back to Returns
        </Link>
      </div>
    )
  }

  const StatusIcon = STATUS_ICON[ret.status as ReturnStatus] ?? Clock
  const statusColor = STATUS_COLOR[ret.status as ReturnStatus] ?? "bg-muted text-muted-foreground"
  const isPending = ret.status === "pending"
  const requestDate = ret.created_at ? new Date(ret.created_at) : null
  const processedDate = ret.processed_at ? new Date(ret.processed_at) : null

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
              <span className="text-foreground font-medium">{ret.return_number ?? `RET-${ret.id}`}</span>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground mb-1">
                  {ret.return_number ?? `Return #${ret.id}`}
                </h1>
                {requestDate && (
                  <p className="text-sm text-muted-foreground">
                    Submitted {requestDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {STATUS_LABEL[ret.status as ReturnStatus] ?? ret.status}
              </span>
            </div>

            {/* Status timeline */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-5">
              <h2 className="font-display font-bold text-sm mb-5">Return Progress</h2>
              <div className="flex items-center gap-0">
                {(["pending", "approved", "completed"] as ReturnStatus[]).map((s, i, arr) => {
                  const statusOrder = { pending: 0, approved: 1, rejected: 1, completed: 2 }
                  const currentIdx = statusOrder[ret.status as ReturnStatus] ?? 0
                  const stepIdx = statusOrder[s] ?? 0
                  const done = currentIdx >= stepIdx
                  const isRejected = ret.status === "rejected" && s === "approved"
                  const Icon = isRejected ? XCircle : STATUS_ICON[s]
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isRejected ? "bg-red-500/10 text-red-600"
                          : done ? "gradient-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-[10px] font-semibold text-center ${
                          isRejected ? "text-red-600"
                          : done ? "text-primary"
                          : "text-muted-foreground"
                        }`}>
                          {isRejected ? "Rejected" : STATUS_LABEL[s]}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full ${
                          currentIdx > stepIdx ? "bg-primary" : "bg-border"
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-5">
              {/* Items */}
              <div className="md:col-span-3 bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-bold text-sm mb-4">
                  Return Items ({ret.items?.length ?? 0})
                </h2>
                <div className="space-y-3">
                  {(ret.items ?? []).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{item.product_name ?? `Product #${item.product_id}`}</p>
                        {item.variant_name && <p className="text-xs text-muted-foreground">{item.variant_name}</p>}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Reason: {item.reason}</p>
                      </div>
                      {item.price != null && (
                        <p className="font-display font-bold text-sm text-foreground shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Details sidebar */}
              <div className="md:col-span-2 space-y-4">
                {/* Return info */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display font-bold text-sm mb-4">Return Details</h3>
                  <div className="space-y-2.5 text-sm">
                    {ret.order_number && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Order</span>
                        <span className="font-mono font-semibold text-foreground">{ret.order_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Refund via</span>
                      <span className="font-semibold text-foreground text-right">
                        {ret.refund_method ? (REFUND_METHOD_LABEL[ret.refund_method] ?? ret.refund_method) : "—"}
                      </span>
                    </div>
                    {ret.total_amount != null && (
                      <div className="flex justify-between gap-2 pt-2 border-t border-border">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-display font-bold text-foreground">{formatCurrency(ret.total_amount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {ret.notes && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display font-bold text-sm mb-2">Your Notes</h3>
                    <p className="text-sm text-muted-foreground">{ret.notes}</p>
                  </div>
                )}

                {/* Processed info */}
                {processedDate && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-display font-bold text-sm mb-2">Processed</h3>
                    <p className="text-sm text-muted-foreground">
                      {processedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    {ret.processed_by && <p className="text-xs text-muted-foreground mt-0.5">by {ret.processed_by}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Rejection reason */}
            {ret.status === "rejected" && ret.rejection_reason && (
              <div className="mt-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-red-700 dark:text-red-400">Return Rejected</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{ret.rejection_reason}</p>
                </div>
              </div>
            )}

            {/* Approved info */}
            {ret.status === "approved" && (
              <div className="mt-5 flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-green-700 dark:text-green-400">Return Approved</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Your refund via <strong>{ret.refund_method ? (REFUND_METHOD_LABEL[ret.refund_method] ?? ret.refund_method) : "selected method"}</strong> is being processed. You will be contacted once completed.
                  </p>
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link to="/account/returns" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                ← Back to Returns
              </Link>
              {isPending && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Cancel Request
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
