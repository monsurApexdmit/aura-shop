import { AccentText } from "@/components/common/AccentText";
import { cn } from "@/lib/utils";

/** Centred section title: small eyebrow, big rounded headline with an *accent* word. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  invert = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
  /** On ink backgrounds */
  invert?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto mb-8 max-w-2xl text-center md:mb-12", className)}>
      {eyebrow && (
        <p className={cn("mb-3 text-xs font-bold uppercase tracking-[0.18em]", invert ? "text-highlight-soft" : "text-highlight")}>{eyebrow}</p>
      )}
      <h2 id={id} className={cn("text-balance font-display text-[1.65rem] font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl", invert ? "text-ink-foreground" : "text-foreground")}>
        <AccentText text={title} accentClassName={cn("not-italic", invert ? "text-highlight-soft" : "text-highlight")} />
      </h2>
      {subtitle && <p className={cn("mt-3 text-base sm:text-lg", invert ? "text-ink-foreground/70" : "text-muted-foreground")}>{subtitle}</p>}
    </div>
  );
}
