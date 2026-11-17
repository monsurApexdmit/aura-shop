import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LANGUAGES, chooseLanguage } from "@/i18n";

interface LanguageSwitcherProps {
  /** "icon": globe button (headers); "full": icon + language name (menus, footers) */
  variant?: "icon" | "full";
  className?: string;
  /** Extra classes for the menu, e.g. a z-index above a sheet */
  contentClassName?: string;
  align?: "start" | "center" | "end";
}

/** Language picker shared by every store template. Shoppers' choice is remembered in the browser. */
export function LanguageSwitcher({ variant = "icon", className, contentClassName, align = "end" }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const current = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("common:language.switchTo")} (${current.label})`}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          variant === "icon" ? "h-10 min-w-10 px-2" : "h-10 px-3",
          className,
        )}
      >
        <Languages className="h-[18px] w-[18px]" aria-hidden="true" />
        {variant === "icon" ? (
          <span className="text-xs font-semibold">{current.short}</span>
        ) : (
          <span>{current.label}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("min-w-[9rem]", contentClassName)}>
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            lang={l.code}
            onSelect={() => chooseLanguage(l.code)}
            className="flex items-center justify-between gap-3"
          >
            {l.label}
            {l.code === current.code && <Check className="h-4 w-4" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
