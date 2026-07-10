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
    <button
      type="button"
      onClick={() => onChange(option.id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/30"
      } ${className}`}
    >
      {/* Icon Circle */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          selected
            ? "gradient-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{option.label}</p>
        <p className="text-xs text-muted-foreground">{option.description}</p>
      </div>

      {/* Price & Timeline */}
      <div className="text-right shrink-0">
        <p className="font-display font-bold text-sm text-foreground">
          {formatCurrency(option.price)}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
          <Clock className="h-3 w-3" />
          {option.days}
        </p>
      </div>

      {/* Selection Radio */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? "border-primary" : "border-muted-foreground/30"
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
    </button>
  );
}
