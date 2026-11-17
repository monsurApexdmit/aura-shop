import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Home, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOCUS, FOCUS_ON_INK, isFeaturedBadge } from "./lib";

/** Logo (or a house mark) beside the store name in the serif face. `onInk` for navy surfaces. */
export function Brand({ logo, storeName, onInk = false, className }: { logo: string | null; storeName: string; onInk?: boolean; className?: string }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const showLogo = !!logo && !failed;
  return (
    <Link to="/" aria-label={t("tpl_luxe:brand.home", { store: storeName })} className={cn("flex min-w-0 items-center gap-2.5 rounded-md", onInk ? FOCUS_ON_INK : FOCUS, className)}>
      {showLogo ? (
        <img src={logo} alt="" onError={() => setFailed(true)} className="h-9 w-auto max-w-[120px] shrink-0 object-contain" />
      ) : (
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", onInk ? "bg-ink-foreground/10 text-highlight" : "bg-ink text-highlight")} aria-hidden="true">
          <Home className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
      )}
      <span className={cn("truncate font-display text-lg font-semibold leading-none sm:text-xl", onInk ? "text-ink-foreground" : "text-foreground", showLogo && "hidden sm:inline")}>
        {storeName}
      </span>
    </Link>
  );
}

/** Gold dash + spaced eyebrow, serif title, optional subtitle and a "View all" pill. */
export function SectionHeading({ id, eyebrow, title, subtitle, link, linkLabel, className }: { id: string; eyebrow: string; title: ReactNode; subtitle?: string; link?: string; linkLabel?: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-8", className)}>
      <div className="min-w-0 max-w-2xl">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-6 bg-highlight" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-2 font-display text-[1.65rem] font-semibold leading-tight text-foreground sm:text-[2rem]">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className={cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-pill border border-border bg-card px-4 text-sm font-semibold text-foreground card-shadow transition-colors hover:border-primary hover:text-primary", FOCUS)}>
          {linkLabel ?? t("common:actions.viewAll")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Small uppercase pill over listing photos. */
export function BadgePill({ text, className }: { text: string; className?: string }) {
  const featured = isFeaturedBadge(text);
  return (
    <span className={cn(
      "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-wider shadow-sm",
      featured ? "bg-highlight text-highlight-foreground" : "bg-card/95 text-primary",
      className,
    )}>
      {featured && <Star className="h-3 w-3 fill-current" aria-hidden="true" />}
      {text}
    </span>
  );
}

/** Count bubble on header and tab-bar icons. */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span className={cn("absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground ring-2 ring-card", className)}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Decorative skyline drawn when there is no photo (hero, CTA band, empty tiles). */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <rect x="10" y="90" width="50" height="110" />
        <rect x="70" y="40" width="60" height="160" />
        <rect x="140" y="110" width="40" height="90" />
        <rect x="190" y="20" width="70" height="180" />
        <rect x="270" y="70" width="45" height="130" />
        <polygon points="325,200 325,95 370,60 415,95 415,200" />
        <rect x="425" y="50" width="55" height="150" />
        <rect x="490" y="100" width="40" height="100" />
        <rect x="540" y="30" width="55" height="170" />
      </g>
    </svg>
  );
}
