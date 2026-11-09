import { Minus, Plus, Trash2 } from "lucide-react";
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
  sm: { box: "h-9 text-sm", btn: "size-9", icon: "h-4 w-4" },
  md: { box: "h-11 text-base", btn: "size-11", icon: "h-4 w-4" },
  lg: { box: "h-14 text-xl", btn: "size-14", icon: "h-5 w-5" },
} as const;

const BTN =
  "flex shrink-0 items-center justify-center rounded-full transition-transform hover:bg-primary-foreground/15 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground/80 disabled:pointer-events-none disabled:opacity-40";

/** Green [− qty +] pill: the template's quick-buy control. The count is announced as it changes. */
export default function QtyStepper({ quantity, onIncrement, onDecrement, name, max, size = "md", className }: QtyStepperProps) {
  const s = SIZES[size];
  const atMax = max != null && max > 0 && quantity >= max;
  return (
    <div role="group" aria-label={`Quantity of ${name}`} className={cn("flex items-center justify-between rounded-pill bg-primary font-body text-primary-foreground", s.box, className)}>
      <button
        type="button"
        onClick={onDecrement}
        aria-label={quantity <= 1 ? `Remove ${name} from cart` : `One less ${name}`}
        className={cn(BTN, s.btn)}
      >
        {quantity <= 1 ? <Trash2 className={s.icon} aria-hidden="true" /> : <Minus className={s.icon} strokeWidth={3} aria-hidden="true" />}
      </button>
      <span className="min-w-[1.5ch] text-center font-extrabold tabular-nums" aria-live="polite" aria-atomic="true">
        {quantity}
        <span className="sr-only"> in cart</span>
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={atMax}
        aria-label={atMax ? `No more ${name} in stock` : `One more ${name}`}
        className={cn(BTN, s.btn)}
      >
        <Plus className={s.icon} strokeWidth={3} aria-hidden="true" />
      </button>
    </div>
  );
}
