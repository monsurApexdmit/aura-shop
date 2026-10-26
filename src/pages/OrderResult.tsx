import { cn } from "@/lib/utils"
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, Home, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

const MotionCard = motion.create(Card);

type ResultStatus = "success" | "fail" | "cancel";

const CONFIG: Record<ResultStatus, {
  icon: typeof CheckCircle2;
  iconClass: string;
  title: string;
  message: string;
}> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-500",
    title: "Payment Successful!",
    message: "Your payment was confirmed and your order is being processed.",
  },
  fail: {
    icon: XCircle,
    iconClass: "text-red-500",
    title: "Payment Failed",
    message: "Your payment could not be completed. No amount was charged. Please try again.",
  },
  cancel: {
    icon: AlertCircle,
    iconClass: "text-amber-500",
    title: "Payment Cancelled",
    message: "You cancelled the payment. Your order has not been placed.",
  },
};

export default function OrderResult() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();

  const rawStatus = params.get("status") ?? "fail";
  const status: ResultStatus = rawStatus in CONFIG ? (rawStatus as ResultStatus) : "fail";
  const invoice   = params.get("invoice");
  const reason    = params.get("reason");
  const isDeposit = params.get("deposit") === "1";

  const { icon: Icon, iconClass, title: baseTitle, message: baseMessage } = CONFIG[status];

  const title   = isDeposit && status === "success" ? "Shipping Deposit Paid!" : baseTitle;
  const message = isDeposit && status === "success"
    ? "Your shipping deposit was received. Your order is confirmed — pay the remaining balance on delivery."
    : baseMessage;

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
            <AlertDescription>Pay the rest of your order amount when it arrives at your door.</AlertDescription>
          </Alert>
        )}

        {invoice && (
          <p className="text-xs text-muted-foreground mt-3">
            Order: <span className="font-semibold text-foreground">{invoice}</span>
          </p>
        )}

        {reason === "order_not_found" && (
          <p className="text-xs text-destructive mt-2">Order not found. Contact support if you were charged.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {status === "success" && invoice ? (
            <Button
              onClick={() => navigate(`/account/orders`)}
              className="flex-1"
            >
              <ShoppingBag className="h-4 w-4" /> View Orders
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/checkout")}
              className="flex-1"
            >
              <ShoppingBag className="h-4 w-4" /> Try Again
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1"
          >
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>
      </MotionCard>
    </div>
  );
}
