import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromoTile } from "../shared/useTemplateContent";
import { FOCUS, categoryIcon, tile } from "./lib";

function TileIcon({ t, className }: { t: PromoTile; className?: string }) {
  const Icon = /deal|save|offer|sale|%/i.test(`${t.title} ${t.tag}`) ? BadgePercent : categoryIcon(`${t.title} ${t.tag}`);
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}

function Cta({ t, className }: { t: PromoTile; className?: string }) {
  if (!t.cta) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", className)}>
      {t.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </span>
  );
}

/** Tile beside the hero: a photo with a soft fade and text bottom-left, or a pastel designed tile. */
export function SideTile({ t, index }: { t: PromoTile; index: number }) {
  const [failed, setFailed] = useState(false);
  const photo = t.image && !failed ? t.image : null;
  return (
    <Link
      to={t.link}
      className={cn("group relative flex h-full min-h-[150px] flex-col justify-end overflow-hidden rounded-2xl p-4 text-ink sm:min-h-[180px] lg:min-h-0 lg:p-5", !photo && tile(index), FOCUS)}
    >
      {photo ? (
        <>
          <img src={photo} alt="" loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        </>
      ) : (
        <span aria-hidden="true" className="absolute -right-6 -top-6 flex size-40 items-center justify-center rounded-full bg-white/50 transition-transform duration-500 group-hover:scale-105">
          <TileIcon t={t} className="h-20 w-20 text-ink/70" />
        </span>
      )}
      <span className="relative">
        {t.tag && <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(142_70%_26%)]">{t.tag}</span>}
        <span className="mt-0.5 block font-display text-lg font-bold leading-tight lg:text-xl">{t.title}</span>
        <Cta t={t} className="mt-1.5 text-[hsl(142_70%_26%)]" />
      </span>
    </Link>
  );
}

/** Mid-page banner: pastel panel, text on the left, a framed photo (or icon) on the right. */
export function BannerTile({ t, index }: { t: PromoTile; index: number }) {
  const [failed, setFailed] = useState(false);
  const photo = t.image && !failed ? t.image : null;
  const accent = ["text-[hsl(212_70%_38%)]", "text-[hsl(350_65%_40%)]", "text-[hsl(28_85%_34%)]"][index % 3];
  return (
    <Link to={t.link} className={cn("group flex min-h-[132px] items-center gap-3 overflow-hidden rounded-2xl p-4 text-ink sm:p-5", tile(index + 2), FOCUS)}>
      <span className="min-w-0 flex-1">
        {t.tag && <span className={cn("block text-[10px] font-bold uppercase tracking-[0.14em]", accent)}>{t.tag}</span>}
        <span className="mt-1 block font-display text-lg font-bold leading-tight">{t.title}</span>
        {t.text && <span className="mt-1 line-clamp-2 block text-xs text-ink/70">{t.text}</span>}
        <Cta t={t} className={cn("mt-2", accent)} />
      </span>
      <span className="flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/60 sm:h-28 sm:w-36">
        {photo ? (
          <img src={photo} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <TileIcon t={t} className="h-12 w-12 text-ink/60" />
        )}
      </span>
    </Link>
  );
}
