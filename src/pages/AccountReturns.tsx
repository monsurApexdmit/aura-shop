import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { RotateCcw, ChevronRight, Plus, XCircle, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { ItemMedia } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/common/EmptyState"
import { PageHeader } from "@/components/common/PageHeader"
import { StatusBadge } from "@/components/common/StatusBadge"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { useReturns, useCancelReturn } from "@/hooks/useReturns"
import { STATUS_LABEL } from "@/services/returnApi"
import type { ReturnStatus, CustomerReturn } from "@/services/returnApi"
import { useCurrency } from "@/contexts/CurrencyContext"
import { Trans, useTranslation } from "react-i18next"
import { localeTag } from "@/i18n"

/** Error shape from the API client (axios) */
type ApiErr = { response?: { data?: { message?: string } } }

const REFUND_METHOD_KEY: Record<string, string> = {
  original_payment: "account:refundMethodShort.original_payment",
  store_credit:     "account:refundMethodShort.store_credit",
  cash:             "account:refundMethodShort.cash",
}

function ReturnCard({ ret }: { ret: CustomerReturn }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { formatCurrency } = useCurrency()
  const { mutateAsync: cancelReturn, isPending: cancelling } = useCancelReturn()

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(t("account:returns.cancelConfirm"))) return
    try {
      await cancelReturn(ret.id)
    } catch (e) {
      const err = e as ApiErr
      alert(err?.response?.data?.message ?? t("account:returns.cancelFailed"))
    }
  }

  return (
    <Card
      className="p-5 cursor-pointer transition-colors hover:bg-accent/50"
      onClick={() => navigate(`/account/returns/${ret.id}`)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ItemMedia variant="icon">
            <RotateCcw />
          </ItemMedia>
          <div>
            <p className="font-mono font-bold text-sm text-foreground">
              {ret.return_number ?? `RET-${ret.id}`}
            </p>
            {ret.order_number && (
              <p className="text-xs text-muted-foreground">{t("account:returns.order", { order: ret.order_number })}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(ret.created_at).toLocaleDateString(localeTag(), { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ret.total_amount != null && (
            <span className="font-semibold text-sm tabular-nums">
              {formatCurrency(ret.total_amount)}
            </span>
          )}
          <StatusBadge status={ret.status} label={t(`account:returnStatus.${ret.status}`, { defaultValue: STATUS_LABEL[ret.status as ReturnStatus] ?? ret.status })} />
        </div>
      </div>

      {/* Items */}
      {ret.items && ret.items.length > 0 && (
        <>
        <Separator className="my-4" />
        <div className="space-y-1.5">
          {ret.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium truncate flex-1">
                {item.product_name ?? t("account:productNumber", { id: item.product_id })}
                {item.variant_name && <span className="text-muted-foreground"> · {item.variant_name}</span>}
              </span>
              <span className="text-muted-foreground text-xs ml-4 shrink-0">{t("account:qty", { qty: item.quantity })}</span>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Refund method */}
      {ret.refund_method && (
        <p className="mt-2 text-xs text-muted-foreground">
          <Trans
            i18nKey="account:returns.refundVia"
            values={{ method: REFUND_METHOD_KEY[ret.refund_method] ? t(REFUND_METHOD_KEY[ret.refund_method]) : ret.refund_method }}
            components={{ strong: <span className="font-medium text-foreground" /> }}
          />
        </p>
      )}

      {/* Rejection reason */}
      {ret.status === "rejected" && ret.rejection_reason && (
        <Alert variant="destructive" className="mt-3">
          <AlertTitle>{t("account:returns.rejectionReason")}</AlertTitle>
          <AlertDescription>{ret.rejection_reason}</AlertDescription>
        </Alert>
      )}

      {/* Approved banner */}
      {ret.status === "approved" && (
        <Alert className="mt-3">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{t("account:returns.approvedBanner")}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Separator className="my-4" />
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link
            to={`/account/returns/${ret.id}`}
            onClick={e => e.stopPropagation()}
          >
            {t("account:returns.viewDetails")}
          </Link>
        </Button>
        {ret.status === "pending" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? <Spinner className="h-3 w-3" />
              : <XCircle className="h-3 w-3" />}
            {t("common:actions.cancel")}
          </Button>
        )}
      </div>
    </Card>
  )
}

export default function AccountReturns() {
  const { t } = useTranslation()
  const { isLoggedIn } = useAuth()
  const { data: returns, isLoading, isError } = useReturns(isLoggedIn)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">{t("common:nav.myAccount")}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{t("common:nav.returns")}</span>
            </div>

            <PageHeader
              className="mb-8"
              title={t("account:returns.title")}
              description={t("account:returns.description")}
              actions={
                <Button asChild>
                  <Link to="/account/returns/new">
                    <Plus className="h-4 w-4" />
                    {t("account:returns.newRequest")}
                  </Link>
                </Button>
              }
            />

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : isError ? (
              <EmptyState className="py-20" icon={RotateCcw} title={t("account:returns.loadError")} />
            ) : !returns || returns.length === 0 ? (
              <EmptyState
                bordered
                className="py-20"
                icon={RotateCcw}
                title={t("account:returns.empty")}
                description={t("account:returns.emptyDesc")}
                action={
                  <Button asChild>
                    <Link to="/account/returns/new">
                      <Plus className="h-4 w-4" />
                      {t("account:returns.newRequest")}
                    </Link>
                  </Button>
                }
              />
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
