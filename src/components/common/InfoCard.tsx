import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  /**
   * Icon component to display (from lucide-react)
   */
  icon: LucideIcon;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description: string;

  /**
   * Optional badge text (e.g., "Free", "New")
   */
  badge?: string;

  /**
   * Optional badge color variant
   */
  badgeVariant?: "default" | "accent" | "primary";

  /**
   * Optional action element
   */
  action?: ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * InfoCard Component
 *
 * Displays information with an icon, title, description, and optional badge.
 * Used for features display, delivery info, and info sections.
 *
 * @example
 * ```tsx
 * <InfoCard
 *   icon={Truck}
 *   title="Free Shipping"
 *   description="On orders over $50"
 *   badge="Limited Time"
 *   badgeVariant="accent"
 * />
 * ```
 */
export default function InfoCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeVariant = "default",
  action,
  className = "",
}: InfoCardProps) {
  const badgeColorClass = {
    default: "bg-muted text-foreground",
    accent: "bg-accent text-accent-foreground",
    primary: "bg-primary text-primary-foreground",
  }[badgeVariant];

  return (
    <div
      className={`flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors ${className}`}
    >
      <div className="mb-4 p-3 rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground text-sm md:text-base">
          {title}
        </h3>

        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {badge && (
        <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${badgeColorClass}`}>
          {badge}
        </div>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
