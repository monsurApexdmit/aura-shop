import { Link } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FOCUS, FOCUS_ON_DARK, ON_INK_ACCENT } from "./lib";

/** Store name in two tones: all but the last word dark, the last word green ("Corner *Grocer*"). */
export function TwoToneName({ name, onInk = false, className }: { name: string; onInk?: boolean; className?: string }) {
  const words = name.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop() : null;
  return (
    <span className={cn("truncate font-display font-bold leading-none tracking-tight", onInk ? "text-ink-foreground" : "text-foreground", className)}>
      {words.join(" ")}
      {last && <span className={onInk ? ON_INK_ACCENT : "text-primary"}> {last}</span>}
    </span>
  );
}

/** Logo: the uploaded logo, else a green basket box and the two-tone name. Links home. */
export default function Brand({ storeName, logo, onInk = false, className }: { storeName: string; logo: string | null; onInk?: boolean; className?: string }) {
  const { t } = useTranslation();
  return (
    <Link to="/" aria-label={t("tpl_fresh:brand.home", { store: storeName })} className={cn("flex min-w-0 items-center gap-2.5 rounded-lg", onInk ? FOCUS_ON_DARK : FOCUS, className)}>
      {logo ? (
        <span className={cn("flex items-center", onInk && "rounded-lg bg-card p-1.5")}>
          <img src={logo} alt="" className="h-9 w-auto max-w-[150px] object-contain md:h-10 md:max-w-[180px]" />
        </span>
      ) : (
        <>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground md:size-10" aria-hidden="true">
            <ShoppingBasket className="h-5 w-5" />
          </span>
          <TwoToneName name={storeName} onInk={onInk} className="text-xl md:text-2xl" />
        </>
      )}
    </Link>
  );
}
