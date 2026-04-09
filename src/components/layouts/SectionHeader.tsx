interface SectionHeaderProps {
  /**
   * Main title of the section
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Text alignment (default: "left")
   */
  align?: "left" | "center" | "right";

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * SectionHeader Component
 *
 * Provides consistent section title styling across the application.
 * Used for "Shop by Category", "Featured Products", etc.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Shop by Category"
 *   description="Browse our curated collection"
 *   align="center"
 * />
 * ```
 */
export default function SectionHeader({
  title,
  description,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <div className={`mb-8 ${alignClass} ${className}`}>
      <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2 tracking-tight">
        {title}
      </h2>

      {description && (
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
