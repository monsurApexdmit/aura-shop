import { cn } from "@/lib/utils"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronRight, RotateCcw, Package, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/common/EmptyState"
import { InfoList, InfoRow } from "@/components/common/InfoList"
import { PageHeader } from "@/components/common/PageHeader"
import { SectionCard } from "@/components/common/SectionCard"
import { StatusBadge } from "@/components/common/StatusBadge"
import Footer from "@/components/Footer"
import { useReturn, useCancelReturn } from "@/hooks/useReturns"
import { STATUS_LABEL } from "@/services/returnApi"
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
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !ret) {
    return (
      <div className="min-h-screen bg-background pt-40">
        <EmptyState
          icon={RotateCcw}
          title="Return not found"
          action={
            <Button asChild>
              <Link to="/account/returns">Back to Returns</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const StatusIcon = STATUS_ICON[ret.status as ReturnStatus] ?? Clock
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
            <PageHeader
              className="mb-8 items-start"
              title={ret.return_number ?? `Return #${ret.id}`}
              description={requestDate
                ? `Submitted ${requestDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : undefined}
              actions={
                <StatusBadge
                  status={ret.status}
                  className="gap-1.5"
                  label={<><StatusIcon className="h-3.5 w-3.5" />{STATUS_LABEL[ret.status as ReturnStatus] ?? ret.status}</>}
                />
              }
            />

            {/* Status timeline */}
            <SectionCard title="Return Progress" className="mb-5">
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
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isRejected ? "bg-red-500/10 text-red-600"
                          : done ? "gradient-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground")}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={cn("text-[10px] font-semibold text-center", isRejected ? "text-red-600"
                          : done ? "text-primary"
                          : "text-muted-foreground")}>
                          {isRejected ? "Rejected" : STATUS_LABEL[s]}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={cn("flex-1 h-0.5 mx-2 mb-5 rounded-full", currentIdx > stepIdx ? "bg-primary" : "bg-border")} />
                      )}
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            <div className="grid md:grid-cols-5 gap-5">
              {/* Items */}
              <SectionCard className="md:col-span-3" title={`Return Items (${ret.items?.length ?? 0})`}>
                <div className="space-y-3">
                  {(ret.items ?? []).map((item, i) => (
                    <Item key={i} variant="outline" className="flex-nowrap items-start gap-3 p-3">
                      <ItemMedia variant="icon">
                        <Package />
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0">
                        <ItemTitle>{item.product_name ?? `Product #${item.product_id}`}</ItemTitle>
                        {item.variant_name && <ItemDescription className="text-xs">{item.variant_name}</ItemDescription>}
                        <ItemDescription className="text-xs">Qty: {item.quantity}</ItemDescription>
                        <ItemDescription className="text-xs">Reason: {item.reason}</ItemDescription>
                      </ItemContent>
                      {item.price != null && (
                        <ItemActions>
                          <p className="font-semibold text-sm tabular-nums">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </ItemActions>
                      )}
                    </Item>
                  ))}
                </div>
              </SectionCard>

              {/* Details sidebar */}
              <div className="md:col-span-2 space-y-4">
                {/* Return info */}
                <SectionCard title="Return Details">
                  <InfoList className="gap-2.5">
                    {ret.order_number && (
                      <InfoRow label="Order" value={<span className="font-mono">{ret.order_number}</span>} />
                    )}
                    <InfoRow
                      label="Refund via"
                      value={ret.refund_method ? (REFUND_METHOD_LABEL[ret.refund_method] ?? ret.refund_method) : "—"}
                    />
                    {ret.total_amount != null && (
                      <>
                        <Separator />
                        <InfoRow
                          label={<span className="font-semibold text-foreground">Total</span>}
                          value={<span className="font-semibold tabular-nums">{formatCurrency(ret.total_amount)}</span>}
                        />
                      </>
                    )}
                  </InfoList>
                </SectionCard>

                {/* Notes */}
                {ret.notes && (
                  <SectionCard title="Your Notes">
                    <p className="text-sm text-muted-foreground">{ret.notes}</p>
                  </SectionCard>
                )}

                {/* Processed info */}
                {processedDate && (
                  <SectionCard title="Processed">
                    <p className="text-sm text-muted-foreground">
                      {processedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    {ret.processed_by && <p className="text-xs text-muted-foreground mt-0.5">by {ret.processed_by}</p>}
                  </SectionCard>
                )}
              </div>
            </div>

            {/* Rejection reason */}
            {ret.status === "rejected" && ret.rejection_reason && (
              <Alert variant="destructive" className="mt-5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Return Rejected</AlertTitle>
                <AlertDescription>{ret.rejection_reason}</AlertDescription>
              </Alert>
            )}

            {/* Approved info */}
            {ret.status === "approved" && (
              <Alert className="mt-5">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Return Approved</AlertTitle>
                <AlertDescription>
                  Your refund via <strong>{ret.refund_method ? (REFUND_METHOD_LABEL[ret.refund_method] ?? ret.refund_method) : "selected method"}</strong> is being processed. You will be contacted once completed.
                </AlertDescription>
              </Alert>
            )}

            {/* Footer actions */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button asChild variant="ghost">
                <Link to="/account/returns">← Back to Returns</Link>
              </Button>
              {isPending && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? <Spinner /> : <XCircle className="h-4 w-4" />}
                  Cancel Request
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
