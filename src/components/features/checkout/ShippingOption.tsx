import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Clock } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface ShippingOptionData {
  id: string;
  label: string;
  price: number;
  days: string;
  icon: LucideIcon;
  description: string;
}

interface ShippingOptionProps {
  /**
   * Shipping option data
   */
  option: ShippingOptionData;

  /**
   * Whether this option is currently selected
   */
  selected: boolean;

  /**
   * Called when option is selected
   */
  onChange: (id: string) => void;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * ShippingOption Component
 *
 * Displays a single shipping option with price, delivery time, and selection.
 * Used in Checkout page for shipping method selection.
 *
 * @example
 * ```tsx
 * <ShippingOption
 *   option={shippingMethod}
 *   selected={shippingMethod.id === selectedId}
 *   onChange={setSelectedId}
 * />
 * ```
 */
export default function ShippingOption({
  option,
  selected,
  onChange,
  className = "",
}: ShippingOptionProps) {
  const Icon = option.icon;
  const { formatCurrency } = useCurrency();

  return (
    <Button
      type="button"
      variant="outline"
      role="radio"
      aria-checked={selected}
      data-state={selected ? "checked" : "unchecked"}
      onClick={() => onChange(option.id)}
      className={cn(
        "h-auto w-full justify-start gap-4 p-4 text-left whitespace-normal",
        selected && "border-primary bg-primary/5 ring-1 ring-primary",
        className,
      )}
    >
      {/* Icon Circle */}
      <span
        className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground")}
      >
        <Icon className="h-5 w-5" />
      </span>

      {/* Content */}
      <span className="flex-1 min-w-0">
        <span className="block font-medium text-sm">{option.label}</span>
        <span className="block text-xs font-normal text-muted-foreground">{option.description}</span>
      </span>

      {/* Price & Timeline */}
      <span className="text-right shrink-0">
        <span className="block font-semibold text-sm tabular-nums">
          {formatCurrency(option.price)}
        </span>
        <span className="text-xs font-normal text-muted-foreground flex items-center gap-1 justify-end">
          <Clock className="h-3 w-3" />
          {option.days}
        </span>
      </span>
    </Button>
  );
}
