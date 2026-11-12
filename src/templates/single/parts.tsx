import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiCategory } from "@/services/categoryApi";
import { FOCUS, LOGO_COLOURS, categoryIcon, categoryImage, tone } from "./lib";

/** Count bubble on header and tab-bar icons. */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span className={cn("absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold leading-none text-highlight-foreground ring-2 ring-card", className)} aria-hidden="true">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Five small stars; decorative (callers give the rating as text). */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-px", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("h-3 w-3", i < Math.round(rating) ? "fill-[hsl(40_95%_52%)] text-[hsl(40_95%_52%)]" : "fill-border text-border")} />
      ))}
    </span>
  );
}

/** Store logo image, else the store name in chunky letters that cycle the brand colours. */
export function Brand({ logo, storeName, tagline, size = "md", className }: { logo: string | null; storeName: string; tagline?: string; size?: "sm" | "md"; className?: string }) {
  const { t } = useTranslation();
  const name = storeName || t("tpl_single:brand.store");
  return (
    <Link to="/" aria-label={t("tpl_single:brand.home", { store: name })} className={cn("flex min-w-0 flex-col justify-center rounded-xl", FOCUS, className)}>
      {logo ? (
        <img src={logo} alt="" className={cn("w-auto object-contain", size === "sm" ? "h-8 max-w-[130px]" : "h-9 max-w-[150px] sm:h-10 sm:max-w-[190px]")} />
      ) : (
        <span className={cn("truncate font-display font-bold uppercase leading-none tracking-wide", size === "sm" ? "text-xl" : "text-[22px] sm:text-[28px]")} aria-hidden="true">
          {Array.from(name).map((ch, i) => (
            <span key={i} className={ch.trim() ? LOGO_COLOURS[i % LOGO_COLOURS.length] : undefined}>{ch}</span>
          ))}
        </span>
      )}
      {tagline && <span className="mt-0.5 hidden truncate text-[11px] font-semibold text-primary sm:block">{tagline}</span>}
    </Link>
  );
}

/** Section title with a small icon, and a "View all" link on the right. */
export function SectionHeader({ id, title, Icon, iconClassName, to, linkLabel }: { id: string; title: string; Icon?: LucideIcon; iconClassName?: string; to?: string; linkLabel?: string }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
      <h2 id={id} className="flex min-w-0 items-center gap-2 font-display text-[22px] font-semibold leading-tight text-foreground sm:text-[26px]">
        <span className="truncate">{title}</span>
        {Icon && <Icon className={cn("h-5 w-5 shrink-0", iconClassName ?? "text-highlight")} aria-hidden="true" />}
      </h2>
      {to && (
        <Link to={to} className={cn("flex shrink-0 items-center gap-1 rounded-pill text-sm font-bold text-primary hover:underline", FOCUS)}>
          {linkLabel ?? t("common:actions.viewAll")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** A category's photo in a pastel circle, or its icon when there is none (or it fails). */
export function CategoryBubble({ category, index, className, iconClassName }: { category: Pick<ApiCategory, "name" | "image">; index: number; className?: string; iconClassName?: string }) {
  const [failed, setFailed] = useState(false);
  const src = categoryImage(category);
  const tn = tone(index);
  const Icon = categoryIcon(category.name);
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full", tn.bg, className)} aria-hidden="true">
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <Icon className={cn("h-7 w-7", tn.fg, iconClassName)} strokeWidth={1.8} />
      )}
    </span>
  );
}

/**
 * Scalloped edge: a row of half circles in `var(--panel)`, sitting just outside a panel's top or bottom.
 * Set `--panel` on a parent to the panel's colour.
 */
export function Scallops({ edge }: { edge: "top" | "bottom" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-6 h-2", edge === "top" ? "bottom-full" : "top-full rotate-180")}
      style={{ background: "radial-gradient(circle at 50% 100%, var(--panel) 7.5px, transparent 8px) center bottom / 16px 8px repeat-x" }}
    />
  );
}

/** Wavy top edge for the footer and bands; fills with the current text colour. */
export function Wave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className={cn("block h-8 w-full sm:h-12", className)} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M0 34C160 6 320 0 480 14s320 44 480 42 320-34 480-46v54H0Z" />
    </svg>
  );
}

/** Rounded skeleton grid for product rows while they load. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-2">
          <div className="aspect-square animate-pulse rounded-xl bg-secondary" />
          <div className="mt-3 h-3.5 w-4/5 animate-pulse rounded-pill bg-secondary" />
          <div className="mt-2 h-3.5 w-1/2 animate-pulse rounded-pill bg-secondary" />
          <div className="mb-1 mt-4 h-7 w-full animate-pulse rounded-pill bg-secondary" />
        </div>
      ))}
    </div>
  );
}

/** Grid that every product row uses: 2 per row on phones, 3 on tablets and laptops, 6 on wide screens. */
export function ProductGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">{children}</div>;
}
