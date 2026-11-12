import { cn } from "@/lib/utils"
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, Home, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Trans, useTranslation } from "react-i18next";

const MotionCard = motion.create(Card);

type ResultStatus = "success" | "fail" | "cancel";

const CONFIG: Record<ResultStatus, {
  icon: typeof CheckCircle2;
  iconClass: string;
  titleKey: string;
  messageKey: string;
}> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-500",
    titleKey: "checkout:result.successTitle",
    messageKey: "checkout:result.successMessage",
  },
  fail: {
    icon: XCircle,
    iconClass: "text-red-500",
    titleKey: "checkout:result.failTitle",
    messageKey: "checkout:result.failMessage",
  },
  cancel: {
    icon: AlertCircle,
    iconClass: "text-amber-500",
    titleKey: "checkout:result.cancelTitle",
    messageKey: "checkout:result.cancelMessage",
  },
};

export default function OrderResult() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const { t } = useTranslation();

  const rawStatus = params.get("status") ?? "fail";
  const status: ResultStatus = rawStatus in CONFIG ? (rawStatus as ResultStatus) : "fail";
  const invoice   = params.get("invoice");
  const reason    = params.get("reason");
  const isDeposit = params.get("deposit") === "1";

  const { icon: Icon, iconClass, titleKey, messageKey } = CONFIG[status];

  const title   = isDeposit && status === "success" ? t("checkout:result.depositTitle") : t(titleKey);
  const message = isDeposit && status === "success"
    ? t("checkout:result.depositMessage")
    : t(messageKey);

  return (
    <div className="min-h-screen bg-muted/30 pt-32 pb-16 flex items-start justify-center px-4">
      <MotionCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 text-center"
      >
        <div className="flex justify-center mb-5">
          {isDeposit && status === "success"
            ? <Truck className="h-16 w-16 text-amber-500" />
            : <Icon className={cn("h-16 w-16", iconClass)} />
          }
        </div>

        <h1 className="font-display font-bold text-2xl text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-1">{message}</p>

        {isDeposit && status === "success" && (
          <Alert className="mt-3 text-left">
            <AlertDescription>{t("checkout:result.depositNote")}</AlertDescription>
          </Alert>
        )}

        {invoice && (
          <p className="text-xs text-muted-foreground mt-3">
            <Trans
              i18nKey="checkout:result.order"
              values={{ invoice }}
              components={{ b: <span className="font-semibold text-foreground" /> }}
            />
          </p>
        )}

        {reason === "order_not_found" && (
          <p className="text-xs text-destructive mt-2">{t("checkout:result.notFound")}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {status === "success" && invoice ? (
            <Button
              onClick={() => navigate(`/account/orders`)}
              className="flex-1"
            >
              <ShoppingBag className="h-4 w-4" /> {t("checkout:result.viewOrders")}
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/checkout")}
              className="flex-1"
            >
              <ShoppingBag className="h-4 w-4" /> {t("common:actions.retry")}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1"
          >
            <Home className="h-4 w-4" /> {t("common:nav.home")}
          </Button>
        </div>
      </MotionCard>
    </div>
  );
}
