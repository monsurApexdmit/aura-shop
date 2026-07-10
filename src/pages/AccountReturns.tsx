import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { RotateCcw, ChevronRight, Plus, XCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { useReturns, useCancelReturn } from "@/hooks/useReturns"
import { STATUS_LABEL, STATUS_COLOR } from "@/services/returnApi"
import type { ReturnStatus, CustomerReturn } from "@/services/returnApi"
import { useCurrency } from "@/contexts/CurrencyContext"

const REFUND_METHOD_LABEL: Record<string, string> = {
  original_payment: "Original payment",
  store_credit:     "Store credit",
  cash:             "Cash",
}

function ReturnCard({ ret }: { ret: CustomerReturn }) {
  const navigate = useNavigate()
  const { formatCurrency } = useCurrency()
  const { mutateAsync: cancelReturn, isPending: cancelling } = useCancelReturn()

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm("Cancel this return request?")) return
    try {
      await cancelReturn(ret.id)
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to cancel return")
    }
  }

  return (
    <div
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => navigate(`/account/returns/${ret.id}`)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono font-bold text-sm text-foreground">
              {ret.return_number ?? `RET-${ret.id}`}
            </p>
            {ret.order_number && (
              <p className="text-xs text-muted-foreground">Order: {ret.order_number}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(ret.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ret.total_amount != null && (
            <span className="font-display font-bold text-sm text-foreground">
              {formatCurrency(ret.total_amount)}
            </span>
          )}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[ret.status as ReturnStatus] ?? "bg-muted text-muted-foreground"}`}>
            {STATUS_LABEL[ret.status as ReturnStatus] ?? ret.status}
          </span>
        </div>
      </div>

      {/* Items */}
      {ret.items && ret.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border space-y-1.5">
          {ret.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium truncate flex-1">
                {item.product_name ?? `Product #${item.product_id}`}
                {item.variant_name && <span className="text-muted-foreground"> · {item.variant_name}</span>}
              </span>
              <span className="text-muted-foreground text-xs ml-4 shrink-0">Qty: {item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Refund method */}
      {ret.refund_method && (
        <p className="mt-2 text-xs text-muted-foreground">
          Refund via: <span className="font-medium text-foreground">{REFUND_METHOD_LABEL[ret.refund_method] ?? ret.refund_method}</span>
        </p>
      )}

      {/* Rejection reason */}
      {ret.status === "rejected" && ret.rejection_reason && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
          <p className="text-xs font-semibold text-red-700 dark:text-red-400">Rejection reason:</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{ret.rejection_reason}</p>
        </div>
      )}

      {/* Approved banner */}
      {ret.status === "approved" && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
            Approved — refund is being processed
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
        <Link
          to={`/account/returns/${ret.id}`}
          onClick={e => e.stopPropagation()}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View Details →
        </Link>
        {ret.status === "pending" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
          >
            {cancelling
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <XCircle className="h-3 w-3" />}
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default function AccountReturns() {
  const { isLoggedIn } = useAuth()
  const { data: returns, isLoading, isError } = useReturns(isLoggedIn)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">My Account</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Returns</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground mb-1">My Returns</h1>
                <p className="text-sm text-muted-foreground">Track and manage your return requests</p>
              </div>
              <Link
                to="/account/returns/new"
                className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm"
              >
                <Plus className="h-4 w-4" />
                New Return Request
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            ) : isError ? (
              <div className="text-center py-20">
                <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Could not load returns right now.</p>
              </div>
            ) : !returns || returns.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-2xl">
                <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-semibold text-foreground mb-1">No return requests</p>
                <p className="text-sm text-muted-foreground mb-4">Submit a return for a delivered order.</p>
                <Link to="/account/returns/new" className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm">
                  <Plus className="h-4 w-4" />
                  New Return Request
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {returns.map(ret => <ReturnCard key={ret.id} ret={ret} />)}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
