import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface QtyStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Product name for screen-reader labels */
  name: string;
  /** Stock limit; + is disabled at it */
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { box: "h-8 text-sm", btn: "w-8", icon: "h-3.5 w-3.5" },
  md: { box: "h-11 text-base", btn: "w-11", icon: "h-4 w-4" },
  lg: { box: "h-12 text-lg", btn: "w-12", icon: "h-5 w-5" },
} as const;

const BTN =
  "flex h-full shrink-0 items-center justify-center transition-colors hover:bg-primary-foreground/15 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground disabled:pointer-events-none disabled:opacity-40";

/** Green [− qty +] control: what the "+ Add" button becomes once the item is in the cart. */
export default function QtyStepper({ quantity, onIncrement, onDecrement, name, max, size = "md", className }: QtyStepperProps) {
  const { t } = useTranslation();
  const s = SIZES[size];
  const atMax = max != null && max > 0 && quantity >= max;
  return (
    <div role="group" aria-label={t("tpl_fresh:stepper.quantityOf", { name })} className={cn("flex items-center justify-between overflow-hidden rounded-pill bg-primary font-body text-primary-foreground", s.box, className)}>
      <button type="button" onClick={onDecrement} aria-label={quantity <= 1 ? t("tpl_fresh:stepper.removeFromCart", { name }) : t("tpl_fresh:stepper.oneLess", { name })} className={cn(BTN, s.btn)}>
        {quantity <= 1 ? <Trash2 className={s.icon} aria-hidden="true" /> : <Minus className={s.icon} strokeWidth={3} aria-hidden="true" />}
      </button>
      <span className="min-w-[1.5ch] text-center font-bold tabular-nums" aria-live="polite" aria-atomic="true">
        {quantity}
        <span className="sr-only"> {t("tpl_fresh:stepper.inCart")}</span>
      </span>
      <button type="button" onClick={onIncrement} disabled={atMax} aria-label={atMax ? t("tpl_fresh:stepper.noMore", { name }) : t("tpl_fresh:stepper.oneMore", { name })} className={cn(BTN, s.btn)}>
        <Plus className={s.icon} strokeWidth={3} aria-hidden="true" />
      </button>
    </div>
  );
}
